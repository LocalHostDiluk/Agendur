import { adminClient } from "@/lib/supabase/admin";
import {
  assertActiveSubscription,
  SubscriptionExpiredError,
} from "@/lib/payments/guards";
import { apiError } from "@/lib/utils/api-error";
import type {
  ProfesionalConServicios,
  ListarProfesionalesParams,
  CrearProfesionalParams,
  ActualizarProfesionalParams,
  ServiceResult,
} from "./types";

/**
 * Consulta la lista de profesionales del negocio autenticado, aplicando filtros
 * opcionales de sucursal y estado activo, y adjuntando sus servicios asignados.
 */
export async function listarProfesionales(
  params: ListarProfesionalesParams,
): Promise<ServiceResult<ProfesionalConServicios[]>> {
  const { sucursalIds, filterSucursalId, filterActivo } = params;

  if (sucursalIds.length === 0) {
    return { ok: true, data: [] };
  }

  let targetSucursalIds = sucursalIds;
  if (filterSucursalId) {
    if (!sucursalIds.includes(filterSucursalId)) {
      return { ok: true, data: [] };
    }
    targetSucursalIds = [filterSucursalId];
  }

  let query = adminClient
    .from("profesionales")
    .select("*")
    .in("sucursal_id", targetSucursalIds)
    .order("nombre", { ascending: true });

  if (filterActivo !== null && filterActivo !== undefined) {
    query = query.eq("activo", filterActivo === "true");
  }

  const { data: profesionales, error } = await query;
  if (error) {
    throw error;
  }

  const profsList = profesionales || [];
  if (profsList.length === 0) {
    return { ok: true, data: [] };
  }

  const profIds = profsList.map((p) => p.id);
  const { data: relaciones, error: relError } = await adminClient
    .from("profesional_servicios")
    .select("profesional_id, servicio_id")
    .in("profesional_id", profIds);

  if (relError) {
    throw relError;
  }

  const serviciosMap = new Map<string, string[]>();
  (relaciones || []).forEach((rel) => {
    const current = serviciosMap.get(rel.profesional_id) || [];
    current.push(rel.servicio_id);
    serviciosMap.set(rel.profesional_id, current);
  });

  const resultado: ProfesionalConServicios[] = profsList.map((p) => ({
    ...p,
    serviciosIds: serviciosMap.get(p.id) || [],
  }));

  return { ok: true, data: resultado };
}

/**
 * Registra un nuevo profesional verificando suscripción activa, cuota del plan
 * y asociando en lote los servicios correspondientes.
 */
export async function crearProfesional(
  params: CrearProfesionalParams,
): Promise<ServiceResult<ProfesionalConServicios>> {
  const { negocioId, sucursalIds, data } = params;

  // Validar suscripción activa
  let suscripcion;
  try {
    suscripcion = await assertActiveSubscription(negocioId);
  } catch (subErr) {
    if (subErr instanceof SubscriptionExpiredError) {
      return {
        ok: false,
        error: apiError(subErr.message, undefined, {
          status: 402,
          code: subErr.code,
        }),
      };
    }
    throw subErr;
  }

  // Validar límite de profesionales del plan si se registra como activo
  if (data.activo !== false) {
    const { count: profActivosCount, error: countError } = await adminClient
      .from("profesionales")
      .select("id", { count: "exact", head: true })
      .in("sucursal_id", sucursalIds)
      .eq("activo", true);

    if (countError) {
      throw countError;
    }

    const totalActivos = profActivosCount || 0;
    if (totalActivos >= suscripcion.limite_profesionales) {
      return {
        ok: false,
        error: apiError(
          `Has alcanzado el límite de ${suscripcion.limite_profesionales} profesionales de tu plan. Actualiza tu suscripción para registrar más personal.`,
          undefined,
          { status: 409, code: "LIMIT_EXCEEDED" },
        ),
      };
    }
  }

  // Validar y sanitizar servicios asignados pertenecientes al negocio
  const cleanServiciosIds: string[] = [];
  if (data.serviciosIds.length > 0) {
    const { data: serviciosNegocio, error: servError } = await adminClient
      .from("servicios")
      .select("id")
      .eq("negocio_id", negocioId)
      .in("id", data.serviciosIds);

    if (servError) {
      throw servError;
    }

    (serviciosNegocio || []).forEach((s) => cleanServiciosIds.push(s.id));
  }

  // Insertar profesional
  const { data: nuevoProfesional, error: insertError } = await adminClient
    .from("profesionales")
    .insert({
      sucursal_id: data.sucursal_id,
      nombre: data.nombre,
      apellido: data.apellido,
      cargo: data.cargo,
      email: data.email,
      telefono: data.telefono,
      avatar_url: data.avatar_url,
      activo: data.activo,
    })
    .select()
    .single();

  if (insertError || !nuevoProfesional) {
    throw insertError || new Error("Error al guardar el profesional.");
  }

  // Insertar relaciones con servicios si existen
  if (cleanServiciosIds.length > 0) {
    const rows = cleanServiciosIds.map((sId) => ({
      profesional_id: nuevoProfesional.id,
      servicio_id: sId,
    }));

    const { error: relInsertError } = await adminClient
      .from("profesional_servicios")
      .insert(rows);

    if (relInsertError) {
      console.error("Error al asignar servicios al profesional:", relInsertError);
    }
  }

  return {
    ok: true,
    data: {
      ...nuevoProfesional,
      serviciosIds: cleanServiciosIds,
    },
  };
}

/**
 * Actualiza los datos de un profesional, maneja reactivaciones validando cuota del plan
 * y sincroniza de forma diferencial sus servicios asignados.
 */
export async function actualizarProfesional(
  params: ActualizarProfesionalParams,
): Promise<ServiceResult<ProfesionalConServicios>> {
  const { negocioId, sucursalIds, id, updates, serviciosIds } = params;

  if (sucursalIds.length === 0) {
    return {
      ok: false,
      error: apiError(
        "Profesional no encontrado o no pertenece a este negocio.",
        undefined,
        { status: 404 },
      ),
    };
  }

  // Verificar existencia y pertenencia del profesional al negocio
  const { data: profesionalExistente, error: findError } = await adminClient
    .from("profesionales")
    .select("*")
    .eq("id", id)
    .in("sucursal_id", sucursalIds)
    .maybeSingle();

  if (findError || !profesionalExistente) {
    return {
      ok: false,
      error: apiError(
        "Profesional no encontrado o no pertenece a este negocio.",
        undefined,
        { status: 404 },
      ),
    };
  }

  // Si se reactiva un profesional previamente inactivo, verificar límite de suscripción
  if (updates.activo === true && profesionalExistente.activo === false) {
    let suscripcion;
    try {
      suscripcion = await assertActiveSubscription(negocioId);
    } catch (subErr) {
      if (subErr instanceof SubscriptionExpiredError) {
        return {
          ok: false,
          error: apiError(subErr.message, undefined, {
            status: 402,
            code: subErr.code,
          }),
        };
      }
      throw subErr;
    }

    const { count: profActivosCount, error: countError } = await adminClient
      .from("profesionales")
      .select("id", { count: "exact", head: true })
      .in("sucursal_id", sucursalIds)
      .eq("activo", true);

    if (countError) throw countError;

    const totalActivos = profActivosCount || 0;
    if (totalActivos >= suscripcion.limite_profesionales) {
      return {
        ok: false,
        error: apiError(
          `No puedes reactivar a este profesional porque has alcanzado el límite de ${suscripcion.limite_profesionales} profesionales de tu plan.`,
          undefined,
          { status: 409, code: "LIMIT_EXCEEDED" },
        ),
      };
    }
  }

  // Actualizar datos del profesional si hay campos modificados
  let profesionalActualizado = profesionalExistente;
  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await adminClient
      .from("profesionales")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Error al actualizar el profesional.");
    }
    profesionalActualizado = updated;
  }

  // Sincronizar servicios asignados si se enviaron
  let serviciosFinales: string[] = [];
  if (serviciosIds !== undefined) {
    const { data: serviciosNegocio, error: servError } = await adminClient
      .from("servicios")
      .select("id")
      .eq("negocio_id", negocioId)
      .in("id", serviciosIds);

    if (servError) throw servError;

    serviciosFinales = (serviciosNegocio || []).map((s) => s.id);

    // Eliminar asignaciones actuales
    const { error: delError } = await adminClient
      .from("profesional_servicios")
      .delete()
      .eq("profesional_id", id);

    if (delError) throw delError;

    // Insertar nuevas asignaciones si existen
    if (serviciosFinales.length > 0) {
      const rows = serviciosFinales.map((sId) => ({
        profesional_id: id,
        servicio_id: sId,
      }));

      const { error: insertRelError } = await adminClient
        .from("profesional_servicios")
        .insert(rows);

      if (insertRelError) throw insertRelError;
    }
  } else {
    // Si no se pasaron serviciosIds, consultar los existentes para la respuesta
    const { data: rels } = await adminClient
      .from("profesional_servicios")
      .select("servicio_id")
      .eq("profesional_id", id);

    serviciosFinales = (rels || []).map((r) => r.servicio_id);
  }

  return {
    ok: true,
    data: {
      ...profesionalActualizado,
      serviciosIds: serviciosFinales,
    },
  };
}
