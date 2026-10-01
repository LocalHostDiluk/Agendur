import { NextRequest, NextResponse } from "next/server";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
} from "@/lib/auth/negocio-access";
import { parseBranchSchedule } from "@/lib/schedules/professional";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, {
    status: error.status,
    code: error.code,
  });
}

async function branchBelongsToAccess(access: NegocioAccess, branchId: string) {
  const allowedBranches = access.sucursalIds ??
    (access.sucursalId ? [access.sucursalId] : null);
  if (allowedBranches && !allowedBranches.includes(branchId)) return false;

  const { data, error } = await createAdminClient()
    .from("sucursales")
    .select("id")
    .eq("id", branchId)
    .eq("negocio_id", access.negocioId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const branchId = request.nextUrl.searchParams.get("sucursalId");
    if (!branchId || !UUID.test(branchId)) {
      return apiError("Sucursal inválida.", undefined, { status: 400 });
    }
    const access = await requireNegocioAccess("branches:read");
    if (!(await branchBelongsToAccess(access, branchId))) {
      return apiError("Sucursal no encontrada.", undefined, { status: 404 });
    }

    const { data, error } = await createAdminClient()
      .from("horarios_sucursal")
      .select("dia_semana, hora_apertura, hora_cierre")
      .eq("sucursal_id", branchId)
      .eq("es_laborable", true)
      .order("dia_semana", { ascending: true });
    if (error) throw error;
    return apiSuccess({ horarios: data ?? [] });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudo consultar el horario semanal.");
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Horario semanal inválido.", undefined, {
        status: 400,
        code: "INVALID_WEEKLY_SCHEDULE",
      });
    }
    const input = body as Record<string, unknown>;
    const branchId = input.sucursalId;
    const schedules = parseBranchSchedule(input.horarios);
    if (typeof branchId !== "string" || !UUID.test(branchId) || !schedules) {
      return apiError("Horario semanal inválido.", undefined, {
        status: 400,
        code: "INVALID_WEEKLY_SCHEDULE",
      });
    }

    const access = await requireNegocioAccess("branches:write");
    if (!(await branchBelongsToAccess(access, branchId))) {
      return apiError("Sucursal no encontrada.", undefined, { status: 404 });
    }

    const { data, error } = await createAdminClient().rpc(
      "replace_branch_schedule",
      { p_sucursal_id: branchId, p_horarios: schedules },
    );
    if (error) throw error;
    return apiSuccess({ horarios: data ?? [] });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudo guardar el horario semanal.");
  }
}
