import { NextRequest, NextResponse } from "next/server";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
  type NegocioCapability,
} from "@/lib/auth/negocio-access";
import { parseProfessionalSchedule } from "@/lib/schedules/professional";
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

async function resolveProfessional(
  access: NegocioAccess,
  professionalId: string,
) {
  const allowedProfessionals = access.profesionalIds ??
    (access.profesionalId ? [access.profesionalId] : null);
  if (allowedProfessionals && !allowedProfessionals.includes(professionalId)) return null;

  const admin = createAdminClient();
  const { data: professional, error } = await admin
    .from("profesionales")
    .select("id, sucursal_id")
    .eq("id", professionalId)
    .maybeSingle();
  if (error) throw error;
  if (!professional) return null;

  const allowedBranches = access.sucursalIds ??
    (access.sucursalId ? [access.sucursalId] : null);
  if (allowedBranches && !allowedBranches.includes(professional.sucursal_id)) return null;

  const { data: branch, error: branchError } = await admin
    .from("sucursales")
    .select("id")
    .eq("id", professional.sucursal_id)
    .eq("negocio_id", access.negocioId)
    .maybeSingle();
  if (branchError) throw branchError;
  return branch ? professional : null;
}

async function authorize(capability: NegocioCapability, professionalId: string) {
  const access = await requireNegocioAccess(capability);
  return (await resolveProfessional(access, professionalId)) ? access : null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const professionalId = request.nextUrl.searchParams.get("profesionalId");
    if (!professionalId || !UUID.test(professionalId)) {
      return apiError("Profesional inválido.", undefined, { status: 400 });
    }
    if (!(await authorize("branches:read", professionalId))) {
      return apiError("Profesional no encontrado.", undefined, { status: 404 });
    }

    const { data, error } = await createAdminClient()
      .from("horarios_profesional")
      .select("dia_semana, hora_inicio, hora_fin")
      .eq("profesional_id", professionalId)
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
      return apiError("Horario semanal inválido.", undefined, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const professionalId = input.profesionalId;
    const schedules = parseProfessionalSchedule(input.horarios);
    if (typeof professionalId !== "string" || !UUID.test(professionalId) || !schedules) {
      return apiError("Horario semanal inválido.", undefined, {
        status: 400,
        code: "INVALID_WEEKLY_SCHEDULE",
      });
    }
    if (!(await authorize("branches:write", professionalId))) {
      return apiError("Profesional no encontrado.", undefined, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: profData } = await admin
      .from("profesionales")
      .select("sucursal_id")
      .eq("id", professionalId)
      .maybeSingle();

    if (profData?.sucursal_id) {
      const { data: branchHours } = await admin
        .from("horarios_sucursal")
        .select("dia_semana, hora_apertura, hora_cierre, es_laborable")
        .eq("sucursal_id", profData.sucursal_id)
        .eq("es_laborable", true);

      if (branchHours && branchHours.length > 0) {
        for (const h of schedules) {
          const branchDay = branchHours.find((b) => b.dia_semana === h.dia_semana);
          if (!branchDay) {
            return apiError(
              `La sucursal no tiene horario de atención para el día seleccionado (${h.dia_semana}).`,
              undefined,
              { status: 400, code: "BRANCH_DAY_NOT_AVAILABLE" },
            );
          }
          const ap = branchDay.hora_apertura.slice(0, 5);
          const ci = branchDay.hora_cierre.slice(0, 5);
          if (h.hora_inicio < ap || h.hora_fin > ci) {
            return apiError(
              `El horario (${h.hora_inicio} a ${h.hora_fin}) debe estar dentro de la jornada de la sucursal (${ap} a ${ci}).`,
              undefined,
              { status: 400, code: "SCHEDULE_OUT_OF_BOUNDS" },
            );
          }
        }
      }
    }

    const { data, error } = await admin.rpc(
      "replace_professional_schedule",
      { p_profesional_id: professionalId, p_horarios: schedules },
    );
    if (error) throw error;
    return apiSuccess({ horarios: data ?? [] });
  } catch (error) {
    return accessFailure(error) ?? apiError(error, "No se pudo guardar el horario semanal.");
  }
}
