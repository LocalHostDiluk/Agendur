import { createAdminClient } from "@/lib/supabase/admin";
import type { createClient } from "@/lib/supabase/server";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";
import { apiError } from "@/lib/utils/api-error";

function isStorageOwnershipError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown })?.message ?? "");
  return /storage|object.*owner|owns.*object/i.test(message);
}

export async function eliminarCuentaPropietario(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const admin = createAdminClient();
  const { data: businesses, error: businessesError } = await admin
    .from("negocios")
    .select("id, desactivado_at")
    .eq("owner_id", userId);
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
    return apiError(
      "Esta operación requiere una cuenta propietaria.",
      undefined,
      {
        status: 403,
        code: "OWNER_REQUIRED",
        capture: false,
      },
    );
  }

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
    .eq("owner_id", userId)
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
      .eq("owner_id", userId)
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
    p_usuario_id: userId,
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

  return { message: "Cuenta eliminada correctamente." };
}
