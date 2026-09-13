import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Obtener usuario de la sesión actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return apiError("No autorizado. No existe sesión activa.", undefined, {
        status: 401,
      });
    }

    // 2. Obtener datos del negocio
    const admin = createAdminClient();
    const { data: negocio, error: negocioError } = await admin
      .from("negocios")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError) {
      return apiError(negocioError, "No se pudo consultar el negocio.", { status: 503 });
    }

    // El perfil puede faltar en cuentas anteriores a Puerta 1. La tabla puede
    // no existir aún en una instalación donde la migración se aplica a mano.
    const { data: perfil, error: perfilError } = await admin
      .from("perfiles_usuario")
      .select("nombres, apellidos, telefono, locale")
      .eq("usuario_id", user.id)
      .maybeSingle();
    if (perfilError && !["42P01", "PGRST205"].includes(perfilError.code)) {
      return apiError(perfilError, "No se pudo consultar el perfil.", { status: 503 });
    }

    let sucursalesCount = 0;
    if (negocio?.id) {
      const { count, error: sucursalesError } = await admin
        .from("sucursales")
        .select("id", { count: "exact", head: true })
        .eq("negocio_id", negocio.id);
      if (sucursalesError || typeof count !== "number") {
        return apiError(sucursalesError || "No se pudo contar sucursales.", "No se pudo consultar las sucursales.", { status: 503 });
      }
      sucursalesCount = count;
    }

    // 3. Obtener suscripción
    let suscripcion = null;
    if (negocio?.id) {
      const { data: subData, error: subError } = await admin
        .from("suscripciones")
        .select(
          "plan_nombre, estado, current_period_end, limite_sucursales, limite_profesionales, pasarela",
        )
        .eq("negocio_id", negocio.id)
        .maybeSingle();

      if (subError) {
        Sentry.captureException(subError);
      }
      suscripcion = subData;
    }

    const negocioPayload = negocio
      ? {
          id: negocio.id,
          nombreComercial: negocio.nombre_comercial,
          nombre_comercial: negocio.nombre_comercial,
          slug: negocio.slug,
          giroComercial: negocio.giro_comercial,
          giro_comercial: negocio.giro_comercial,
          logoUrl: negocio.logo_url,
          logo_url: negocio.logo_url,
          monedaPrincipal: negocio.moneda_principal,
          moneda_principal: negocio.moneda_principal,
          pais: negocio.pais ?? null,
          zona_horaria: negocio.zona_horaria ?? null,
        }
      : null;

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      negocio: negocioPayload,
      suscripcion,
      perfil: perfilError ? null : perfil,
      sucursalesCount,
      onboardingStatus: negocio && sucursalesCount > 0 ? "complete" : "required",
    };

    return apiSuccess({
      data: responseData,
      ...responseData,
    });
  } catch (error) {
    return apiError(error, "Error al obtener sesión.");
  }
}
