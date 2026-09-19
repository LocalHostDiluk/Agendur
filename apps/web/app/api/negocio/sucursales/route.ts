import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSucursal } from "@/lib/backend/sucursal-service";
import { adminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

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

    const { data: sucursales, error: sucError } = await adminClient
      .from("sucursales")
      .select("*")
      .eq("negocio_id", negocio.id)
      .order("es_matriz", { ascending: false })
      .order("created_at", { ascending: true });

    if (sucError) {
      throw sucError;
    }

    return apiSuccess({ sucursales: sucursales || [] });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar sucursales.", {
      extra: { route: "GET /api/negocio/sucursales" },
    });
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

    const body: unknown = await request.json().catch(() => null);
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
      .eq("negocio_id", negocio.id);
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

    // Validar que la suscripción no esté vencida (HTTP 402 si expiró)
    await assertActiveSubscription(negocio.id);

    const nuevaSucursal = await createSucursal(negocio.id, {
      nombre, direccion, ciudad, telefono,
      estado_provincia: estadoProvincia || undefined,
      codigo_postal: codigoPostal || undefined,
      zona_horaria: zonaHoraria || undefined,
      es_matriz: count === 0 || input.es_matriz === true,
      activa: count === 0 || input.activa !== false,
    });

    return apiSuccess({ sucursal: nuevaSucursal }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error al crear sucursal.", {
      extra: { route: "POST /api/negocio/sucursales" },
    });
  }
}
