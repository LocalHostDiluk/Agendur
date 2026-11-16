import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { eliminarCuentaPropietario } from "@/lib/backend/auth/eliminar-cuenta";

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

    const result = await eliminarCuentaPropietario(supabase, user.id);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error) {
    return apiError(error, "No se pudo eliminar la cuenta.", {
      code: "ACCOUNT_DELETE_FAILED",
      extra: { route: "DELETE /api/auth/account" },
    });
  }
}
