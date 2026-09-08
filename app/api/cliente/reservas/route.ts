import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { crearReservaCita } from "@/lib/backend/reserva-service";

/**
 * POST /api/cliente/reservas
 * Crea una reserva de cita validando disponibilidad y previniendo sobreventa.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      sucursalId,
      servicioId,
      profesionalId,
      clienteNombre,
      clienteApellido,
      clientePhone,
      clienteEmail,
      fecha,
      hora,
      notasCliente,
    } = body;

    // Validar campos requeridos
    if (
      !sucursalId ||
      !servicioId ||
      !profesionalId ||
      !clienteNombre ||
      !clientePhone ||
      !clienteEmail ||
      !fecha ||
      !hora
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Campos requeridos faltantes: sucursalId, servicioId, profesionalId, clienteNombre, clientePhone, clienteEmail, fecha, hora.",
        },
        { status: 400 }
      );
    }

    // Validar formato de fecha YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json(
        { success: false, error: "El formato de fecha debe ser YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const nuevaCita = await crearReservaCita({
      sucursalId,
      servicioId,
      profesionalId,
      clienteNombre,
      clienteApellido,
      clientePhone,
      clienteEmail,
      fecha,
      hora,
      notasCliente,
    });

    return NextResponse.json(
      { success: true, cita: nuevaCita },
      { status: 201 }
    );
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status || 500;
    const errorMessage =
      error instanceof Error ? error.message : "Error al procesar reserva";

    Sentry.captureException(error, {
      extra: { route: "POST /api/cliente/reservas" },
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
