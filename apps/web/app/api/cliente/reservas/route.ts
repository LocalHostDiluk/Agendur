import { NextRequest } from "next/server";
import { crearReservaCita } from "@/lib/backend/reserva-service";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

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
      return apiError(
        new Error("Campos requeridos faltantes: sucursalId, servicioId, profesionalId, clienteNombre, clientePhone, clienteEmail, fecha, hora."),
        "Campos requeridos faltantes: sucursalId, servicioId, profesionalId, clienteNombre, clientePhone, clienteEmail, fecha, hora.",
        { status: 400, code: "MISSING_REQUIRED_FIELDS" },
      );
    }

    // Validar formato de fecha YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return apiError(
        new Error("El formato de fecha debe ser YYYY-MM-DD."),
        "El formato de fecha debe ser YYYY-MM-DD.",
        { status: 400, code: "INVALID_DATE_FORMAT" },
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

    return apiSuccess({ cita: nuevaCita }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error al procesar la reservación.", {
      extra: { route: "POST /api/cliente/reservas" },
    });
  }
}
