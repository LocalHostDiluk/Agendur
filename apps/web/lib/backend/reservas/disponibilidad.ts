import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import {
  calcularFranjasDisponibles,
  getDiaSemana,
  intersectarVentanas,
  resolverExcepciones,
  timeToMinutes,
} from "./calculo-disponibilidad";

export interface DisponibilidadParams {
  sucursalId: string;
  servicioId: string;
  fecha: string; // YYYY-MM-DD
  profesionalId?: string;
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
      .select("id, activa, negocios!inner(id)")
      .eq("id", sucursalId)
      .is("negocios.desactivado_at", null)
      .maybeSingle();

    if (sucError || !sucursal || !sucursal.activa) {
      return [];
    }

    // 2. Nivel 1: horario semanal o bloques especiales de la sucursal.
    const { data: horarioSucursal, error: horarioSucursalError } = await adminClient
      .from("horarios_sucursal")
      .select("hora_apertura, hora_cierre, es_laborable")
      .eq("sucursal_id", sucursalId)
      .eq("dia_semana", diaSemana)
      .maybeSingle();

    const { data: excepcionesSucursal, error: excepcionesSucursalError } = await adminClient
      .from("excepciones_horario_sucursal")
      .select("cerrado, hora_apertura, hora_cierre")
      .eq("sucursal_id", sucursalId)
      .eq("fecha", fecha);

    if (horarioSucursalError || excepcionesSucursalError) {
      throw horarioSucursalError || excepcionesSucursalError;
    }

    const ventanasSucursal =
      resolverExcepciones(
        excepcionesSucursal,
        "hora_apertura",
        "hora_cierre",
      ) ??
      (horarioSucursal?.es_laborable
        ? [
            {
              inicio: timeToMinutes(horarioSucursal.hora_apertura),
              fin: timeToMinutes(horarioSucursal.hora_cierre),
            },
          ]
        : []);

    if (ventanasSucursal.length === 0) return [];

    // 3. Obtener el servicio y su duración
    const { data: servicio, error: servError } = await adminClient
      .from("servicios")
      .select("id, duracion_minutos, buffer_minutos, activo")
      .eq("id", servicioId)
      .maybeSingle();

    if (servError || !servicio || !servicio.activo) {
      return [];
    }

    const duracionMin = servicio.duracion_minutos || 30;
    const bufferMin = servicio.buffer_minutos ?? 0;

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

    // 5. Nivel 2: Para cada profesional, evaluar su turno y descontar citas
    for (const profId of elegiblesIds) {
      const { data: horarioProf, error: horarioProfError } = await adminClient
        .from("horarios_profesional")
        .select("hora_inicio, hora_fin, es_laborable")
        .eq("profesional_id", profId)
        .eq("dia_semana", diaSemana)
        .maybeSingle();

      const { data: excepcionesProf, error: excepcionesProfError } = await adminClient
        .from("excepciones_horario_profesional")
        .select("cerrado, hora_inicio, hora_fin")
        .eq("profesional_id", profId)
        .eq("fecha", fecha);

      if (horarioProfError || excepcionesProfError) {
        throw horarioProfError || excepcionesProfError;
      }

      const ventanasProfesional =
        resolverExcepciones(excepcionesProf, "hora_inicio", "hora_fin") ??
        (horarioProf
          ? horarioProf.es_laborable
            ? [
                {
                  inicio: timeToMinutes(horarioProf.hora_inicio),
                  fin: timeToMinutes(horarioProf.hora_fin),
                },
              ]
            : []
          : ventanasSucursal);

      const ventanas = intersectarVentanas(
        ventanasSucursal,
        ventanasProfesional,
      );
      if (ventanas.length === 0) continue;

      // Obtener citas activas de este profesional para la fecha
      const { data: citas, error: citasError } = await adminClient
        .from("citas")
        .select("hora_inicio, hora_fin_buffer")
        .eq("profesional_id", profId)
        .eq("fecha", fecha)
        .in("estado", ["pendiente_pago", "confirmada"]);

      if (citasError) throw citasError;

      const citasMin = (citas || []).map((c) => ({
        inicio: timeToMinutes(c.hora_inicio),
        fin: timeToMinutes(c.hora_fin_buffer),
      }));

      // Probar cada franja candidata dentro de cada intersección.
      for (const franja of calcularFranjasDisponibles(ventanas, citasMin, duracionMin, bufferMin)) {
        franjasDisponibles.add(franja);
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
