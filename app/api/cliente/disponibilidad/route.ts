import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { obtenerDisponibilidad } from "@/lib/backend/reserva-service";

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
      return NextResponse.json(
        {
          success: false,
          error: "Los parámetros sucursalId, servicioId y fecha (YYYY-MM-DD) son requeridos.",
        },
        { status: 400 }
      );
    }

    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return NextResponse.json(
        {
          success: false,
          error: "El formato de fecha debe ser YYYY-MM-DD.",
        },
        { status: 400 }
      );
    }

    const horarios = await obtenerDisponibilidad({
      sucursalId,
      servicioId,
      fecha,
      profesionalId,
    });

    return NextResponse.json({
      success: true,
      sucursalId,
      servicioId,
      fecha,
      profesionalId: profesionalId || null,
      horarios,
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      extra: { route: "GET /api/cliente/disponibilidad" },
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al consultar disponibilidad.",
      },
      { status: 500 }
    );
  }
}
