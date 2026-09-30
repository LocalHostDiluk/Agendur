import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import {
  NegocioAccessError,
  requireNegocioAccess,
  type NegocioAccess,
} from "@/lib/auth/negocio-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { assertActiveSubscription, SubscriptionExpiredError } from "@/lib/payments/guards";

type StaffRole = "manager" | "receptionist" | "professional";

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, {
    status: error.status,
    code: error.code,
  });
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" && value.trim().length <= max
    ? value.trim()
    : "";
}

function cleanEmail(value: unknown): string {
  const email = cleanText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<User | null> {
  // ponytail: scans up to 100k accounts; indexed server lookup when the tenant directory grows.
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    const exact = data.users.find(
      (user) => user.email?.trim().toLowerCase() === email,
    );
    if (exact) return exact;
    if (data.users.length < 1000 || page >= (data.lastPage ?? page)) break;
  }
  return null;
}

async function allowedBranchIds(
  admin: ReturnType<typeof createAdminClient>,
  access: NegocioAccess,
): Promise<string[]> {
  let query = admin
    .from("sucursales")
    .select("id")
    .eq("negocio_id", access.negocioId);
  if (access.sucursalId) query = query.eq("id", access.sucursalId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((branch) => branch.id);
}

async function branchBelongsToBusiness(
  admin: ReturnType<typeof createAdminClient>,
  negocioId: string,
  sucursalId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("sucursales")
    .select("id")
    .eq("id", sucursalId)
    .eq("negocio_id", negocioId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function GET(): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:read");
    const admin = createAdminClient();
    const branchIds = await allowedBranchIds(admin, access);

    let collaboratorsQuery = admin
      .from("colaboradores")
      .select("id, usuario_id, rol, sucursal_id, activo")
      .eq("negocio_id", access.negocioId);
    if (access.sucursalId) {
      collaboratorsQuery = collaboratorsQuery.eq(
        "sucursal_id",
        access.sucursalId,
      );
    }
    const { data: collaborators, error: collaboratorsError } =
      await collaboratorsQuery.order("created_at", { ascending: true });
    if (collaboratorsError) throw collaboratorsError;

    const { data: professionals, error: professionalsError } = branchIds.length
      ? await admin
          .from("profesionales")
          .select(
            "id, usuario_id, sucursal_id, nombre, apellido, email, telefono, activo",
          )
          .in("sucursal_id", branchIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };
    if (professionalsError) throw professionalsError;

    const collaboratorUserIds = (collaborators ?? []).map(
      (item) => item.usuario_id,
    );
    const { data: profiles, error: profilesError } = collaboratorUserIds.length
      ? await admin
          .from("perfiles_usuario")
          .select("usuario_id, nombres, apellidos, telefono")
          .in("usuario_id", collaboratorUserIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;

    const authUsers = new Map<string, User>();
    await Promise.all(
      collaboratorUserIds.map(async (id) => {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error) throw error;
        if (data.user) authUsers.set(id, data.user);
      }),
    );
    const profileByUser = new Map(
      (profiles ?? []).map((profile) => [profile.usuario_id, profile]),
    );

    const professionalIds = (professionals ?? []).map((item) => item.id);
    const schedules = professionalIds.length
      ? await admin.from("horarios_profesional").select("profesional_id, dia_semana, hora_inicio, hora_fin").in("profesional_id", professionalIds)
      : { data: [], error: null };
    if (schedules.error) throw schedules.error;
    const { data: assignments, error: assignmentsError } =
      professionalIds.length
        ? await admin
            .from("profesional_servicios")
            .select("profesional_id, servicio_id")
            .in("profesional_id", professionalIds)
        : { data: [], error: null };
    if (assignmentsError) throw assignmentsError;

    const serviceIdsByProfessional = new Map<string, string[]>();
    for (const assignment of assignments ?? []) {
      const ids = serviceIdsByProfessional.get(assignment.profesional_id) ?? [];
      ids.push(assignment.servicio_id);
      serviceIdsByProfessional.set(assignment.profesional_id, ids);
    }

    const personal = [
      ...(collaborators ?? []).map((item) => {
        const profile = profileByUser.get(item.usuario_id);
        return {
          id: item.id,
          kind: "collaborator" as const,
          usuarioId: item.usuario_id,
          nombre: profile?.nombres ?? "",
          apellido: profile?.apellidos ?? "",
          email: authUsers.get(item.usuario_id)?.email ?? "",
          telefono: profile?.telefono ?? null,
          rol: item.rol as "manager" | "receptionist",
          sucursalId: item.sucursal_id,
          activo: item.activo,
          servicioIds: [],
        };
      }),
      ...(professionals ?? []).map((item) => ({
        id: item.id,
        kind: "professional" as const,
        usuarioId: item.usuario_id,
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email ?? "",
        telefono: item.telefono,
        rol: "professional" as const,
        sucursalId: item.sucursal_id,
        activo: item.activo,
        servicioIds: serviceIdsByProfessional.get(item.id) ?? [],
        horarios: (schedules.data ?? []).filter(h => h.profesional_id === item.id),
      })),
    ];

    return apiSuccess({ personal });
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "No se pudo consultar el personal.", {
      extra: { route: "GET /api/negocio/personal" },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:write");
    const admin = createAdminClient();
    const body: unknown = await request.json().catch(() => null);
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
      return apiSuccess({ personal: data }, 201);
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

    return apiSuccess(
      {
        personal: {
          ...professional,
          kind: "professional",
          rol: "professional",
          servicioIds,
        },
      },
      201,
    );
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    if (error instanceof SubscriptionExpiredError) return apiError(error.message, undefined, { status: 402, code: error.code });
    return apiError(error, "No se pudo crear el personal.", {
      extra: { route: "POST /api/negocio/personal" },
    });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:write");
    const admin = createAdminClient();
    const body: unknown = await request.json().catch(() => null);
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
      return apiSuccess({ personal: data });
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
    return apiSuccess({ personal: data });
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    if (error instanceof SubscriptionExpiredError) return apiError(error.message, undefined, { status: 402, code: error.code });
    return apiError(error, "No se pudo actualizar el personal.", {
      extra: { route: "PATCH /api/negocio/personal" },
    });
  }
}
