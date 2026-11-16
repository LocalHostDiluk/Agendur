import { NextRequest } from "next/server";
import { apiError } from "@/lib/utils/api-error";
import {
  NegocioAccessError,
  requireNegocioAccess,
} from "@/lib/auth/negocio-access";
import {
  consultarSuscripcionNegocio,
  procesarCambioSuscripcionNegocio,
} from "@/lib/payments/suscripcion-negocio";

/**
 * GET /api/negocio/suscripcion
 * Retorna el estado actual de la suscripción del negocio autenticado,
 * su vigencia y las métricas de consumo de sucursales y profesionales frente a sus límites.
 */
export async function GET() {
  try {
    const access = await requireNegocioAccess("billing:read");
    return await consultarSuscripcionNegocio(access.negocioId);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, {
        status: error.status,
        code: error.code,
      });
    }
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "GET /api/negocio/suscripcion" },
    });
  }
}

/**
 * POST /api/negocio/suscripcion
 * Inicia el cambio o adquisición de un plan:
 * - Si es pasarela manual/transferencia/efectivo: registra solicitud de pago pendiente (requiere confirmación admin).
 * - Si es Stripe: genera una sesión de Checkout para pago con tarjeta recurrente.
 */
export async function POST(req: NextRequest) {
  try {
    const access = await requireNegocioAccess("billing:write");
    return await procesarCambioSuscripcionNegocio(req, {
      negocioId: access.negocioId,
      userEmail: access.user.email ?? "",
    });
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, {
        status: error.status,
        code: error.code,
      });
    }
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "POST /api/negocio/suscripcion" },
    });
  }
}
