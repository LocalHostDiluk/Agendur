import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

function isStorageOwnershipError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown })?.message ?? "");
  return /storage|object.*owner|owns.*object/i.test(message);
}

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return apiError("Origen no permitido.", undefined, {
      status: 403,
      code: "ORIGIN_MISMATCH",
      capture: false,
    });
  }

  if (process.env.NODE_ENV !== "test") {
    const rateLimit = await checkRateLimit(request, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
      keyPrefix: "auth:account-delete",
    });
    if (!rateLimit.success) {
      return apiError("Demasiados intentos. Intenta más tarde.", undefined, {
        status: 429,
        code: "RATE_LIMITED",
        capture: false,
      });
    }
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Confirmación inválida.", undefined, {
        status: 400,
        code: "INVALID_CONFIRMATION",
        capture: false,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return apiError("No autorizado.", undefined, {
        status: 401,
        code: "UNAUTHORIZED",
        capture: false,
      });
    }
    if ((body as { email?: unknown }).email !== user.email) {
      return apiError("El correo de confirmación no coincide.", undefined, {
        status: 400,
        code: "EMAIL_CONFIRMATION_MISMATCH",
        capture: false,
      });
    }

    const admin = createAdminClient();
    const { data: businesses, error: businessesError } = await admin
      .from("negocios")
      .select("id, desactivado_at")
      .eq("owner_id", user.id);
    if (businessesError || !businesses) {
      return apiError(businessesError, "No se pudo inventariar la cuenta.", {
        status: 503,
        code: "ACCOUNT_INVENTORY_FAILED",
      });
    }
    if (businesses.some((business) => business.desactivado_at !== null)) {
      return apiError(
        "La cuenta ya tiene una baja pendiente de revisión.",
        undefined,
        { status: 409, code: "ACCOUNT_DELETE_PENDING", capture: false },
      );
    }

    const businessIds = businesses.map((business) => business.id);
    if (businessIds.length === 0) {
      return apiError("Esta operación requiere una cuenta propietaria.", undefined, {
        status: 403, code: "OWNER_REQUIRED", capture: false,
      });
    }
    if (businessIds.length > 0) {
      const { data: subscriptions, error: subscriptionsError } = await admin
        .from("suscripciones")
        .select("negocio_id, subscription_external_id")
        .in("negocio_id", businessIds);
      if (subscriptionsError || !subscriptions) {
        return apiError(
          subscriptionsError,
          "No se pudo inventariar la facturación.",
          { status: 503, code: "ACCOUNT_INVENTORY_FAILED" },
        );
      }

      const subscriptionIds = [
        ...new Set(
          subscriptions
            .map((subscription) => subscription.subscription_external_id)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const stripe = new StripeGatewayAdapter();
      try {
        for (const subscriptionId of subscriptionIds) {
          await stripe.cancelSubscription(subscriptionId);
        }
      } catch (error) {
        return apiError(error, "No se pudo cancelar la facturación.", {
          status: 502,
          code: "STRIPE_CANCELLATION_FAILED",
        });
      }
    }

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });
    if (signOutError) {
      return apiError(signOutError, "No se pudieron cerrar las sesiones.", {
        status: 502,
        code: "SESSION_REVOCATION_FAILED",
      });
    }

    const deactivatedAt = new Date().toISOString();
    const { data: deactivated, error: deactivateError } = await admin
      .from("negocios")
      .update({ desactivado_at: deactivatedAt })
      .eq("owner_id", user.id)
      .select("id");
    const expectedIds = new Set(businessIds);
    const deactivatedIds = new Set((deactivated ?? []).map(({ id }) => id));
    const deactivationComplete =
      !deactivateError &&
      deactivatedIds.size === expectedIds.size &&
      [...expectedIds].every((id) => deactivatedIds.has(id));

    const compensate = async () => {
      const { data, error } = await admin
        .from("negocios")
        .update({ desactivado_at: null })
        .eq("owner_id", user.id)
        .eq("desactivado_at", deactivatedAt)
        .select("id");
      return (
        !error &&
        (data?.length ?? 0) === businessIds.length &&
        (data ?? []).every(({ id }) => expectedIds.has(id))
      );
    };

    if (!deactivationComplete) {
      if (!(await compensate())) {
        return apiError(
          deactivateError ?? new Error("Desactivación parcial no compensada."),
          "La baja quedó pendiente de revisión.",
          { status: 503, code: "ACCOUNT_DELETE_PENDING" },
        );
      }
      return apiError(
        deactivateError ?? new Error("No se desactivaron todos los negocios."),
        "No se pudo desactivar la cuenta.",
        { status: 503, code: "ACCOUNT_DEACTIVATION_FAILED" },
      );
    }

    const { error: deleteError } = await admin.rpc("delete_anonymized_owner", {
      p_usuario_id: user.id,
      p_negocio_ids: businessIds,
      p_desactivado_at: deactivatedAt,
    });
    if (deleteError) {
      const { data: ownership, error: ownershipError } = await admin
        .from("negocios")
        .select("id, owner_id")
        .in("id", businessIds);
      const authWasDeleted =
        !ownershipError &&
        (ownership?.length ?? 0) === businessIds.length &&
        (ownership ?? []).every(
          ({ id, owner_id }) => expectedIds.has(id) && owner_id === null,
        );

      if (!authWasDeleted) {
        if (!(await compensate())) {
          return apiError(deleteError, "La baja quedó pendiente de revisión.", {
            status: 503,
            code: "ACCOUNT_DELETE_PENDING",
          });
        }
        const storageBlocked = isStorageOwnershipError(deleteError);
        return apiError(
          deleteError,
          storageBlocked
            ? "La cuenta posee archivos que impiden completar la baja."
            : "No se pudo eliminar la cuenta.",
          {
            status: storageBlocked ? 409 : 502,
            code: storageBlocked
              ? "STORAGE_OWNERSHIP_BLOCKED"
              : "ACCOUNT_DELETE_FAILED",
          },
        );
      }
    }

    return apiSuccess({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    return apiError(error, "No se pudo eliminar la cuenta.", {
      code: "ACCOUNT_DELETE_FAILED",
      extra: { route: "DELETE /api/auth/account" },
    });
  }
}
