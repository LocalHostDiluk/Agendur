import { NextRequest } from "next/server";
import { obtenerDisponibilidad } from "@/lib/backend/reserva-service";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

/**
 * GET /api/cliente/disponibilidad?sucursalId=...&servicioId=...&fecha=YYYY-MM-DD[&profesionalId=...]
 * Retorna las franjas horarias libres calculadas a 2 niveles.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId");
    const servicioId = searchParams.get("servicioId");
    const fecha = searchParams.get("fecha");
    const profesionalId = searchParams.get("profesionalId") || undefined;

    if (!sucursalId || !servicioId || !fecha) {
      return apiError(
        "Los parámetros sucursalId, servicioId y fecha (YYYY-MM-DD) son requeridos.",
        undefined,
        { status: 400, code: "MISSING_REQUIRED_PARAMS" }
      );
    }

    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return apiError(
        "El formato de fecha debe ser YYYY-MM-DD.",
        undefined,
        { status: 400, code: "INVALID_DATE_FORMAT" }
      );
    }

    const horarios = await obtenerDisponibilidad({
      sucursalId,
      servicioId,
      fecha,
      profesionalId,
    });

    return apiSuccess({
      sucursalId,
      servicioId,
      fecha,
      profesionalId: profesionalId || null,
      horarios,
    });
  } catch (error: unknown) {
    return apiError(error, "Error al consultar disponibilidad.", {
      extra: { route: "GET /api/cliente/disponibilidad" },
    });
  }
}
