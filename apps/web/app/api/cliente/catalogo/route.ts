import { NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

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
      return apiError("El parámetro slug es requerido.", undefined, {
        status: 400,
        code: "MISSING_SLUG_PARAM",
      });
    }

    // 1. Obtener negocio
    const { data: negocio, error: negErr } = await adminClient
      .from("negocios")
      .select("id, nombre_comercial, slug, logo_url, giro_comercial, moneda_principal, porcentaje_anticipo_default")
      .eq("slug", slug)
      .maybeSingle();

    if (negErr || !negocio) {
      return apiError("Negocio no encontrado.", undefined, {
        status: 404,
        code: "BUSINESS_NOT_FOUND",
      });
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

    return apiSuccess({
      data: {
        negocio,
        sucursales: sucursales || [],
        servicios: servicios || [],
        profesionales,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error interno al obtener catálogo.", {
      extra: { route: "GET /api/cliente/catalogo" },
    });
  }
}
