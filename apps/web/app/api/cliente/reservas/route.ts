import { NextRequest, NextResponse } from "next/server";
import { crearReservaCita } from "@/lib/backend/reserva-service";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { checkRateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/cliente/reservas
 * Crea una reserva de cita validando disponibilidad y previniendo sobreventa.
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "test") {
      const limit = await checkRateLimit(request, {
        limit: 20,
        windowMs: 10 * 60 * 1000,
        keyPrefix: "cliente:reservas",
      });
      if (!limit.success) {
        return NextResponse.json(
          { success: false, ok: false, code: "RATE_LIMITED", error: "Demasiados intentos de reserva. Intenta más tarde." },
          { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((limit.resetTime - Date.now()) / 1000))) } },
        );
      }
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Datos de reserva inválidos.", undefined, { status: 400 });
    }
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
      aceptaPrivacidad,
      aceptaPoliticaCancelacion,
    } = body as Record<string, unknown>;

    // Validar campos requeridos
    if (
      !sucursalId || !servicioId || !profesionalId ||
      !clienteNombre || !clienteApellido || !fecha || !hora
    ) {
      return apiError(
        "Campos requeridos faltantes: sucursalId, servicioId, profesionalId, clienteNombre, clienteApellido, fecha, hora.",
        undefined,
        { status: 400, code: "MISSING_REQUIRED_FIELDS" },
      );
    }

    if ([sucursalId, servicioId, profesionalId].some((id) => typeof id !== "string" || !id.trim()) ||
        typeof clienteNombre !== "string" || !clienteNombre.trim() || clienteNombre.trim().length > 100 ||
        typeof clienteApellido !== "string" || !clienteApellido.trim() || clienteApellido.trim().length > 100 ||
        (clientePhone !== undefined && clientePhone !== null &&
          (typeof clientePhone !== "string" || (clientePhone.trim() && !/^\+?[1-9]\d{7,14}$/.test(clientePhone.trim())))) ||
        (clienteEmail !== undefined && clienteEmail !== null &&
          (typeof clienteEmail !== "string" || (clienteEmail.trim() &&
            (clienteEmail.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail.trim()))))) ||
        (notasCliente !== undefined && notasCliente !== null &&
          (typeof notasCliente !== "string" || notasCliente.length > 2000))) {
      return apiError("Datos de reserva inválidos.", undefined, { status: 400, code: "INVALID_BOOKING_DATA" });
    }

    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
        Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) ||
        new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) !== fecha) {
      return apiError(
        "La fecha debe ser válida y usar YYYY-MM-DD.",
        undefined,
        { status: 400, code: "INVALID_DATE_FORMAT" },
      );
    }
    if (typeof hora !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(hora)) {
      return apiError("La hora debe ser válida y usar HH:MM.", undefined, { status: 400, code: "INVALID_TIME_FORMAT" });
    }
    if (aceptaPrivacidad !== true) {
      return apiError("Debes aceptar el aviso de privacidad.", undefined, { status: 400, code: "PRIVACY_CONSENT_REQUIRED" });
    }

    const nuevaCita = await crearReservaCita({
      sucursalId: sucursalId as string,
      servicioId: servicioId as string,
      profesionalId: profesionalId as string,
      clienteNombre: clienteNombre.trim(),
      clienteApellido: clienteApellido.trim(),
      clientePhone: typeof clientePhone === "string" ? clientePhone.trim() : null,
      clienteEmail: typeof clienteEmail === "string" ? clienteEmail.trim() : null,
      fecha,
      hora,
      notasCliente: typeof notasCliente === "string" ? notasCliente.trim() : null,
      aceptaPrivacidad,
      aceptaPoliticaCancelacion: aceptaPoliticaCancelacion === true,
    });

    return apiSuccess({ cita: nuevaCita }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error al procesar la reservación.", {
      extra: { route: "POST /api/cliente/reservas" },
    });
  }
}
