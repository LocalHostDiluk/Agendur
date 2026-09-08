import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createSucursal } from "@/lib/backend/sucursal-service";
import { adminClient } from "@/lib/supabase/admin";

/**
 * GET /api/negocio/sucursales
 * Retorna las sucursales del negocio del usuario autenticado.
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
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return NextResponse.json(
        { success: false, error: "No se encontró un negocio para esta cuenta." },
        { status: 404 }
      );
    }

    const { data: sucursales, error: sucError } = await adminClient
      .from("sucursales")
      .select("*")
      .eq("negocio_id", negocio.id)
      .order("es_matriz", { ascending: false })
      .order("created_at", { ascending: true });

    if (sucError) {
      throw sucError;
    }

    return NextResponse.json({ success: true, sucursales: sucursales || [] });
  } catch (error: unknown) {
    Sentry.captureException(error, { extra: { route: "GET /api/negocio/sucursales" } });
    return NextResponse.json(
      { success: false, error: "Error interno al consultar sucursales." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/negocio/sucursales
 * Crea una nueva sucursal verificando el límite de sucursales del plan.
 */
export async function POST(request: NextRequest) {
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
    const { nombre, direccion, ciudad, telefono } = body;

    if (!nombre || !direccion || !ciudad || !telefono) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos requeridos faltantes: nombre, direccion, ciudad, telefono.",
        },
        { status: 400 }
      );
    }

    const nuevaSucursal = await createSucursal(negocio.id, body);

    return NextResponse.json(
      { success: true, sucursal: nuevaSucursal },
      { status: 201 }
    );
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status || 500;
    const errorMessage =
      error instanceof Error ? error.message : "Error al crear sucursal";

    Sentry.captureException(error, {
      extra: { route: "POST /api/negocio/sucursales" },
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
