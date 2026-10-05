import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NegocioAccess } from "@/lib/auth/negocio-access";

export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" && value.trim().length <= max
    ? value.trim()
    : "";
}

export function cleanEmail(value: unknown): string {
  const email = cleanText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export async function findAuthUserByEmail(
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

export async function allowedBranchIds(
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

export async function branchBelongsToBusiness(
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

export async function consultarPersonal(access: NegocioAccess) {
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

  return { personal };
}
