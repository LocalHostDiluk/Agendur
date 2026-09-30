import { NextRequest, NextResponse } from "next/server";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
} from "@/lib/auth/negocio-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

type ResourceType = "sucursal" | "profesional";
type TimeBlock = { inicio: string; fin: string };

export interface SpecialScheduleInput {
  tipo: ResourceType;
  recursoId: string;
  fecha: string;
  cerrado: boolean;
  motivo: string | null;
  bloques: TimeBlock[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function parseSpecialSchedule(value: unknown): SpecialScheduleInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    (input.tipo !== "sucursal" && input.tipo !== "profesional") ||
    typeof input.recursoId !== "string" ||
    !UUID.test(input.recursoId) ||
    !validDate(input.fecha) ||
    typeof input.cerrado !== "boolean" ||
    !Array.isArray(input.bloques)
  ) return null;

  const motivo = input.motivo == null ? null : typeof input.motivo === "string" ? input.motivo.trim() : null;
  if ((input.motivo != null && motivo === null) || (motivo?.length ?? 0) > 200) return null;

  const bloques = input.bloques.map((block) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return null;
    const candidate = block as Record<string, unknown>;
    return typeof candidate.inicio === "string" && TIME.test(candidate.inicio) &&
      typeof candidate.fin === "string" && TIME.test(candidate.fin) &&
      candidate.inicio < candidate.fin
      ? { inicio: candidate.inicio, fin: candidate.fin }
      : null;
  });
  if (bloques.some((block) => block === null)) return null;
  const sorted = (bloques as TimeBlock[]).sort((a, b) => a.inicio.localeCompare(b.inicio));
  if (input.cerrado ? sorted.length !== 0 : sorted.length === 0) return null;
  if (sorted.some((block, index) => index > 0 && sorted[index - 1].fin > block.inicio)) return null;

  return {
    tipo: input.tipo,
    recursoId: input.recursoId,
    fecha: input.fecha,
    cerrado: input.cerrado,
    motivo: motivo || null,
    bloques: sorted,
  };
}

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, { status: error.status, code: error.code });
}

async function resolveResource(
  access: NegocioAccess,
  tipo: ResourceType,
  recursoId: string,
): Promise<{ branchId: string } | null> {
  const admin = createAdminClient();
  let branchId = recursoId;
  if (tipo === "profesional") {
    const { data, error } = await admin.from("profesionales")
      .select("id, sucursal_id").eq("id", recursoId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    branchId = data.sucursal_id;
  }
  const { data: branch, error: branchError } = await admin.from("sucursales")
    .select("id").eq("id", branchId).eq("negocio_id", access.negocioId).maybeSingle();
  if (branchError) throw branchError;
  if (!branch) return null;

  const allowedBranches = access.sucursalIds ?? (access.sucursalId ? [access.sucursalId] : null);
  if (allowedBranches && !allowedBranches.includes(branchId)) return null;
  const allowedProfessionals = access.profesionalIds ?? (access.profesionalId ? [access.profesionalId] : null);
  if (tipo === "profesional" && allowedProfessionals && !allowedProfessionals.includes(recursoId)) return null;
  return { branchId };
}

function queryInput(request: NextRequest) {
  const tipo = request.nextUrl.searchParams.get("tipo");
  const recursoId = request.nextUrl.searchParams.get("recursoId");
  const fecha = request.nextUrl.searchParams.get("fecha");
  return (tipo === "sucursal" || tipo === "profesional") && recursoId && UUID.test(recursoId)
    ? { tipo, recursoId, fecha: fecha && validDate(fecha) ? fecha : null }
    : null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("branches:read");
    const input = queryInput(request);
    if (!input) return apiError("Parámetros de horario inválidos.", undefined, { status: 400 });
    if (!(await resolveResource(access, input.tipo, input.recursoId))) {
      return apiError("Recurso no encontrado.", undefined, { status: 404 });
    }
    const admin = createAdminClient();
    const table = input.tipo === "sucursal" ? "excepciones_horario_sucursal" : "excepciones_horario_profesional";
    const resourceColumn = input.tipo === "sucursal" ? "sucursal_id" : "profesional_id";
    const columns = input.tipo === "sucursal"
      ? "id, fecha, cerrado, hora_apertura, hora_cierre, motivo"
      : "id, fecha, cerrado, hora_inicio, hora_fin, motivo";
    let query = admin.from(table).select(columns)
      .eq(resourceColumn, input.recursoId).order("fecha", { ascending: true });
    if (input.fecha) query = query.eq("fecha", input.fecha);
    const { data, error } = await query;
    if (error) throw error;
    return apiSuccess({
      excepciones: (data ?? []).map((row) => ({
        id: row.id,
        fecha: row.fecha,
        cerrado: row.cerrado,
        inicio: "hora_apertura" in row ? row.hora_apertura : row.hora_inicio,
        fin: "hora_cierre" in row ? row.hora_cierre : row.hora_fin,
        motivo: row.motivo,
      })),
    });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudieron consultar los horarios especiales.");
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("branches:write");
    const input = parseSpecialSchedule(await request.json().catch(() => null));
    if (!input) return apiError("Horario especial inválido.", undefined, { status: 400, code: "INVALID_SPECIAL_SCHEDULE" });
    if (!(await resolveResource(access, input.tipo, input.recursoId))) {
      return apiError("Recurso no encontrado.", undefined, { status: 404 });
    }
    const { data, error } = await createAdminClient().rpc("replace_special_schedule", {
      p_tipo: input.tipo,
      p_recurso_id: input.recursoId,
      p_fecha: input.fecha,
      p_cerrado: input.cerrado,
      p_motivo: input.motivo,
      p_bloques: input.bloques,
    });
    if (error) throw error;
    return apiSuccess({ excepciones: data ?? [] });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudo guardar el horario especial.");
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("branches:write");
    const input = queryInput(request);
    if (!input?.fecha) return apiError("Parámetros de horario inválidos.", undefined, { status: 400 });
    if (!(await resolveResource(access, input.tipo, input.recursoId))) {
      return apiError("Recurso no encontrado.", undefined, { status: 404 });
    }
    const admin = createAdminClient();
    const table = input.tipo === "sucursal" ? "excepciones_horario_sucursal" : "excepciones_horario_profesional";
    const resourceColumn = input.tipo === "sucursal" ? "sucursal_id" : "profesional_id";
    const { error } = await admin.from(table).delete().eq(resourceColumn, input.recursoId).eq("fecha", input.fecha);
    if (error) throw error;
    return apiSuccess({ deleted: true });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudo eliminar el horario especial.");
  }
}
