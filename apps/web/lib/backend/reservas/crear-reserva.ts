import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { enviarNotificacionWhatsApp } from "../whatsapp-service";
import { isCalendarDate, getBusinessToday } from "@/lib/utils/business-date";
import type { Cita } from "@/lib/types";
import { minutesToTime, timeToMinutes } from "./calculo-disponibilidad";
import { obtenerDisponibilidad } from "./disponibilidad";

export interface CrearReservaInput {
  sucursalId: string;
  servicioId: string;
  profesionalId: string;
  clienteNombre: string;
  clienteApellido: string;
  clientePhone: string | null;
  clienteEmail: string | null;
  fecha: string; // YYYY-MM-DD
  hora: string; // "HH:MM" o "HH:MM:SS"
  notasCliente?: string | null;
  aceptaPrivacidad: boolean;
  aceptaPoliticaCancelacion?: boolean;
}

function bookingError(message: string, status = 400, code = "INVALID_BOOKING_DATA") {
  return Object.assign(new Error(message), { status, code });
}

/**
 * Registra una nueva cita verificando que no exista solapamiento concurrente.
 */
export async function crearReservaCita(
  input: CrearReservaInput,
): Promise<Cita> {
  // Sin captura local: `apiError` reporta una sola vez en la frontera HTTP.
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
  } = input;

  // 1. Validaciones básicas de campos
  if (
    !clienteNombre ||
    !clienteApellido ||
    !sucursalId ||
    !servicioId ||
    !profesionalId ||
    !fecha ||
    !hora
  ) {
    throw bookingError("Todos los campos principales de reserva son obligatorios.");
  }
  if (aceptaPrivacidad !== true) {
    throw bookingError("Debes aceptar el aviso de privacidad.", 400, "PRIVACY_CONSENT_REQUIRED");
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(hora) || !isCalendarDate(fecha)) {
    throw bookingError("Fecha u hora inválidas.", 400, "INVALID_DATE_TIME");
  }

  // 2. Obtener sucursal para negocio_id
  const { data: sucursal, error: sucErr } = await adminClient
    .from("sucursales")
    .select("id, negocio_id, activa, nombre, zona_horaria")
    .eq("id", sucursalId)
    .single();

  if (sucErr || !sucursal || !sucursal.activa) {
    throw bookingError("La sucursal seleccionada no existe o no está activa.", 400, "INVALID_BOOKING_SELECTION");
  }

  await assertActiveSubscription(sucursal.negocio_id);

  const { data: negocio, error: negocioError } = await adminClient
    .from("negocios")
    .select("telefono_cliente_requerido, email_cliente_requerido, notas_cliente_habilitadas, politica_cancelacion, zona_horaria")
    .eq("id", sucursal.negocio_id)
    .is("desactivado_at", null)
    .single();
  if (negocioError || !negocio) {
    throw bookingError("No se pudo consultar la configuración de reservas.", 503, "BOOKING_CONFIG_UNAVAILABLE");
  }
  if ((negocio.telefono_cliente_requerido && !clientePhone) ||
      (negocio.email_cliente_requerido && !clienteEmail) ||
      (!clientePhone && !clienteEmail)) {
    throw bookingError("Falta un medio de contacto requerido.", 400, "CONTACT_REQUIRED");
  }
  if (notasCliente && !negocio.notas_cliente_habilitadas) {
    throw bookingError("Este negocio no acepta notas en la reserva.");
  }
  if (negocio.politica_cancelacion?.trim() && aceptaPoliticaCancelacion !== true) {
    throw bookingError("Debes aceptar la política de cancelación.", 400, "CANCELLATION_CONSENT_REQUIRED");
  }
  const timeZone = sucursal.zona_horaria || negocio.zona_horaria;
  const today = getBusinessToday(timeZone);
  if (!today) {
    throw bookingError("No se pudo determinar la fecha local del negocio.", 503, "BOOKING_TIMEZONE_UNAVAILABLE");
  }
  const nowTime = new Intl.DateTimeFormat("en-GB", {
    timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date());
  if (fecha < today || (fecha === today && hora.slice(0, 5) <= nowTime)) {
    throw bookingError("La fecha y hora de la cita deben ser futuras.", 400, "PAST_BOOKING_DATE");
  }

  // 3. Obtener servicio oficial y validar que pertenezca al mismo negocio
  const { data: servicio, error: servErr } = await adminClient
    .from("servicios")
    .select("id, negocio_id, duracion_minutos, buffer_minutos, precio, activo, nombre")
    .eq("id", servicioId)
    .single();

  if (servErr || !servicio || !servicio.activo) {
    throw bookingError("El servicio seleccionado no existe o no está activo.", 400, "INVALID_BOOKING_SELECTION");
  }

  if (servicio.negocio_id !== sucursal.negocio_id) {
    throw bookingError("El servicio no pertenece al negocio de la sucursal seleccionada.", 400, "INVALID_BOOKING_SELECTION");
  }

  // 3.1. Validar existencia, estado y pertenencia de sucursal del profesional
  const { data: profesional, error: profErr } = await adminClient
    .from("profesionales")
    .select("id, sucursal_id, activo, nombre")
    .eq("id", profesionalId)
    .single();

  if (profErr || !profesional || !profesional.activo) {
    throw bookingError("El profesional seleccionado no existe o no está activo.", 400, "INVALID_BOOKING_SELECTION");
  }

  if (profesional.sucursal_id !== sucursalId) {
    throw bookingError("El profesional seleccionado no pertenece a esta sucursal.", 400, "INVALID_BOOKING_SELECTION");
  }

  // 3.2. Validar que el profesional ofrezca el servicio
  const { data: asignacion } = await adminClient
    .from("profesional_servicios")
    .select("profesional_id")
    .eq("profesional_id", profesionalId)
    .eq("servicio_id", servicioId)
    .maybeSingle();

  if (!asignacion) {
    throw bookingError("El profesional seleccionado no ofrece el servicio solicitado.", 400, "INVALID_BOOKING_SELECTION");
  }

  // 4. Calcular hora_fin
  const horaInicioMin = timeToMinutes(hora);
  const duracionMin = servicio.duracion_minutos || 30;
  const bufferMin = servicio.buffer_minutos ?? 0;
  const horaFinMin = horaInicioMin + duracionMin;
  const horaFinBufferMin = horaFinMin + bufferMin;
  if (horaFinBufferMin >= 24 * 60) {
    throw bookingError(
      "La cita y su buffer deben terminar el mismo día.",
      400,
      "INVALID_DATE_TIME",
    );
  }
  const horaInicioStr = minutesToTime(horaInicioMin) + ":00";

  // 5. Exigir un slot ofrecido; la restricción SQL resuelve las carreras posteriores.
  const horarios = await obtenerDisponibilidad({ sucursalId, servicioId, profesionalId, fecha });
  if (!horarios.includes(hora.slice(0, 5))) {
    throw bookingError("El horario seleccionado ya no está disponible.", 409, "SLOT_UNAVAILABLE");
  }

  // 6. Comprobar el conflicto e insertar en una sola transacción PostgreSQL.
  const aceptadaEn = new Date().toISOString();
  const { data: nuevaCita, error: insertError } = await adminClient.rpc(
    "create_booking_transactional",
    {
      p_negocio_id: sucursal.negocio_id,
      p_sucursal_id: sucursalId,
      p_servicio_id: servicioId,
      p_profesional_id: profesionalId,
      p_cliente_nombre: clienteNombre,
      p_cliente_apellido: clienteApellido,
      p_cliente_telefono: clientePhone,
      p_cliente_email: clienteEmail,
      p_fecha: fecha,
      p_hora_inicio: horaInicioStr,
      p_notas_cliente: notasCliente || null,
      p_privacidad_aceptada_en: aceptadaEn,
      p_politica_cancelacion_aceptada_en: negocio.politica_cancelacion?.trim()
        ? aceptadaEn
        : null,
    },
  );

  if (insertError || !nuevaCita) {
    if (insertError?.code === "23P01") {
      throw bookingError("El horario seleccionado ya no está disponible.", 409, "SLOT_UNAVAILABLE");
    }
    // 23514: un CHECK de `citas` (contacto u horario) rechazó la fila. Es un dato
    // inválido del cliente, no un fallo del servidor.
    if (insertError?.code === "23514") {
      throw bookingError("Los datos de la reserva no son válidos.", 400, "INVALID_BOOKING_DATA");
    }
    throw new Error(
      `Error al registrar la cita en Supabase: ${insertError?.message || "Sin datos"}`,
    );
  }

  // 7. Disparar notificación por WhatsApp (en segundo plano)
  if (clientePhone) {
    enviarNotificacionWhatsApp({
      telefono: clientePhone,
      mensaje: `¡Hola ${clienteNombre}! Tu cita para "${servicio.nombre}" en ${sucursal.nombre} ha sido agendada para el ${fecha} a las ${minutesToTime(horaInicioMin)} hrs.`,
      negocioNombre: sucursal.nombre,
    }).catch((waErr) => {
      Sentry.captureException(waErr, {
        extra: { context: "crearReservaCita.whatsapp", citaId: nuevaCita.id },
      });
    });
  }

  return {
    ...nuevaCita,
    cliente_nombre: clienteNombre,
    cliente_apellido: clienteApellido,
    cliente_telefono: clientePhone,
    cliente_email: clienteEmail,
    hora_fin: nuevaCita.hora_fin_servicio,
    precio_total: nuevaCita.precio_servicio_snapshot,
  } as Cita;
}
