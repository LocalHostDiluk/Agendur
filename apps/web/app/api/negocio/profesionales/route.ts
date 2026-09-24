import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { assertActiveSubscription, SubscriptionExpiredError } from "@/lib/payments/guards";
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
 * Obtiene los IDs de todas las sucursales pertenecientes al negocio.
 */
async function getNegocioSucursalesIds(negocioId: string): Promise<string[]> {
  const { data: sucursales, error } = await adminClient
    .from("sucursales")
    .select("id")
    .eq("negocio_id", negocioId);

  if (error || !sucursales) return [];
  return sucursales.map((s) => s.id);
}

/**
 * GET /api/negocio/profesionales
 * Lista los profesionales de las sucursales del negocio autenticado con sus servicios asignados.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const { negocio } = auth;
    const sucursalIds = await getNegocioSucursalesIds(negocio.id);

    if (sucursalIds.length === 0) {
      return apiSuccess({ profesionales: [] });
    }

    const { searchParams } = new URL(request.url);
    const filterSucursalId = searchParams.get("sucursalId");
    const filterActivo = searchParams.get("activo");

    let targetSucursalIds = sucursalIds;
    if (filterSucursalId) {
      if (!sucursalIds.includes(filterSucursalId)) {
        return apiSuccess({ profesionales: [] });
      }
      targetSucursalIds = [filterSucursalId];
    }

    let query = adminClient
      .from("profesionales")
      .select("*")
      .in("sucursal_id", targetSucursalIds)
      .order("nombre", { ascending: true });

    if (filterActivo !== null && filterActivo !== undefined) {
      query = query.eq("activo", filterActivo === "true");
    }

    const { data: profesionales, error } = await query;

    if (error) {
      throw error;
    }

    const profsList = profesionales || [];
    if (profsList.length === 0) {
      return apiSuccess({ profesionales: [] });
    }

    const profIds = profsList.map((p) => p.id);
    const { data: relaciones, error: relError } = await adminClient
      .from("profesional_servicios")
      .select("profesional_id, servicio_id")
      .in("profesional_id", profIds);

    if (relError) {
      throw relError;
    }

    const serviciosMap = new Map<string, string[]>();
    (relaciones || []).forEach((rel) => {
      const current = serviciosMap.get(rel.profesional_id) || [];
      current.push(rel.servicio_id);
      serviciosMap.set(rel.profesional_id, current);
    });

    const resultado = profsList.map((p) => ({
      ...p,
      serviciosIds: serviciosMap.get(p.id) || [],
    }));

    return apiSuccess({ profesionales: resultado });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar profesionales.", {
      extra: { route: "GET /api/negocio/profesionales" },
    });
  }
}

/**
 * POST /api/negocio/profesionales
 * Crea un nuevo profesional en una sucursal del negocio autenticado.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const { negocio } = auth;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      );
    }

    const {
      nombre,
      apellido,
      sucursal_id,
      cargo,
      email,
      telefono,
      avatar_url,
      activo = true,
      serviciosIds = [],
    } = body as Record<string, unknown>;

    // Validar nombre
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

    // Validar apellido
    if (
      typeof apellido !== "string" ||
      !apellido.trim() ||
      apellido.trim().length > 120
    ) {
      return apiError(
        "Campos inválidos: el apellido es requerido y no debe superar los 120 caracteres.",
        undefined,
        { status: 400 },
      );
    }

    // Validar sucursal_id
    if (typeof sucursal_id !== "string" || !sucursal_id.trim()) {
      return apiError(
        "Campos inválidos: sucursal_id es requerida.",
        undefined,
        { status: 400 },
      );
    }

    const cleanSucursalId = sucursal_id.trim();

    // Validar que la sucursal pertenezca al negocio autenticado
    const { data: sucursalValida, error: sucError } = await adminClient
      .from("sucursales")
      .select("id")
      .eq("id", cleanSucursalId)
      .eq("negocio_id", negocio.id)
      .maybeSingle();

    if (sucError || !sucursalValida) {
      return apiError(
        "La sucursal seleccionada no existe o no pertenece a este negocio.",
        undefined,
        { status: 400 },
      );
    }

    // Validar suscripción activa
    let suscripcion;
    try {
      suscripcion = await assertActiveSubscription(negocio.id);
    } catch (subErr) {
      if (subErr instanceof SubscriptionExpiredError) {
        return apiError(subErr.message, undefined, {
          status: 402,
          code: subErr.code,
        });
      }
      throw subErr;
    }

    // Validar límite de profesionales del plan
    if (activo !== false) {
      const sucursalIds = await getNegocioSucursalesIds(negocio.id);
      const { count: profActivosCount, error: countError } = await adminClient
        .from("profesionales")
        .select("id", { count: "exact", head: true })
        .in("sucursal_id", sucursalIds)
        .eq("activo", true);

      if (countError) {
        throw countError;
      }

      const totalActivos = profActivosCount || 0;
      if (totalActivos >= suscripcion.limite_profesionales) {
        return apiError(
          `Has alcanzado el límite de ${suscripcion.limite_profesionales} profesionales de tu plan. Actualiza tu suscripción para registrar más personal.`,
          undefined,
          { status: 409, code: "LIMIT_EXCEEDED" },
        );
      }
    }

    // Validar y sanitizar servicios asignados
    const cleanServiciosIds: string[] = [];
    if (Array.isArray(serviciosIds) && serviciosIds.length > 0) {
      const { data: serviciosNegocio, error: servError } = await adminClient
        .from("servicios")
        .select("id")
        .eq("negocio_id", negocio.id)
        .in(
          "id",
          serviciosIds.filter((s): s is string => typeof s === "string"),
        );

      if (servError) {
        throw servError;
      }

      (serviciosNegocio || []).forEach((s) => cleanServiciosIds.push(s.id));
    }

    const cleanCargo =
      typeof cargo === "string" && cargo.trim()
        ? cargo.trim().slice(0, 100)
        : "Especialista";

    const cleanEmail =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;

    const cleanTelefono =
      typeof telefono === "string" && telefono.trim()
        ? telefono.trim().slice(0, 20)
        : null;

    const cleanAvatarUrl =
      typeof avatar_url === "string" && avatar_url.trim()
        ? avatar_url.trim()
        : null;

    // Insertar profesional
    const { data: nuevoProfesional, error: insertError } = await adminClient
      .from("profesionales")
      .insert({
        sucursal_id: cleanSucursalId,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cargo: cleanCargo,
        email: cleanEmail,
        telefono: cleanTelefono,
        avatar_url: cleanAvatarUrl,
        activo: Boolean(activo),
      })
      .select()
      .single();

    if (insertError || !nuevoProfesional) {
      throw insertError || new Error("Error al guardar el profesional.");
    }

    // Insertar relaciones con servicios si existen
    if (cleanServiciosIds.length > 0) {
      const rows = cleanServiciosIds.map((sId) => ({
        profesional_id: nuevoProfesional.id,
        servicio_id: sId,
      }));

      const { error: relInsertError } = await adminClient
        .from("profesional_servicios")
        .insert(rows);

      if (relInsertError) {
        // En caso de error registrando servicios, loggear pero no fallar el alta del profesional
        console.error("Error al asignar servicios al profesional:", relInsertError);
      }
    }

    return apiSuccess(
      {
        profesional: {
          ...nuevoProfesional,
          serviciosIds: cleanServiciosIds,
        },
      },
      201,
    );
  } catch (error: unknown) {
    return apiError(error, "Error interno al crear el profesional.", {
      extra: { route: "POST /api/negocio/profesionales" },
    });
  }
}

/**
 * PATCH /api/negocio/profesionales
 * Actualiza los datos de un profesional, activa/desactiva y actualiza sus servicios asignados.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const { negocio } = auth;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      );
    }

    const {
      id,
      nombre,
      apellido,
      sucursal_id,
      cargo,
      email,
      telefono,
      avatar_url,
      activo,
      serviciosIds,
    } = body as Record<string, unknown>;

    if (!id || typeof id !== "string" || !id.trim()) {
      return apiError("ID de profesional requerido.", undefined, {
        status: 400,
      });
    }

    const profesionalId = id.trim();
    const sucursalIds = await getNegocioSucursalesIds(negocio.id);

    if (sucursalIds.length === 0) {
      return apiError(
        "Profesional no encontrado o no pertenece a este negocio.",
        undefined,
        { status: 404 },
      );
    }

    // Verificar existencia y pertenencia del profesional al negocio
    const { data: profesionalExistente, error: findError } = await adminClient
      .from("profesionales")
      .select("*")
      .eq("id", profesionalId)
      .in("sucursal_id", sucursalIds)
      .maybeSingle();

    if (findError || !profesionalExistente) {
      return apiError(
        "Profesional no encontrado o no pertenece a este negocio.",
        undefined,
        { status: 404 },
      );
    }

    const updates: Record<string, unknown> = {};

    if (nombre !== undefined) {
      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        nombre.trim().length > 120
      ) {
        return apiError("El nombre no debe estar vacío ni exceder 120 caracteres.", undefined, {
          status: 400,
        });
      }
      updates.nombre = nombre.trim();
    }

    if (apellido !== undefined) {
      if (
        typeof apellido !== "string" ||
        !apellido.trim() ||
        apellido.trim().length > 120
      ) {
        return apiError("El apellido no debe estar vacío ni exceder 120 caracteres.", undefined, {
          status: 400,
        });
      }
      updates.apellido = apellido.trim();
    }

    if (cargo !== undefined) {
      if (cargo !== null && typeof cargo !== "string") {
        return apiError("El cargo debe ser una cadena de texto o null.", undefined, {
          status: 400,
        });
      }
      updates.cargo =
        typeof cargo === "string" && cargo.trim()
          ? cargo.trim().slice(0, 100)
          : "Especialista";
    }

    if (email !== undefined) {
      if (email !== null && typeof email !== "string") {
        return apiError("El email debe ser una cadena de texto o null.", undefined, {
          status: 400,
        });
      }
      updates.email =
        typeof email === "string" && email.trim()
          ? email.trim().toLowerCase()
          : null;
    }

    if (telefono !== undefined) {
      if (telefono !== null && typeof telefono !== "string") {
        return apiError("El teléfono debe ser texto o null.", undefined, {
          status: 400,
        });
      }
      updates.telefono =
        typeof telefono === "string" && telefono.trim()
          ? telefono.trim().slice(0, 20)
          : null;
    }

    if (avatar_url !== undefined) {
      if (avatar_url !== null && typeof avatar_url !== "string") {
        return apiError("avatar_url debe ser texto o null.", undefined, {
          status: 400,
        });
      }
      updates.avatar_url =
        typeof avatar_url === "string" && avatar_url.trim()
          ? avatar_url.trim()
          : null;
    }

    if (sucursal_id !== undefined) {
      if (typeof sucursal_id !== "string" || !sucursalIds.includes(sucursal_id.trim())) {
        return apiError(
          "La sucursal indicada no es válida para este negocio.",
          undefined,
          { status: 400 },
        );
      }
      updates.sucursal_id = sucursal_id.trim();
    }

    // Manejo de estado activo / reactivación
    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return apiError("activo debe ser un booleano.", undefined, {
          status: 400,
        });
      }

      // Si se está reactivando un profesional previamente inactivo, verificar límite de suscripción
      if (activo === true && profesionalExistente.activo === false) {
        let suscripcion;
        try {
          suscripcion = await assertActiveSubscription(negocio.id);
        } catch (subErr) {
          if (subErr instanceof SubscriptionExpiredError) {
            return apiError(subErr.message, undefined, {
              status: 402,
              code: subErr.code,
            });
          }
          throw subErr;
        }

        const { count: profActivosCount, error: countError } = await adminClient
          .from("profesionales")
          .select("id", { count: "exact", head: true })
          .in("sucursal_id", sucursalIds)
          .eq("activo", true);

        if (countError) throw countError;

        const totalActivos = profActivosCount || 0;
        if (totalActivos >= suscripcion.limite_profesionales) {
          return apiError(
            `No puedes reactivar a este profesional porque has alcanzado el límite de ${suscripcion.limite_profesionales} profesionales de tu plan.`,
            undefined,
            { status: 409, code: "LIMIT_EXCEEDED" },
          );
        }
      }

      updates.activo = activo;
    }

    // Actualizar datos del profesional si hay campos modificados
    let profesionalActualizado = profesionalExistente;
    if (Object.keys(updates).length > 0) {
      const { data: updated, error: updateError } = await adminClient
        .from("profesionales")
        .update(updates)
        .eq("id", profesionalId)
        .select()
        .single();

      if (updateError || !updated) {
        throw updateError || new Error("Error al actualizar el profesional.");
      }
      profesionalActualizado = updated;
    }

    // Sincronizar servicios asignados si se enviaron
    let serviciosFinales: string[] = [];
    if (Array.isArray(serviciosIds)) {
      const incomingIds = serviciosIds.filter(
        (s): s is string => typeof s === "string",
      );

      // Validar que pertenezcan al negocio
      const { data: serviciosNegocio, error: servError } = await adminClient
        .from("servicios")
        .select("id")
        .eq("negocio_id", negocio.id)
        .in("id", incomingIds);

      if (servError) throw servError;

      serviciosFinales = (serviciosNegocio || []).map((s) => s.id);

      // Eliminar asignaciones actuales
      const { error: delError } = await adminClient
        .from("profesional_servicios")
        .delete()
        .eq("profesional_id", profesionalId);

      if (delError) throw delError;

      // Insertar nuevas asignaciones si existen
      if (serviciosFinales.length > 0) {
        const rows = serviciosFinales.map((sId) => ({
          profesional_id: profesionalId,
          servicio_id: sId,
        }));

        const { error: insertRelError } = await adminClient
          .from("profesional_servicios")
          .insert(rows);

        if (insertRelError) throw insertRelError;
      }
    } else {
      // Si no se pasaron serviciosIds, consultar los existentes para el response
      const { data: rels } = await adminClient
        .from("profesional_servicios")
        .select("servicio_id")
        .eq("profesional_id", profesionalId);

      serviciosFinales = (rels || []).map((r) => r.servicio_id);
    }

    return apiSuccess({
      profesional: {
        ...profesionalActualizado,
        serviciosIds: serviciosFinales,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error interno al actualizar el profesional.", {
      extra: { route: "PATCH /api/negocio/profesionales" },
    });
  }
}
