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
      .select(
        "id, nombre_comercial, slug, giro_comercial, logo_url, moneda_principal",
      )
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError) {
      Sentry.captureException(negocioError);
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
    };

    return apiSuccess({
      data: responseData,
      ...responseData,
    });
  } catch (error) {
    return apiError(error, "Error al obtener sesión.");
  }
}
