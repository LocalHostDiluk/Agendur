import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cliente/catalogo?slug={slug}
 * Endpoint público que entrega el catálogo activo de un negocio para el portal de reservas:
 * sucursales, servicios, profesionales y asignaciones.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "El parámetro slug es requerido." },
        { status: 400 }
      );
    }

    // 1. Obtener negocio
    const { data: negocio, error: negErr } = await adminClient
      .from("negocios")
      .select("id, nombre_comercial, slug, logo_url, giro_comercial, moneda_principal, porcentaje_anticipo_default")
      .eq("slug", slug)
      .maybeSingle();

    if (negErr || !negocio) {
      return NextResponse.json(
        { success: false, error: "Negocio no encontrado." },
        { status: 404 }
      );
    }

    // 2. Obtener sucursales activas
    const { data: sucursales } = await adminClient
      .from("sucursales")
      .select("id, nombre, es_matriz, direccion, ciudad, telefono, zona_horaria, activa")
      .eq("negocio_id", negocio.id)
      .eq("activa", true)
      .order("es_matriz", { ascending: false });

    // 3. Obtener servicios activos
    const { data: servicios } = await adminClient
      .from("servicios")
      .select("id, nombre, descripcion, duracion_minutos, precio, activo")
      .eq("negocio_id", negocio.id)
      .eq("activo", true)
      .order("nombre", { ascending: true });

    // 4. Obtener profesionales activos de estas sucursales
    const sucursalIds = (sucursales || []).map((s) => s.id);
    let profesionales: Array<{
      id: string;
      sucursal_id: string;
      nombre: string;
      apellido: string;
      avatar_url: string | null;
      serviciosIds?: string[];
    }> = [];

    if (sucursalIds.length > 0) {
      const { data: profData } = await adminClient
        .from("profesionales")
        .select("id, sucursal_id, nombre, apellido, avatar_url")
        .in("sucursal_id", sucursalIds)
        .eq("activo", true);

      const profIds = (profData || []).map((p) => p.id);

      // Asignaciones M:N
      const relMap: Record<string, string[]> = {};
      if (profIds.length > 0) {
        const { data: rels } = await adminClient
          .from("profesional_servicios")
          .select("profesional_id, servicio_id")
          .in("profesional_id", profIds);

        (rels || []).forEach((r) => {
          if (!relMap[r.profesional_id]) relMap[r.profesional_id] = [];
          relMap[r.profesional_id].push(r.servicio_id);
        });
      }

      profesionales = (profData || []).map((p) => ({
        ...p,
        serviciosIds: relMap[p.id] || [],
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        negocio,
        sucursales: sucursales || [],
        servicios: servicios || [],
        profesionales,
      },
    });
  } catch (error) {
    Sentry.captureException(error, { extra: { route: "GET /api/cliente/catalogo" } });
    return NextResponse.json(
      { success: false, error: "Error interno al obtener catálogo." },
      { status: 500 }
    );
  }
}
