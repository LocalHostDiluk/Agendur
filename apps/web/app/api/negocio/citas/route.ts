import { NextRequest, NextResponse } from "next/server";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
  type NegocioCapability,
} from "@/lib/auth/negocio-access";
import {
  actualizarEstadoCitaNegocio,
  consultarCitasNegocio,
} from "@/lib/backend/reservas/citas-negocio";

/**
 * Valida autenticación del usuario, existencia del negocio y vigencia de la suscripción.
 */
async function getAuthenticatedNegocio(
  capability: NegocioCapability,
): Promise<NegocioAccess> {
  const access = await requireNegocioAccess(capability);
  await assertActiveSubscription(access.negocioId);
  return access;
}

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, {
    status: error.status,
    code: error.code,
  });
}

/**
 * GET /api/negocio/citas
 * Retorna las citas pertenecientes al negocio autenticado, con filtros opcionales.
 */
export async function GET(request: NextRequest | Request): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("appointments:read");
    const url = new URL(request.url);
    const result = await consultarCitasNegocio(access, {
      sucursalId: url.searchParams.get("sucursalId"),
      fechaInicio: url.searchParams.get("fechaInicio"),
      fechaFin: url.searchParams.get("fechaFin"),
      estado: url.searchParams.get("estado"),
    });
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error al obtener las citas del negocio.", {
      extra: { route: "GET /api/negocio/citas" },
    });
  }
}

/**
 * PATCH /api/negocio/citas
 * Actualiza el estado de una cita perteneciente al negocio autenticado.
 */
export async function PATCH(request: NextRequest | Request): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("appointments:write");
    const body: unknown = await request.json().catch(() => ({}));
    const result = await actualizarEstadoCitaNegocio(access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error al actualizar la cita.", {
      extra: { route: "PATCH /api/negocio/citas" },
    });
  }
}
