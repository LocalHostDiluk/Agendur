import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json(
        { success: false, error: "No autorizado. Sesión requerida." },
        { status: 401 }
      );
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug, logo_url, giro_comercial, moneda_principal, porcentaje_anticipo_default")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return NextResponse.json(
        { success: false, error: "No se encontró un negocio para esta cuenta." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
    Sentry.captureException(error, {
      extra: { route: "GET /api/negocio/configuracion" },
    });
    return NextResponse.json(
      { success: false, error: "Error interno al consultar configuración." },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: "No autorizado. Sesión requerida." },
        { status: 401 }
      );
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return NextResponse.json(
        { success: false, error: "No se encontró un negocio para esta cuenta." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const updatePayload: Record<string, unknown> = {};

    if (body.nombreNegocio !== undefined) updatePayload.nombre_comercial = body.nombreNegocio;
    if (body.logoUrl !== undefined) updatePayload.logo_url = body.logoUrl;
    if (body.giroComercial !== undefined) updatePayload.giro_comercial = body.giroComercial;
    if (body.monedaPrincipal !== undefined) updatePayload.moneda_principal = body.monedaPrincipal;
    if (body.porcentajeAnticipo !== undefined) {
      const p = Number(body.porcentajeAnticipo);
      if (isNaN(p) || p < 0 || p > 100) {
        return NextResponse.json(
          { success: false, error: "El porcentaje de anticipo debe ser entre 0 y 100." },
          { status: 400 }
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

    return NextResponse.json({
      success: true,
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
    Sentry.captureException(error, {
      extra: { route: "PUT /api/negocio/configuracion" },
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar configuración.",
      },
      { status: 500 }
    );
  }
}
