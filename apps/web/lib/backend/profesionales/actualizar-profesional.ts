import { adminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { assertActiveSubscription, SubscriptionExpiredError } from "@/lib/payments/guards";
import { getNegocioSucursalesIds } from "./consultar-profesionales";
import { asignarServiciosProfesional } from "./asignar-servicios";

export async function actualizarProfesional(access: NegocioAccess, body: unknown) {
  const negocio = { id: access.negocioId };



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

  let profesionalActualizado = profesionalExistente;

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await adminClient
      .from("profesionales")
      .update(updates)
      .eq("id", profesionalId)
      .in("sucursal_id", sucursalIds)
      .select()
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Error al actualizar el profesional.");
    }
    profesionalActualizado = updated;
  }

  const serviciosFinales = await asignarServiciosProfesional(negocio.id, profesionalId, serviciosIds);

  return {
    profesional: {
      ...profesionalActualizado,
      serviciosIds: serviciosFinales,
    },
  };
}
