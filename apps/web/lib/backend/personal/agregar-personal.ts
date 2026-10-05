import type { NegocioAccess } from "@/lib/auth/negocio-access";
import type { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { cleanText, cleanEmail, findAuthUserByEmail, allowedBranchIds, branchBelongsToBusiness } from "./directorio";

type StaffRole = "manager" | "receptionist" | "professional";

export async function agregarPersonal(access: NegocioAccess, admin: ReturnType<typeof createAdminClient>, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError("Datos de personal inválidos.", undefined, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  const rol = input.rol as StaffRole;

  const email = cleanEmail(input.email);

  if (!email || !["manager", "receptionist", "professional"].includes(rol)) {
    return apiError("Correo o rol inválido.", undefined, { status: 400 });
  }

  const sucursalId = cleanText(input.sucursalId, 64);

  if (
    (rol === "receptionist" || rol === "professional") &&
    (!sucursalId ||
      !(await branchBelongsToBusiness(admin, access.negocioId, sucursalId)))
  ) {
    return apiError("Sucursal inválida.", undefined, { status: 400 });
  }

  const authUser = await findAuthUserByEmail(admin, email);

  if (rol === "manager" || rol === "receptionist") {
    if (!authUser) {
      return apiError(
        "La persona debe registrarse antes de ser agregada.",
        undefined,
        { status: 409, code: "USER_MUST_REGISTER" },
      );
    }
    const { data, error } = await admin
      .from("colaboradores")
      .insert({
        negocio_id: access.negocioId,
        usuario_id: authUser.id,
        rol,
        sucursal_id: rol === "receptionist" ? sucursalId : null,
        activo: true,
      })
      .select("id, usuario_id, rol, sucursal_id, activo")
      .single();
    if (error || !data) {
      return apiError(error || "No se pudo crear el colaborador.", undefined, {
        status: error?.code === "23505" ? 409 : 500,
        code: error?.code === "23505" ? "STAFF_ALREADY_EXISTS" : undefined,
      });
    }
    return { personal: data };
  }

  const nombre = cleanText(input.nombre, 120);

  const apellido = cleanText(input.apellido, 120);

  const telefono = cleanText(input.telefono, 20) || null;

  if (!nombre || !apellido) {
    return apiError("Nombre y apellido son requeridos.", undefined, {
      status: 400,
    });
  }

  const subscription = await assertActiveSubscription(access.negocioId);

  const branchIds = await allowedBranchIds(admin, access);

  const { count, error: countError } = await admin.from("profesionales")
    .select("id", { count: "exact", head: true }).in("sucursal_id", branchIds).eq("activo", true);

  if (countError) throw countError;

  if ((count ?? 0) >= subscription.limite_profesionales) {
    return apiError("Límite de profesionales alcanzado.", undefined, { status: 409, code: "LIMIT_EXCEEDED" });
  }

  const servicioIds = Array.isArray(input.servicioIds)
    ? [...new Set(input.servicioIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())))]
    : [];

  if (servicioIds.length) {
    const { data: services, error } = await admin
      .from("servicios")
      .select("id")
      .eq("negocio_id", access.negocioId)
      .in("id", servicioIds);
    if (error) throw error;
    if ((services ?? []).length !== servicioIds.length) {
      return apiError("Uno o más servicios no pertenecen al negocio.", undefined, {
        status: 400,
      });
    }
  }

  const { data: professional, error: professionalError } = await admin
    .from("profesionales")
    .insert({
      sucursal_id: sucursalId,
      usuario_id: authUser?.id ?? null,
      nombre,
      apellido,
      email,
      telefono,
      activo: true,
    })
    .select("id, usuario_id, sucursal_id, nombre, apellido, email, telefono, activo")
    .single();

  if (professionalError || !professional) {
    throw professionalError || new Error("No se pudo crear el profesional.");
  }

  if (servicioIds.length) {
    const { error } = await admin.from("profesional_servicios").insert(
      servicioIds.map((servicioId) => ({
        profesional_id: professional.id,
        servicio_id: servicioId,
      })),
    );
    if (error) {
      await admin
        .from("profesionales")
        .delete()
        .eq("id", professional.id)
        .eq("sucursal_id", sucursalId);
      throw error;
    }
  }

  return {
      personal: {
        ...professional,
        kind: "professional",
        rol: "professional",
        servicioIds,
      },
    };
}
