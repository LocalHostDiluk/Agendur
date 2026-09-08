import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { enviarNotificacionWhatsApp } from "./whatsapp-service";
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
  clienteApellido?: string;
  clientePhone: string;
  clienteEmail: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // "HH:MM" o "HH:MM:SS"
  notasCliente?: string;
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
  params: DisponibilidadParams
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
        .neq("estado", "cancelada");

      const citasMin = (citas || []).map((c) => ({
        inicio: timeToMinutes(c.hora_inicio),
        fin: timeToMinutes(c.hora_fin),
      }));

      // Probar cada franja candidata
      for (let inicio = ventanaInicio; inicio + duracionMin <= ventanaFin; inicio += pasoMin) {
        const fin = inicio + duracionMin;

        // Comprobar solapamiento: inicio < cita.fin && fin > cita.inicio
        const solapada = citasMin.some(
          (c) => inicio < c.fin && fin > c.inicio
        );

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
  input: CrearReservaInput
): Promise<Cita> {
  try {
    const {
      sucursalId,
      servicioId,
      profesionalId,
      clienteNombre,
      clienteApellido = "",
      clientePhone,
      clienteEmail,
      fecha,
      hora,
      notasCliente,
    } = input;

    // 1. Validaciones básicas de campos
    if (!clienteNombre || !clientePhone || !sucursalId || !servicioId || !profesionalId || !fecha || !hora) {
      throw new Error("Todos los campos principales de reserva son obligatorios.");
    }

    // 2. Obtener sucursal para negocio_id
    const { data: sucursal, error: sucErr } = await adminClient
      .from("sucursales")
      .select("id, negocio_id, activa, nombre")
      .eq("id", sucursalId)
      .single();

    if (sucErr || !sucursal || !sucursal.activa) {
      throw new Error("La sucursal seleccionada no existe o no está activa.");
    }

    // 3. Obtener servicio oficial para duración y precio legítimo (evita manipulación en frontend)
    const { data: servicio, error: servErr } = await adminClient
      .from("servicios")
      .select("id, duracion_minutos, precio, activo, nombre")
      .eq("id", servicioId)
      .single();

    if (servErr || !servicio || !servicio.activo) {
      throw new Error("El servicio seleccionado no existe o no está activo.");
    }

    // 4. Calcular hora_fin
    const horaInicioMin = timeToMinutes(hora);
    const duracionMin = servicio.duracion_minutos || 30;
    const horaFinMin = horaInicioMin + duracionMin;
    const horaInicioStr = minutesToTime(horaInicioMin) + ":00";
    const horaFinStr = minutesToTime(horaFinMin) + ":00";

    // 5. Prevenir sobreventa / colisión concurrente (Double-Booking Check)
    const { data: citasSolapadas, error: checkErr } = await adminClient
      .from("citas")
      .select("id")
      .eq("profesional_id", profesionalId)
      .eq("fecha", fecha)
      .neq("estado", "cancelada")
      .lt("hora_inicio", horaFinStr)
      .gt("hora_fin", horaInicioStr);

    if (checkErr) {
      throw new Error(`Error verificando disponibilidad de horario: ${checkErr.message}`);
    }

    if (citasSolapadas && citasSolapadas.length > 0) {
      const err = new Error("El horario seleccionado ya ha sido reservado por otro cliente.");
      (err as unknown as { status: number }).status = 409;
      throw err;
    }

    // 6. Insertar la cita en Supabase
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
      })
      .select("*")
      .single();

    if (insertError || !nuevaCita) {
      throw new Error(`Error al registrar la cita en Supabase: ${insertError?.message || "Sin datos"}`);
    }

    // 7. Disparar notificación por WhatsApp (en segundo plano)
    enviarNotificacionWhatsApp({
      telefono: clientePhone,
      mensaje: `¡Hola ${clienteNombre}! Tu cita para "${servicio.nombre}" en ${sucursal.nombre} ha sido agendada para el ${fecha} a las ${minutesToTime(horaInicioMin)} hrs.`,
      negocioNombre: sucursal.nombre,
    }).catch((waErr) => {
      Sentry.captureException(waErr, { extra: { context: "crearReservaCita.whatsapp", citaId: nuevaCita.id } });
    });

    return nuevaCita as Cita;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: "crearReservaCita", input },
    });
    throw error;
  }
}
