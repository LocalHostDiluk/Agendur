import * as Sentry from "@sentry/nextjs";
import {
  hasCapability,
  NegocioAccessError,
  resolveNegocioAccess,
  ROLE_CAPABILITIES,
} from "@/lib/auth/negocio-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

export async function GET() {
  try {
    const access = await resolveNegocioAccess();
    const admin = createAdminClient();

    const { data: negocio, error: negocioError } = await admin
      .from("negocios")
      .select("*")
      .eq("id", access.negocioId)
      .maybeSingle();
    if (negocioError || !negocio) {
      return apiError(
        negocioError || "No se encontró el negocio.",
        "No se pudo consultar el negocio.",
        { status: negocioError ? 503 : 403 },
      );
    }

    const { data: perfil, error: perfilError } = await admin
      .from("perfiles_usuario")
      .select("nombres, apellidos, telefono, rol, locale")
      .eq("usuario_id", access.user.id)
      .maybeSingle();
    if (perfilError && !["42P01", "PGRST205"].includes(perfilError.code)) {
      return apiError(perfilError, "No se pudo consultar el perfil.", {
        status: 503,
      });
    }

    let sucursalesCount = 0;
    let sucursalesActivasCount = 0;
    let totalQuery = admin
      .from("sucursales")
      .select("id", { count: "exact", head: true })
      .eq("negocio_id", access.negocioId);
    let activasQuery = admin
      .from("sucursales")
      .select("id", { count: "exact", head: true })
      .eq("negocio_id", access.negocioId)
      .eq("activa", true);
    if (access.sucursalId) {
      totalQuery = totalQuery.eq("id", access.sucursalId);
      activasQuery = activasQuery.eq("id", access.sucursalId);
    }
    const [total, activas] = await Promise.all([totalQuery, activasQuery]);
    if (
      total.error ||
      activas.error ||
      typeof total.count !== "number" ||
      typeof activas.count !== "number"
    ) {
      return apiError(
        total.error || activas.error || "No se pudo contar sucursales.",
        "No se pudo consultar las sucursales.",
        { status: 503 },
      );
    }
    sucursalesCount = total.count;
    sucursalesActivasCount = activas.count;

    let suscripcion = null;
    if (hasCapability(access, "billing:read")) {
      const { data, error } = await admin
        .from("suscripciones")
        .select(
          "plan_nombre, estado, current_period_end, limite_sucursales, limite_profesionales, pasarela",
        )
        .eq("negocio_id", access.negocioId)
        .maybeSingle();
      if (error) Sentry.captureException(error);
      suscripcion = data;
    }

    const negocioPayload = {
      id: negocio.id,
      nombreComercial: negocio.nombre_comercial,
      nombre_comercial: negocio.nombre_comercial,
      slug: negocio.slug,
      giroComercial: negocio.giro_comercial,
      giro_comercial: negocio.giro_comercial,
      ciudad: negocio.ciudad ?? null,
      sucursalesEstimadas: negocio.sucursales_estimadas ?? null,
      sucursales_estimadas: negocio.sucursales_estimadas ?? null,
      logoUrl: negocio.logo_url,
      logo_url: negocio.logo_url,
      monedaPrincipal: negocio.moneda_principal,
      moneda_principal: negocio.moneda_principal,
      pais: negocio.pais ?? null,
      zona_horaria: negocio.zona_horaria ?? null,
    };

    const responseData = {
      user: {
        id: access.user.id,
        email: access.user.email,
      },
      negocio: negocioPayload,
      access: {
        role: access.role,
        sucursalId: access.sucursalId,
        profesionalId: access.profesionalId,
        capabilities: ROLE_CAPABILITIES[access.role],
      },
      suscripcion,
      perfil: perfilError ? null : perfil,
      sucursalesCount,
      sucursalesActivasCount,
      onboardingStatus:
        access.role === "owner" && sucursalesCount === 0
          ? "required"
          : "complete",
    };

    return apiSuccess({ data: responseData, ...responseData });
  } catch (error) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, {
        status: error.status,
        code: error.code,
      });
    }
    return apiError(error, "Error al obtener sesión.");
  }
}
