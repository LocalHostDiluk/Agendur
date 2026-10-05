import type { NegocioAccess } from "@/lib/auth/negocio-access";
import type { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { cleanText, cleanEmail, findAuthUserByEmail, allowedBranchIds, branchBelongsToBusiness } from "./directorio";

export async function actualizarPersonal(access: NegocioAccess, admin: ReturnType<typeof createAdminClient>, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError("Datos de personal inválidos.", undefined, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  const id = cleanText(input.id, 64);

  const kind = input.kind;

  if (!id || (kind !== "collaborator" && kind !== "professional")) {
    return apiError("Personal inválido.", undefined, { status: 400 });
  }

  if (kind === "collaborator") {
    const { data: existing, error: existingError } = await admin
      .from("colaboradores")
      .select("id, rol, sucursal_id")
      .eq("id", id)
      .eq("negocio_id", access.negocioId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) {
      return apiError("Colaborador no encontrado.", undefined, { status: 404 });
    }
    const rol = input.rol ?? existing.rol;
    if (rol !== "manager" && rol !== "receptionist") {
      return apiError("Rol inválido.", undefined, { status: 400 });
    }
    const sucursalId =
      rol === "manager"
        ? null
        : cleanText(input.sucursalId ?? existing.sucursal_id, 64);
    if (
      rol === "receptionist" &&
      (!sucursalId ||
        !(await branchBelongsToBusiness(admin, access.negocioId, sucursalId)))
    ) {
      return apiError("Sucursal inválida.", undefined, { status: 400 });
    }
    const updates: Record<string, unknown> = { rol, sucursal_id: sucursalId };
    if (input.activo !== undefined) {
      if (typeof input.activo !== "boolean") {
        return apiError("activo debe ser booleano.", undefined, { status: 400 });
      }
      updates.activo = input.activo;
    }
    const { data, error } = await admin
      .from("colaboradores")
      .update(updates)
      .eq("id", id)
      .eq("negocio_id", access.negocioId)
      .select("id, usuario_id, rol, sucursal_id, activo")
      .single();
    if (error || !data) throw error || new Error("No se pudo actualizar.");
    return { personal: data };
  }

  if (input.rol !== undefined && input.rol !== "professional") {
    return apiError("Un profesional no puede cambiar a ese rol.", undefined, {
      status: 400,
    });
  }

  const branchIds = await allowedBranchIds(admin, access);

  const { data: existing, error: existingError } = branchIds.length
    ? await admin
        .from("profesionales")
        .select("id, sucursal_id, usuario_id, activo")
        .eq("id", id)
        .in("sucursal_id", branchIds)
        .maybeSingle()
    : { data: null, error: null };

  if (existingError) throw existingError;

  if (!existing) {
    return apiError("Profesional no encontrado.", undefined, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (input.usuarioEmail !== undefined) {
    const email = cleanEmail(input.usuarioEmail);
    const user = email ? await findAuthUserByEmail(admin, email) : null;
    if (!user) return apiError("La persona debe registrarse primero.", undefined, { status: 409, code: "USER_MUST_REGISTER" });
    updates.usuario_id = user.id;
  }

  if (input.activo !== undefined) {
    if (typeof input.activo !== "boolean") {
      return apiError("activo debe ser booleano.", undefined, { status: 400 });
    }
    updates.activo = input.activo;
    if (input.activo && !existing.activo) {
      const subscription = await assertActiveSubscription(access.negocioId);
      const { count, error } = await admin.from("profesionales")
        .select("id", { count: "exact", head: true }).in("sucursal_id", branchIds).eq("activo", true);
      if (error) throw error;
      if ((count ?? 0) >= subscription.limite_profesionales) {
        return apiError("Límite de profesionales alcanzado.", undefined, { status: 409, code: "LIMIT_EXCEEDED" });
      }
    }
  }

  if (input.sucursalId !== undefined) {
    const sucursalId = cleanText(input.sucursalId, 64);
    if (!sucursalId || !(await branchBelongsToBusiness(admin, access.negocioId, sucursalId))) {
      return apiError("Sucursal inválida.", undefined, { status: 400 });
    }
    updates.sucursal_id = sucursalId;
  }

  if (!Object.keys(updates).length) {
    return apiError("No hay cambios válidos.", undefined, { status: 400 });
  }

  let update = admin.from("profesionales").update(updates).eq("id", id);

  update = update.in("sucursal_id", branchIds);

  const { data, error } = await update.select().single();

  if (error?.code === "23503") return apiError("El profesional conserva citas en su sede actual.", undefined, { status: 409, code: "STAFF_HISTORY_SCOPE_LOCKED" });

  if (error?.code === "23505") return apiError("La cuenta ya está vinculada en esa sede.", undefined, { status: 409, code: "STAFF_ALREADY_EXISTS" });

  if (error || !data) throw error || new Error("No se pudo actualizar.");

  return { personal: data };
}
