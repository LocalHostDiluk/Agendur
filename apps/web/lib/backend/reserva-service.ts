import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { enviarNotificacionWhatsApp } from "./whatsapp-service";
import { isCalendarDate } from "@/lib/utils/business-date";
import { getBusinessToday } from "@/lib/utils/business-date";
import type { Cita } from "@/lib/types";

export interface DisponibilidadParams {
  sucursalId: string;
  servicioId: string;
  fecha: string; // YYYY-MM-DD
  profesionalId?: string;
}

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
 * Convierte un string de hora ("HH:MM" o "HH:MM:SS") a minutos desde la medianoche.
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/**
 * Convierte minutos desde la medianoche a string de hora "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Obtiene el día de la semana (0: Domingo a 6: Sábado) a partir de una fecha "YYYY-MM-DD"
 * de forma independiente de la zona horaria local.
 */
export function getDiaSemana(fechaStr: string): number {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCDay();
}

/**
 * Calcula la disponibilidad de horarios a dos niveles (Sucursal + Profesional)
 * descontando citas agendadas y solapamientos.
 */
export async function obtenerDisponibilidad(
  params: DisponibilidadParams,
): Promise<string[]> {
  try {
    const { sucursalId, servicioId, fecha, profesionalId } = params;
    const diaSemana = getDiaSemana(fecha);

    // 1. Validar que la sucursal exista y esté activa
    const { data: sucursal, error: sucError } = await adminClient
      .from("sucursales")
      .select("id, activa")
      .eq("id", sucursalId)
      .maybeSingle();

    if (sucError || !sucursal || !sucursal.activa) {
      return [];
    }

    // 2. Nivel 1: Horario de apertura general de la sucursal
    const { data: horarioSucursal } = await adminClient
      .from("horarios_sucursal")
      .select("hora_apertura, hora_cierre, es_laborable")
      .eq("sucursal_id", sucursalId)
      .eq("dia_semana", diaSemana)
      .maybeSingle();

    if (!horarioSucursal || !horarioSucursal.es_laborable) {
      // Sucursal cerrada este día
      return [];
    }

    const sucAperturaMin = timeToMinutes(horarioSucursal.hora_apertura);
    const sucCierreMin = timeToMinutes(horarioSucursal.hora_cierre);

    // 3. Obtener el servicio y su duración
    const { data: servicio, error: servError } = await adminClient
      .from("servicios")
      .select("id, duracion_minutos, activo")
      .eq("id", servicioId)
      .maybeSingle();

    if (servError || !servicio || !servicio.activo) {
      return [];
    }

    const duracionMin = servicio.duracion_minutos || 30;

    // 4. Obtener profesionales elegibles
    let elegiblesIds: string[] = [];

    if (profesionalId) {
      // Verificar que pertenezca a la sucursal, esté activo y ofrezca el servicio
      const { data: prof } = await adminClient
        .from("profesionales")
        .select("id, sucursal_id, activo")
        .eq("id", profesionalId)
        .eq("sucursal_id", sucursalId)
        .eq("activo", true)
        .maybeSingle();

      if (!prof) return [];

      const { data: relacion } = await adminClient
        .from("profesional_servicios")
        .select("servicio_id")
        .eq("profesional_id", profesionalId)
        .eq("servicio_id", servicioId)
        .maybeSingle();

      if (!relacion) return [];
      elegiblesIds = [profesionalId];
    } else {
      // Buscar todos los profesionales activos de la sucursal que ofrecen el servicio
      const { data: rels } = await adminClient
        .from("profesional_servicios")
        .select("profesional_id, profesionales!inner(id, sucursal_id, activo)")
        .eq("servicio_id", servicioId)
        .eq("profesionales.sucursal_id", sucursalId)
        .eq("profesionales.activo", true);

      if (!rels || rels.length === 0) {
        // Fallback: si no hay asignaciones M:N, buscar profesionales de la sucursal
        const { data: profs } = await adminClient
          .from("profesionales")
          .select("id")
          .eq("sucursal_id", sucursalId)
          .eq("activo", true);

        elegiblesIds = (profs || []).map((p) => p.id);
      } else {
        elegiblesIds = rels.map((r) => r.profesional_id);
      }
    }

    if (elegiblesIds.length === 0) {
      return [];
    }

    const franjasDisponibles = new Set<string>();
    const pasoMin = Math.min(30, duracionMin); // Granularidad de saltos

    // 5. Nivel 2: Para cada profesional, evaluar su turno y descontar citas
    for (const profId of elegiblesIds) {
      const { data: horarioProf } = await adminClient
        .from("horarios_profesional")
        .select("hora_inicio, hora_fin, es_laborable")
        .eq("profesional_id", profId)
        .eq("dia_semana", diaSemana)
        .maybeSingle();

      // Si no tiene horario específico configurado, asumimos el horario de la sucursal
      const profInicioMin = horarioProf?.es_laborable
        ? timeToMinutes(horarioProf.hora_inicio)
        : horarioProf
          ? null // Si existe registro con es_laborable = false, no labora
          : sucAperturaMin;

      const profFinMin = horarioProf?.es_laborable
        ? timeToMinutes(horarioProf.hora_fin)
        : horarioProf
          ? null
          : sucCierreMin;

      if (profInicioMin === null || profFinMin === null) {
        continue;
      }

      // Intersección del horario de apertura y el turno del profesional
      const ventanaInicio = Math.max(sucAperturaMin, profInicioMin);
      const ventanaFin = Math.min(sucCierreMin, profFinMin);

      if (ventanaInicio + duracionMin > ventanaFin) {
        continue;
      }

      // Obtener citas activas de este profesional para la fecha
      const { data: citas } = await adminClient
        .from("citas")
        .select("hora_inicio, hora_fin")
        .eq("profesional_id", profId)
        .eq("fecha", fecha)
        .in("estado", ["pendiente_pago", "confirmada"]);

      const citasMin = (citas || []).map((c) => ({
        inicio: timeToMinutes(c.hora_inicio),
        fin: timeToMinutes(c.hora_fin),
      }));

      // Probar cada franja candidata
      for (
        let inicio = ventanaInicio;
        inicio + duracionMin <= ventanaFin;
        inicio += pasoMin
      ) {
        const fin = inicio + duracionMin;

        // Comprobar solapamiento: inicio < cita.fin && fin > cita.inicio
        const solapada = citasMin.some((c) => inicio < c.fin && fin > c.inicio);

        if (!solapada) {
          franjasDisponibles.add(minutesToTime(inicio));
        }
      }
    }

    return Array.from(franjasDisponibles).sort();
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: "obtenerDisponibilidad", params },
    });
    throw error;
  }
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
    .select("id, negocio_id, duracion_minutos, precio, activo, nombre")
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
  const horaFinMin = horaInicioMin + duracionMin;
  if (horaFinMin > 24 * 60) {
    throw bookingError("La cita debe terminar el mismo día.", 400, "INVALID_DATE_TIME");
  }
  const horaInicioStr = minutesToTime(horaInicioMin) + ":00";
  const horaFinStr = minutesToTime(horaFinMin) + ":00";

  // 5. Exigir un slot ofrecido; la restricción SQL resuelve las carreras posteriores.
  const horarios = await obtenerDisponibilidad({ sucursalId, servicioId, profesionalId, fecha });
  if (!horarios.includes(hora.slice(0, 5))) {
    throw bookingError("El horario seleccionado ya no está disponible.", 409, "SLOT_UNAVAILABLE");
  }

  // 6. Insertar la cita en Supabase
  const aceptadaEn = new Date().toISOString();
  const { data: nuevaCita, error: insertError } = await adminClient
    .from("citas")
    .insert({
      negocio_id: sucursal.negocio_id,
      sucursal_id: sucursalId,
      servicio_id: servicioId,
      profesional_id: profesionalId,
      cliente_nombre: clienteNombre,
      cliente_apellido: clienteApellido,
      cliente_telefono: clientePhone,
      cliente_email: clienteEmail,
      fecha,
      hora_inicio: horaInicioStr,
      hora_fin: horaFinStr,
      estado: "pendiente_pago", // RLS compliant
      precio_total: Number(servicio.precio),
      monto_anticipo_pagado: 0,
      notas_cliente: notasCliente || null,
      privacidad_aceptada_en: aceptadaEn,
      politica_cancelacion_aceptada_en: negocio.politica_cancelacion?.trim() ? aceptadaEn : null,
    })
    .select("*")
    .single();

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

  return nuevaCita as Cita;
}
