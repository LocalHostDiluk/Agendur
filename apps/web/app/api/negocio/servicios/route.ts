import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

/**
 * Autentica al usuario y obtiene el negocio asociado (owner_id = user.id).
 */
async function getAuthenticatedNegocio(): Promise<
  | { ok: false; error: NextResponse }
  | { ok: true; user: { id: string; email?: string }; negocio: { id: string } }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: apiError("No autorizado", undefined, { status: 401 }),
    };
  }

  const { data: negocio, error: negError } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (negError || !negocio) {
    return {
      ok: false,
      error: apiError(
        "No se encontró un negocio para esta cuenta.",
        undefined,
        { status: 404 },
      ),
    };
  }

  return { ok: true, user, negocio };
}

/**
 * GET /api/negocio/servicios
 * Lista todos los servicios pertenecientes al negocio del usuario autenticado.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) {
      return auth.error;
    }

    const { negocio } = auth;

    const { data: servicios, error } = await adminClient
      .from("servicios")
      .select("*")
      .eq("negocio_id", negocio.id)
      .order("nombre", { ascending: true });

    if (error) {
      throw error;
    }

    return apiSuccess({ servicios: servicios || [] });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar servicios.", {
      extra: { route: "GET /api/negocio/servicios" },
    });
  }
}

/**
 * POST /api/negocio/servicios
 * Crea un nuevo servicio en el negocio del usuario autenticado.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) {
      return auth.error;
    }

    const { negocio } = auth;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      );
    }

    const { nombre, duracion_minutos, precio, descripcion } = body as Record<
      string,
      unknown
    >;

    // Validar nombre (string no vacío, max 120 caracteres)
    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.trim().length > 120
    ) {
      return apiError(
        "Campos inválidos: el nombre es requerido y no debe superar los 120 caracteres.",
        undefined,
        { status: 400 },
      );
    }

    // Validar duracion_minutos (número entero > 0)
    if (
      typeof duracion_minutos !== "number" ||
      !Number.isInteger(duracion_minutos) ||
      duracion_minutos <= 0
    ) {
      return apiError(
        "Campos inválidos: duracion_minutos debe ser un número entero mayor a 0.",
        undefined,
        { status: 400 },
      );
    }

    // Validar precio (número >= 0)
    if (typeof precio !== "number" || Number.isNaN(precio) || precio < 0) {
      return apiError(
        "Campos inválidos: precio debe ser un número mayor o igual a 0.",
        undefined,
        { status: 400 },
      );
    }

    // descripcion opcional (string o null)
    if (
      descripcion !== undefined &&
      descripcion !== null &&
      typeof descripcion !== "string"
    ) {
      return apiError(
        "Campos inválidos: descripcion debe ser una cadena de texto o null.",
        undefined,
        { status: 400 },
      );
    }

    const cleanDescripcion =
      typeof descripcion === "string" ? descripcion.trim() || null : null;

    const { data: nuevoServicio, error: insertError } = await adminClient
      .from("servicios")
      .insert({
        negocio_id: negocio.id,
        nombre: nombre.trim(),
        duracion_minutos,
        precio,
        descripcion: cleanDescripcion,
        activo: true,
      })
      .select()
      .single();

    if (insertError || !nuevoServicio) {
      throw insertError || new Error("Error al guardar el servicio.");
    }

    return apiSuccess({ servicio: nuevoServicio }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error interno al crear el servicio.", {
      extra: { route: "POST /api/negocio/servicios" },
    });
  }
}

/**
 * PATCH /api/negocio/servicios
 * Actualiza un servicio existente perteneciente al negocio del usuario autenticado.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) {
      return auth.error;
    }

    const { negocio } = auth;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      );
    }

    const { id, nombre, duracion_minutos, precio, descripcion, activo } =
      body as Record<string, unknown>;

    // Extraer y validar id (UUID requerido)
    if (!id || typeof id !== "string" || !id.trim()) {
      return apiError("ID de servicio requerido.", undefined, { status: 400 });
    }

    const servicioId = id.trim();

    // Validar que el servicio pertenezca al negocio.id del usuario autenticado
    const { data: servicioExistente, error: findError } = await adminClient
      .from("servicios")
      .select("id")
      .eq("id", servicioId)
      .eq("negocio_id", negocio.id)
      .maybeSingle();

    if (findError || !servicioExistente) {
      return apiError(
        "Servicio no encontrado o no pertenece a este negocio.",
        undefined,
        { status: 404 },
      );
    }

    const updates: {
      nombre?: string;
      duracion_minutos?: number;
      precio?: number;
      descripcion?: string | null;
      activo?: boolean;
    } = {};

    if (nombre !== undefined) {
      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        nombre.trim().length > 120
      ) {
        return apiError(
          "Campos inválidos: el nombre no debe estar vacío y no debe superar 120 caracteres.",
          undefined,
          { status: 400 },
        );
      }
      updates.nombre = nombre.trim();
    }

    if (duracion_minutos !== undefined) {
      if (
        typeof duracion_minutos !== "number" ||
        !Number.isInteger(duracion_minutos) ||
        duracion_minutos <= 0
      ) {
        return apiError(
          "Campos inválidos: duracion_minutos debe ser un entero positivo.",
          undefined,
          { status: 400 },
        );
      }
      updates.duracion_minutos = duracion_minutos;
    }

    if (precio !== undefined) {
      if (typeof precio !== "number" || Number.isNaN(precio) || precio < 0) {
        return apiError(
          "Campos inválidos: precio debe ser un número mayor o igual a 0.",
          undefined,
          { status: 400 },
        );
      }
      updates.precio = precio;
    }

    if (descripcion !== undefined) {
      if (descripcion !== null && typeof descripcion !== "string") {
        return apiError(
          "Campos inválidos: descripcion debe ser texto o null.",
          undefined,
          { status: 400 },
        );
      }
      updates.descripcion =
        typeof descripcion === "string" ? descripcion.trim() || null : null;
    }

    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return apiError(
          "Campos inválidos: activo debe ser un valor booleano.",
          undefined,
          { status: 400 },
        );
      }
      updates.activo = activo;
    }

    if (Object.keys(updates).length === 0) {
      return apiError(
        "Campos inválidos: no se enviaron campos válidos para actualizar.",
        undefined,
        { status: 400 },
      );
    }

    const { data: updatedServicio, error: updateError } = await adminClient
      .from("servicios")
      .update(updates)
      .eq("id", servicioId)
      .eq("negocio_id", negocio.id)
      .select()
      .single();

    if (updateError || !updatedServicio) {
      throw updateError || new Error("Error al actualizar el servicio.");
    }

    return apiSuccess({ servicio: updatedServicio });
  } catch (error: unknown) {
    return apiError(error, "Error interno al actualizar el servicio.", {
      extra: { route: "PATCH /api/negocio/servicios" },
    });
  }
}
