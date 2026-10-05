import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getSubscriptionUsage } from "@/lib/payments";
import type { Sucursal } from "@/lib/types";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError } from "@/lib/utils/api-error";

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
      .is("desactivado_at", null)
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
  // Sin try/catch local: `apiError` es la única frontera de observabilidad.
  // Capturar aquí duplicaba eventos 5xx y enviaba dirección y teléfono a Sentry.
  // 1. Validar límite de suscripción
  const usage = await getSubscriptionUsage(negocioId);

  if (data.activa !== false && usage.sucursales_disponibles <= 0) {
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
}

export async function consultarSucursales(access: NegocioAccess) {
  let query = adminClient
    .from("sucursales")
    .select("*")
    .eq("negocio_id", access.negocioId);

  if (access.sucursalIds) query = query.in("id", access.sucursalIds);
  else if (access.sucursalId) query = query.eq("id", access.sucursalId);

  const { data: sucursales, error: sucError } = await query
    .order("es_matriz", { ascending: false })
    .order("created_at", { ascending: true });

  if (sucError) {
    throw sucError;
  }

  return { sucursales: sucursales || [] };
}

export async function crearSucursalDesdeDatos(access: NegocioAccess, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError("Datos de sucursal inválidos.", undefined, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  const text = (key: string) => typeof input[key] === "string" ? (input[key] as string).trim() : "";

  const nombre = text("nombre");

  const direccion = text("direccion");

  const ciudad = text("ciudad");

  const telefono = text("telefono");

  if (!nombre || !direccion || !ciudad || !telefono ||
    nombre.length > 120 || direccion.length > 250 || ciudad.length > 120 || telefono.length > 20) {
    return apiError(
      "Campos de sucursal inválidos: nombre, dirección, ciudad, teléfono.",
      undefined,
      { status: 400, code: "MISSING_REQUIRED_FIELDS" }
    );
  }

  const { count, error: countError } = await adminClient
    .from("sucursales")
    .select("id", { count: "exact", head: true })
    .eq("negocio_id", access.negocioId);

  if (countError || typeof count !== "number") {
    return apiError(countError || "No se pudo contar sucursales.", "No se pudo validar la sucursal.", { status: 503 });
  }

  if (input.primeraSucursal === true && count > 0) {
    return apiError("La primera sucursal ya existe. Actualiza la página.", undefined, { status: 409, code: "FIRST_BRANCH_EXISTS" });
  }

  const estadoProvincia = text("estado_provincia");

  const codigoPostal = text("codigo_postal");

  const zonaHoraria = text("zona_horaria");

  if (count === 0 && (!estadoProvincia || !codigoPostal || !zonaHoraria || !/^\+[1-9][0-9]{1,14}$/.test(telefono))) {
    return apiError("La primera sucursal requiere ubicación, código postal, teléfono internacional y zona horaria reales.", undefined, { status: 400 });
  }

  if (estadoProvincia.length > 120 || codigoPostal.length > 10 ||
    (codigoPostal && !/^[A-Za-z0-9 -]{3,10}$/.test(codigoPostal)) ||
    zonaHoraria.length > 60) {
    return apiError("Ubicación o código postal inválidos.", undefined, { status: 400 });
  }

  if (zonaHoraria) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zonaHoraria });
    } catch {
      return apiError("Zona horaria inválida.", undefined, { status: 400 });
    }
  }

  await assertActiveSubscription(access.negocioId);

  const nuevaSucursal = await createSucursal(access.negocioId, {
    nombre, direccion, ciudad, telefono,
    estado_provincia: estadoProvincia || undefined,
    codigo_postal: codigoPostal || undefined,
    zona_horaria: zonaHoraria || undefined,
    es_matriz: count === 0 || input.es_matriz === true,
    activa: count === 0 || input.activa !== false,
  });

  return { sucursal: nuevaSucursal };
}

export async function eliminarSucursal(access: NegocioAccess, id: string | null) {
  if (!id) {
    return apiError("ID de sucursal requerido.", undefined, { status: 400 });
  }

  const { data: sucursal, error: findError } = await adminClient
    .from("sucursales")
    .select("id, es_matriz")
    .eq("id", id)
    .eq("negocio_id", access.negocioId)
    .maybeSingle();

  if (findError || !sucursal) {
    return apiError("Sucursal no encontrada o no pertenece a este negocio.", undefined, { status: 404 });
  }

  const { error: delError } = await adminClient
    .from("sucursales")
    .delete()
    .eq("id", id)
    .eq("negocio_id", access.negocioId);

  if (delError) {
    throw delError;
  }

  return { deleted: true };
}
