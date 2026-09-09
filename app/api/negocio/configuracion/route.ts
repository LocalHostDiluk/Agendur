import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

/**
 * GET /api/negocio/configuracion
 * Retorna la configuración comercial del negocio del usuario autenticado.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, { status: 401 });
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug, logo_url, giro_comercial, moneda_principal, porcentaje_anticipo_default")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return apiError("No se encontró un negocio para esta cuenta.", undefined, { status: 404 });
    }

    return apiSuccess({
      configuracion: {
        id: negocio.id,
        nombreNegocio: negocio.nombre_comercial,
        slug: negocio.slug,
        logoUrl: negocio.logo_url,
        giroComercial: negocio.giro_comercial,
        monedaPrincipal: negocio.moneda_principal,
        porcentajeAnticipo: Number(negocio.porcentaje_anticipo_default),
        cobroAnticipoObligatorio: Number(negocio.porcentaje_anticipo_default) > 0,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar configuración.", {
      extra: { route: "GET /api/negocio/configuracion" },
    });
  }
}

/**
 * PUT /api/negocio/configuracion
 * Actualiza los parámetros comerciales del negocio autenticado.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, { status: 401 });
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return apiError("No se encontró un negocio para esta cuenta.", undefined, { status: 404 });
    }

    // Validar que la suscripción no esté vencida (HTTP 402 si expiró)
    await assertActiveSubscription(negocio.id);

    const body = await request.json().catch(() => ({}));
    const updatePayload: Record<string, unknown> = {};

    if (body.nombreNegocio !== undefined) updatePayload.nombre_comercial = body.nombreNegocio;
    if (body.logoUrl !== undefined) updatePayload.logo_url = body.logoUrl;
    if (body.giroComercial !== undefined) updatePayload.giro_comercial = body.giroComercial;
    if (body.monedaPrincipal !== undefined) updatePayload.moneda_principal = body.monedaPrincipal;
    if (body.porcentajeAnticipo !== undefined) {
      const p = Number(body.porcentajeAnticipo);
      if (isNaN(p) || p < 0 || p > 100) {
        return apiError(
          "El porcentaje de anticipo debe ser entre 0 y 100.",
          undefined,
          { status: 400, code: "INVALID_PERCENTAGE" }
        );
      }
      updatePayload.porcentaje_anticipo_default = p;
    }

    const { data: updated, error: updateError } = await supabase
      .from("negocios")
      .update(updatePayload)
      .eq("id", negocio.id)
      .select("id, nombre_comercial, slug, logo_url, giro_comercial, moneda_principal, porcentaje_anticipo_default")
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Error al actualizar");
    }

    return apiSuccess({
      configuracion: {
        id: updated.id,
        nombreNegocio: updated.nombre_comercial,
        slug: updated.slug,
        logoUrl: updated.logo_url,
        giroComercial: updated.giro_comercial,
        monedaPrincipal: updated.moneda_principal,
        porcentajeAnticipo: Number(updated.porcentaje_anticipo_default),
        cobroAnticipoObligatorio: Number(updated.porcentaje_anticipo_default) > 0,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error al actualizar configuración.", {
      extra: { route: "PUT /api/negocio/configuracion" },
    });
  }
}
