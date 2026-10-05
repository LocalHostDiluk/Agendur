import { adminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { assertActiveSubscription, SubscriptionExpiredError } from "@/lib/payments/guards";
import { parseProfessionalSchedule } from "@/lib/schedules/professional";
import { getNegocioSucursalesIds } from "./consultar-profesionales";

export async function crearProfesional(access: NegocioAccess, body: unknown) {
  const negocio = { id: access.negocioId };



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
    horarios,
  } = body as Record<string, unknown>;

  if (horarios !== undefined && !parseProfessionalSchedule(horarios)) {
    return apiError("Horario semanal inválido.", undefined, {
      status: 400,
      code: "INVALID_WEEKLY_SCHEDULE",
    });
  }

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

  if (typeof sucursal_id !== "string" || !sucursal_id.trim()) {
    return apiError(
      "Campos inválidos: sucursal_id es requerida.",
      undefined,
      { status: 400 },
    );
  }

  const cleanSucursalId = sucursal_id.trim();

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

  if (insertError?.message?.includes("BRANCH_SCHEDULE_REQUIRED")) {
    return apiError("La sucursal debe tener un horario semanal antes de agregar profesionales.", undefined, {
      status: 409,
      code: "BRANCH_SCHEDULE_REQUIRED",
    });
  }

  if (insertError || !nuevoProfesional) {
    throw insertError || new Error("Error al guardar el profesional.");
  }

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

  const { data: horariosGuardados, error: horarioError } = await adminClient
    .from("horarios_profesional")
    .select("dia_semana, hora_inicio, hora_fin")
    .eq("profesional_id", nuevoProfesional.id)
    .order("dia_semana", { ascending: true });

  if (horarioError) throw horarioError;

  return {
      profesional: {
        ...nuevoProfesional,
        serviciosIds: cleanServiciosIds,
        horarios: horariosGuardados ?? [],
      },
    };
}
