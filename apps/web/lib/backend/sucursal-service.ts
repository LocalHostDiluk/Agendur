import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getSubscriptionUsage } from "@/lib/payments";
import type { Sucursal } from "@/lib/types";

/**
 * Consulta todas las sucursales activas de un negocio por su slug público,
 * calculando el conteo de profesionales asignados.
 */
export async function getSucursalesByNegocio(
  slug: string
): Promise<Sucursal[]> {
  try {
    const { data: negocio, error: negError } = await adminClient
      .from("negocios")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (negError || !negocio) {
      return [];
    }

    const { data: sucursales, error: sucError } = await adminClient
      .from("sucursales")
      .select("*")
      .eq("negocio_id", negocio.id)
      .eq("activa", true)
      .order("es_matriz", { ascending: false })
      .order("created_at", { ascending: true });

    if (sucError || !sucursales) {
      return [];
    }

    // Obtener conteo de profesionales por sucursal
    const sucursalIds = sucursales.map((s) => s.id);
    const { data: profs } = await adminClient
      .from("profesionales")
      .select("id, sucursal_id")
      .in("sucursal_id", sucursalIds)
      .eq("activo", true);

    const countMap: Record<string, number> = {};
    (profs || []).forEach((p) => {
      countMap[p.sucursal_id] = (countMap[p.sucursal_id] || 0) + 1;
    });

    return sucursales.map((s) => ({
      ...s,
      personalCount: countMap[s.id] || 0,
    })) as Sucursal[];
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: "getSucursalesByNegocio", slug },
    });
    return [];
  }
}

/**
 * Crea una nueva sucursal para un negocio validando que no exceda el límite
 * contratado en su suscripción activa.
 */
export async function createSucursal(
  negocioId: string,
  data: Omit<Sucursal, "id" | "negocio_id">
): Promise<Sucursal> {
  try {
    // 1. Validar límite de suscripción
    const usage = await getSubscriptionUsage(negocioId);

    if (usage.sucursales_disponibles <= 0) {
      const err = new Error(
        `Límite de sucursales alcanzado para su plan (${usage.sucursales_limite}). Actualice su suscripción para crear más sucursales.`
      );
      (err as unknown as { status: number }).status = 403;
      throw err;
    }

    // 2. Determinar es_matriz: solo true si es la primera sucursal o si no existe ninguna otra matriz
    let esMatriz = false;
    if (usage.sucursales_creadas === 0) {
      esMatriz = true;
    } else if (data.es_matriz) {
      const { count: matrizCount } = await adminClient
        .from("sucursales")
        .select("id", { count: "exact", head: true })
        .eq("negocio_id", negocioId)
        .eq("es_matriz", true);
      esMatriz = (matrizCount ?? 0) === 0;
    }

    // 3. Insertar sucursal en Supabase
    const { data: nuevaSucursal, error: insertError } = await adminClient
      .from("sucursales")
      .insert({
        negocio_id: negocioId,
        nombre: data.nombre,
        es_matriz: esMatriz,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado_provincia: data.estado_provincia || "CDMX",
        codigo_postal: data.codigo_postal || "00000",
        telefono: data.telefono,
        zona_horaria: data.zona_horaria || "America/Mexico_City",
        activa: data.activa !== undefined ? data.activa : true,
      })
      .select("*")
      .single();

    if (insertError || !nuevaSucursal) {
      throw new Error(
        `Error al registrar sucursal en Supabase: ${insertError?.message || "Sin datos"}`
      );
    }

    return {
      ...nuevaSucursal,
      personalCount: 0,
    } as Sucursal;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: "createSucursal", negocioId, data },
    });
    throw error;
  }
}
