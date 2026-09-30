import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import type { EstadoCita } from "@/lib/types";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
  type NegocioCapability,
} from "@/lib/auth/negocio-access";

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

/**
 * Valida autenticación del usuario, existencia del negocio y vigencia de la suscripción.
 */
async function getAuthenticatedNegocio(capability: NegocioCapability): Promise<{
  access: NegocioAccess;
  admin: ReturnType<typeof createAdminClient>;
}> {
  const access = await requireNegocioAccess(capability);
  await assertActiveSubscription(access.negocioId);
  return { access, admin: createAdminClient() };
}

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, {
    status: error.status,
    code: error.code,
  });
}

/**
 * GET /api/negocio/citas
 * Retorna las citas pertenecientes al negocio autenticado, con filtros opcionales.
 */
export async function GET(request: NextRequest | Request): Promise<NextResponse> {
  try {
    const { access, admin } = await getAuthenticatedNegocio("appointments:read");

    const url = new URL(request.url);
    const sucursalId = url.searchParams.get("sucursalId");
    const fechaInicio = url.searchParams.get("fechaInicio");
    const fechaFin = url.searchParams.get("fechaFin");
    const estado = url.searchParams.get("estado");

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

    let query = admin
      .from("citas")
      .select("*")
      .eq("negocio_id", access.negocioId);

    const scopedBranch = access.profesionalIds ? sucursalId : access.sucursalId ?? sucursalId;
    if (scopedBranch) query = query.eq("sucursal_id", scopedBranch);
    if (access.profesionalIds) {
      query = query.in("profesional_id", access.profesionalIds);
    } else if (access.profesionalId) {
      query = query.eq("profesional_id", access.profesionalId);
    }
    if (fechaInicio) {
      query = query.gte("fecha", fechaInicio);
    }
    if (fechaFin) {
      query = query.lte("fecha", fechaFin);
    }
    if (estado) {
      query = query.eq("estado", estado);
    }

    query = query.order("fecha", { ascending: false });

    const { data: citas, error: citasError } = await query;

    if (citasError) {
      return apiError(citasError, "Error al obtener las citas del negocio.", {
        extra: { route: "GET /api/negocio/citas" },
      });
    }

    return apiSuccess({ citas: citas || [] });
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error al obtener las citas del negocio.", {
      extra: { route: "GET /api/negocio/citas" },
    });
  }
}

/**
 * PATCH /api/negocio/citas
 * Actualiza el estado de una cita perteneciente al negocio autenticado.
 */
export async function PATCH(request: NextRequest | Request): Promise<NextResponse> {
  try {
    const { access, admin } = await getAuthenticatedNegocio("appointments:write");

    const body = await request.json().catch(() => ({}));
    const { citaId, nuevoEstado } = body;

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
        {
          status: 400,
          code: "INVALID_ESTADO",
        },
      );
    }

    // Validar pertenencia de la cita al negocio
    let existingQuery = admin
      .from("citas")
      .select("id")
      .eq("id", citaId)
      .eq("negocio_id", access.negocioId);

    if (access.sucursalId) {
      existingQuery = existingQuery.eq("sucursal_id", access.sucursalId);
    }
    const { data: foundCita, error: citaError } =
      await existingQuery.maybeSingle();

    if (citaError || !foundCita) {
      return apiError(
        "Cita no encontrada o no pertenece a este negocio.",
        undefined,
        {
          status: 404,
          code: "CITA_NOT_FOUND",
        },
      );
    }

    // Actualizar el estado de la cita en PostgreSQL
    let updateQuery = admin
      .from("citas")
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", citaId)
      .eq("negocio_id", access.negocioId);

    if (access.sucursalId) {
      updateQuery = updateQuery.eq("sucursal_id", access.sucursalId);
    }
    const { data: updatedCita, error: updateError } = await updateQuery
      .select()
      .single();

    if (updateError || !updatedCita) {
      return apiError(updateError, "Error al actualizar el estado de la cita.", {
        extra: { route: "PATCH /api/negocio/citas", citaId },
      });
    }

    return apiSuccess({ cita: updatedCita });
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error al actualizar la cita.", {
      extra: { route: "PATCH /api/negocio/citas" },
    });
  }
}
