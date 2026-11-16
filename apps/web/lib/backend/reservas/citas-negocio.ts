import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { apiError } from "@/lib/utils/api-error";
import type { EstadoCita } from "@/lib/types";

const ESTADOS_CITA: readonly EstadoCita[] = [
  "pendiente_pago",
  "confirmada",
  "completada",
  "cancelada",
  "no_asistio",
] as const;

const ESTADOS_PATCH_PERMITIDOS = [
  "confirmada",
  "cancelada",
  "completada",
  "no_asistio",
] as const;

type EstadoPatch = (typeof ESTADOS_PATCH_PERMITIDOS)[number];

type CitaApiRow = Record<string, unknown> & {
  cliente?: {
    nombre: string;
    apellido: string | null;
    telefono: string | null;
    email: string | null;
  } | null;
};

export interface ConsultarCitasParams {
  sucursalId: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string | null;
}

const CITA_SELECT =
  "*, cliente:clientes!citas_cliente_negocio_fkey(nombre, apellido, telefono, email)";

export function citaConContratoLegacy({ cliente, ...cita }: CitaApiRow) {
  return {
    ...cita,
    cliente_nombre: cliente?.nombre ?? "",
    cliente_apellido: cliente?.apellido ?? "",
    cliente_telefono: cliente?.telefono ?? null,
    cliente_email: cliente?.email ?? null,
    hora_fin: cita.hora_fin_servicio,
    precio_total: cita.precio_servicio_snapshot,
  };
}

export async function consultarCitasNegocio(
  access: NegocioAccess,
  params: ConsultarCitasParams,
): Promise<{ citas: Array<ReturnType<typeof citaConContratoLegacy>> } | NextResponse> {
  const { sucursalId, fechaInicio, fechaFin, estado } = params;
  const branches = access.sucursalIds ?? (access.sucursalId ? [access.sucursalId] : null);
  if (branches && sucursalId && !branches.includes(sucursalId)) {
    return apiError("No tienes acceso a esa sucursal.", undefined, {
      status: 403,
      code: "BUSINESS_ACCESS_DENIED",
    });
  }
  if (estado && !ESTADOS_CITA.includes(estado as EstadoCita)) {
    return apiError("Estado de cita inválido.", undefined, {
      status: 400,
      code: "INVALID_ESTADO",
    });
  }
  if (fechaInicio && !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
    return apiError("El formato de fechaInicio debe ser YYYY-MM-DD.", undefined, {
      status: 400,
      code: "INVALID_DATE_FORMAT",
    });
  }
  if (fechaFin && !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
    return apiError("El formato de fechaFin debe ser YYYY-MM-DD.", undefined, {
      status: 400,
      code: "INVALID_DATE_FORMAT",
    });
  }

  const admin = createAdminClient();
  let query = admin.from("citas").select(CITA_SELECT).eq("negocio_id", access.negocioId);

  const scopedBranch = access.profesionalIds ? sucursalId : access.sucursalId ?? sucursalId;
  if (scopedBranch) query = query.eq("sucursal_id", scopedBranch);
  if (access.profesionalIds) {
    query = query.in("profesional_id", access.profesionalIds);
  } else if (access.profesionalId) {
    query = query.eq("profesional_id", access.profesionalId);
  }
  if (fechaInicio) query = query.gte("fecha", fechaInicio);
  if (fechaFin) query = query.lte("fecha", fechaFin);
  if (estado) query = query.eq("estado", estado);

  const { data: citas, error: citasError } = await query.order("fecha", { ascending: false });
  if (citasError) {
    return apiError(citasError, "Error al obtener las citas del negocio.", {
      extra: { route: "GET /api/negocio/citas" },
    });
  }

  return {
    citas: (citas || []).map((cita) => citaConContratoLegacy(cita as CitaApiRow)),
  };
}

export async function actualizarEstadoCitaNegocio(
  access: NegocioAccess,
  body: unknown,
): Promise<{ cita: ReturnType<typeof citaConContratoLegacy> } | NextResponse> {
  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const { citaId, nuevoEstado } = payload;

  if (!citaId || typeof citaId !== "string") {
    return apiError("El parámetro citaId es requerido.", undefined, {
      status: 400,
      code: "MISSING_CITA_ID",
    });
  }

  if (
    !nuevoEstado ||
    typeof nuevoEstado !== "string" ||
    !ESTADOS_PATCH_PERMITIDOS.includes(nuevoEstado as EstadoPatch)
  ) {
    return apiError(
      "Estado inválido. Valores permitidos: confirmada, cancelada, completada, no_asistio.",
      undefined,
      { status: 400, code: "INVALID_ESTADO" },
    );
  }

  const admin = createAdminClient();
  let existingQuery = admin
    .from("citas")
    .select("id")
    .eq("id", citaId)
    .eq("negocio_id", access.negocioId);

  if (access.sucursalId) existingQuery = existingQuery.eq("sucursal_id", access.sucursalId);
  const { data: foundCita, error: citaError } = await existingQuery.maybeSingle();

  if (citaError || !foundCita) {
    return apiError("Cita no encontrada o no pertenece a este negocio.", undefined, {
      status: 404,
      code: "CITA_NOT_FOUND",
    });
  }

  let updateQuery = admin
    .from("citas")
    .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
    .eq("id", citaId)
    .eq("negocio_id", access.negocioId);

  if (access.sucursalId) updateQuery = updateQuery.eq("sucursal_id", access.sucursalId);
  const { data: updatedCita, error: updateError } = await updateQuery.select(CITA_SELECT).single();

  if (updateError || !updatedCita) {
    return apiError(updateError, "Error al actualizar el estado de la cita.", {
      extra: { route: "PATCH /api/negocio/citas", citaId },
    });
  }

  return { cita: citaConContratoLegacy(updatedCita as CitaApiRow) };
}
