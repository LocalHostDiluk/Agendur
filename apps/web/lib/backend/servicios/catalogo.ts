import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { validarNuevoServicio, validarCambiosServicio } from "./validar-servicio";

export async function consultarServicios(access: NegocioAccess) {
  let allowedServiceIds: string[] | null = null;

  if (access.profesionalId) {
    const { data: assignments, error: assignmentError } = await adminClient
      .from("profesional_servicios")
      .select("servicio_id")
      .in("profesional_id", access.profesionalIds ?? [access.profesionalId]);
    if (assignmentError) throw assignmentError;
    allowedServiceIds = (assignments ?? []).map((item) => item.servicio_id);
    if (allowedServiceIds.length === 0) return { servicios: [] };
  }

  let query = adminClient
    .from("servicios")
    .select("*")
    .eq("negocio_id", access.negocioId);

  if (allowedServiceIds) query = query.in("id", allowedServiceIds);

  const { data: servicios, error } = await query.order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return { servicios: servicios || [] };
}

export async function crearServicio(access: NegocioAccess, body: unknown) {
  const values = validarNuevoServicio(body);
  if (values instanceof NextResponse) return values;
  const { nombre, duracion_minutos, buffer_minutos, precio, cleanDescripcion } = values;

  const { data: nuevoServicio, error: insertError } = await adminClient
    .from("servicios")
    .insert({
      negocio_id: access.negocioId,
      nombre: nombre.trim(),
      duracion_minutos,
      buffer_minutos,
      precio,
      descripcion: cleanDescripcion,
      activo: true,
    })
    .select()
    .single();

  if (insertError || !nuevoServicio) {
    throw insertError || new Error("Error al guardar el servicio.");
  }

  return { servicio: nuevoServicio };
}

export async function actualizarServicio(access: NegocioAccess, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError(
      "Campos inválidos: cuerpo de solicitud no válido.",
      undefined,
      { status: 400 },
    );
  }

  const { id } = body as Record<string, unknown>;

  if (!id || typeof id !== "string" || !id.trim()) {
    return apiError("ID de servicio requerido.", undefined, { status: 400 });
  }

  const servicioId = id.trim();

  const { data: servicioExistente, error: findError } = await adminClient
    .from("servicios")
    .select("id")
    .eq("id", servicioId)
    .eq("negocio_id", access.negocioId)
    .maybeSingle();

  if (findError || !servicioExistente) {
    return apiError(
      "Servicio no encontrado o no pertenece a este negocio.",
      undefined,
      { status: 404 },
    );
  }

  const updates = validarCambiosServicio(body as Record<string, unknown>);
  if (updates instanceof NextResponse) return updates;

  const { data: updatedServicio, error: updateError } = await adminClient
    .from("servicios")
    .update(updates)
    .eq("id", servicioId)
    .eq("negocio_id", access.negocioId)
    .select()
    .single();

  if (updateError || !updatedServicio) {
    throw updateError || new Error("Error al actualizar el servicio.");
  }

  return { servicio: updatedServicio };
}

export async function eliminarServicio(access: NegocioAccess, id: string | null) {
  if (!id || typeof id !== "string" || !id.trim()) {
    return apiError("ID de servicio requerido.", undefined, { status: 400 });
  }

  const servicioId = id.trim();

  const { data: servicioExistente, error: findError } = await adminClient
    .from("servicios")
    .select("id")
    .eq("id", servicioId)
    .eq("negocio_id", access.negocioId)
    .maybeSingle();

  if (findError || !servicioExistente) {
    return apiError(
      "Servicio no encontrado o no pertenece a este negocio.",
      undefined,
      { status: 404 },
    );
  }

  const { error: delError } = await adminClient
    .from("servicios")
    .delete()
    .eq("id", servicioId)
    .eq("negocio_id", access.negocioId);

  if (delError) {
    throw delError;
  }

  return { deleted: true };
}
