import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
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

/**
 * Valida autenticación del usuario, existencia del negocio y vigencia de la suscripción.
 */
async function getAuthenticatedNegocio(): Promise<
  | { error: NextResponse }
  | { user: { id: string; email?: string }; negocio: { id: string }; admin: ReturnType<typeof createAdminClient> }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: apiError("No autorizado. Sesión requerida.", undefined, {
        status: 401,
      }),
    };
  }

  const admin = createAdminClient();
  const { data: negocio, error: negError } = await admin
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (negError || !negocio) {
    return {
      error: apiError("No se encontró un negocio para esta cuenta.", undefined, {
        status: 404,
      }),
    };
  }

  await assertActiveSubscription(negocio.id);

  return { user, negocio, admin };
}

/**
 * GET /api/negocio/citas
 * Retorna las citas pertenecientes al negocio autenticado, con filtros opcionales.
 */
export async function GET(request: NextRequest | Request): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if ("error" in auth) {
      return auth.error;
    }
    const { negocio, admin } = auth;

    const url = new URL(request.url);
    const sucursalId = url.searchParams.get("sucursalId");
    const fechaInicio = url.searchParams.get("fechaInicio");
    const fechaFin = url.searchParams.get("fechaFin");
    const estado = url.searchParams.get("estado");

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
      .eq("negocio_id", negocio.id);

    if (sucursalId) {
      query = query.eq("sucursal_id", sucursalId);
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
    const auth = await getAuthenticatedNegocio();
    if ("error" in auth) {
      return auth.error;
    }
    const { negocio, admin } = auth;

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
    const { data: citaExistente, error: citaError } = await admin
      .from("citas")
      .select("id")
      .eq("id", citaId)
      .eq("negocio_id", negocio.id)
      .maybeSingle();

    if (citaError || !citaExistente) {
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
    const { data: citaActualizada, error: updateError } = await admin
      .from("citas")
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", citaId)
      .eq("negocio_id", negocio.id)
      .select()
      .single();

    if (updateError || !citaActualizada) {
      return apiError(updateError, "Error al actualizar el estado de la cita.", {
        extra: { route: "PATCH /api/negocio/citas", citaId },
      });
    }

    return apiSuccess({ cita: citaActualizada });
  } catch (error: unknown) {
    return apiError(error, "Error al actualizar la cita.", {
      extra: { route: "PATCH /api/negocio/citas" },
    });
  }
}
