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

    const body = await request.json().catch(() => ({}));
    const { nombre, direccion, ciudad, telefono } = body;

    if (!nombre || !direccion || !ciudad || !telefono) {
      return apiError(
        "Campos requeridos faltantes: nombre, direccion, ciudad, telefono.",
        undefined,
        { status: 400, code: "MISSING_REQUIRED_FIELDS" }
      );
    }

    // Validar que la suscripción no esté vencida (HTTP 402 si expiró)
    await assertActiveSubscription(negocio.id);

    const nuevaSucursal = await createSucursal(negocio.id, body);

    return apiSuccess({ sucursal: nuevaSucursal }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error al crear sucursal.", {
      extra: { route: "POST /api/negocio/sucursales" },
    });
  }
}
