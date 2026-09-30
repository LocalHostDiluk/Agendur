import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type NegocioRole =
  | "owner"
  | "manager"
  | "receptionist"
  | "professional";

export type NegocioCapability =
  | "appointments:read"
  | "appointments:write"
  | "branches:read"
  | "branches:write"
  | "services:read"
  | "services:write"
  | "staff:read"
  | "staff:write"
  | "config:read"
  | "config:write"
  | "billing:read"
  | "billing:write";

export const ROLE_CAPABILITIES: Record<
  NegocioRole,
  readonly NegocioCapability[]
> = {
  owner: [
    "appointments:read",
    "appointments:write",
    "branches:read",
    "branches:write",
    "services:read",
    "services:write",
    "staff:read",
    "staff:write",
    "config:read",
    "config:write",
    "billing:read",
    "billing:write",
  ],
  manager: [
    "appointments:read",
    "appointments:write",
    "branches:read",
    "branches:write",
    "services:read",
    "services:write",
    "staff:read",
  ],
  receptionist: [
    "appointments:read",
    "appointments:write",
    "branches:read",
    "services:read",
    "staff:read",
  ],
  professional: [
    "appointments:read",
    "branches:read",
    "services:read",
  ],
};

export interface NegocioAccess {
  user: { id: string; email?: string };
  negocioId: string;
  role: NegocioRole;
  sucursalId: string | null;
  profesionalId: string | null;
  profesionalIds?: string[];
  sucursalIds?: string[];
}

export class NegocioAccessError extends Error {
  constructor(
    public readonly status: 401 | 403 | 503,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function hasCapability(
  access: Pick<NegocioAccess, "role">,
  capability: NegocioCapability,
): boolean {
  return ROLE_CAPABILITIES[access.role].includes(capability);
}

function mapCollaboratorRole(value: unknown): NegocioRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "manager" || normalized === "gerente") return "manager";
  if (
    normalized === "receptionist" ||
    normalized === "recepcionista"
  ) {
    return "receptionist";
  }
  return null;
}

export async function listNegocioAccess(user: NegocioAccess["user"]): Promise<(NegocioAccess & { nombre: string })[]> {
  const admin = createAdminClient();
  const [owned, collaborators, professionals] = await Promise.all([
    admin.from("negocios").select("id, nombre_comercial")
    .eq("owner_id", user.id).is("desactivado_at", null)
    .order("created_at", { ascending: true }).order("id", { ascending: true }),
    admin.from("colaboradores").select("negocio_id, sucursal_id, rol")
    .eq("usuario_id", user.id).eq("activo", true).order("created_at", { ascending: true }),
    admin.from("profesionales").select("id, sucursal_id")
    .eq("usuario_id", user.id).eq("activo", true).order("created_at", { ascending: true }).order("id", { ascending: true }),
  ]);
  if (owned.error || collaborators.error || professionals.error) {
    throw new NegocioAccessError(503, "ACCESS_LOOKUP_FAILED", "No se pudo resolver el acceso al negocio.");
  }
  const branchIds = (professionals.data ?? []).map(p => p.sucursal_id);
  const branches = branchIds.length
    ? await admin.from("sucursales").select("id, negocio_id").in("id", branchIds)
    : { data: [], error: null };
  if (branches.error) throw new NegocioAccessError(503, "ACCESS_LOOKUP_FAILED", "No se pudo consultar las sucursales.");
  const businessIds = [...new Set([
    ...(collaborators.data ?? []).map(c => c.negocio_id),
    ...(branches.data ?? []).map(s => s.negocio_id),
  ])];
  const businesses = businessIds.length
    ? await admin.from("negocios").select("id, nombre_comercial").in("id", businessIds).is("desactivado_at", null)
    : { data: [], error: null };
  if (businesses.error) throw new NegocioAccessError(503, "ACCESS_LOOKUP_FAILED", "No se pudo consultar los negocios.");
  const active = new Map((businesses.data ?? []).map(n => [n.id, n.nombre_comercial]));
  const accesses = new Map<string, NegocioAccess & { nombre: string }>();
  for (const n of owned.data ?? []) {
    accesses.set(n.id, { user, negocioId: n.id, nombre: n.nombre_comercial, role: "owner", sucursalId: null, profesionalId: null });
  }
  for (const c of collaborators.data ?? []) {
    const role = mapCollaboratorRole(c.rol);
    if (!active.has(c.negocio_id) || !role || (role === "receptionist" && !c.sucursal_id)) continue;
    if (!accesses.has(c.negocio_id)) accesses.set(c.negocio_id, {
      user, negocioId: c.negocio_id, nombre: active.get(c.negocio_id)!, role, sucursalId: c.sucursal_id, profesionalId: null,
    });
  }
  for (const p of professionals.data ?? []) {
    const branch = (branches.data ?? []).find(s => s.id === p.sucursal_id);
    if (!branch || !active.has(branch.negocio_id)) continue;
    const existing = accesses.get(branch.negocio_id);
    if (existing) {
      if (existing.role === "professional") {
        existing.profesionalIds!.push(p.id);
        if (!existing.sucursalIds!.includes(p.sucursal_id)) existing.sucursalIds!.push(p.sucursal_id);
      }
      continue;
    }
    accesses.set(branch.negocio_id, {
      user, negocioId: branch.negocio_id, nombre: active.get(branch.negocio_id)!, role: "professional",
      sucursalId: p.sucursal_id, profesionalId: p.id, sucursalIds: [p.sucursal_id], profesionalIds: [p.id],
    });
  }
  return [...accesses.values()];
}

export async function resolveNegocioAccess(): Promise<NegocioAccess> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new NegocioAccessError(401, "AUTH_REQUIRED", "No autorizado. Sesión requerida.");
  const accesses = await listNegocioAccess(user);
  let selected: string | undefined;
  try { selected = (await cookies()).get("agendur_business")?.value; } catch { /* Test without request context. */ }
  const access = selected ? accesses.find(a => a.negocioId === selected) : accesses[0];
  if (!access) throw new NegocioAccessError(403, "BUSINESS_ACCESS_DENIED", "Esta cuenta no tiene acceso activo al negocio.");
  return access;
}

export async function requireNegocioAccess(capability: NegocioCapability): Promise<NegocioAccess> {
  const access = await resolveNegocioAccess();
  if (!hasCapability(access, capability)) {
    throw new NegocioAccessError(403, "BUSINESS_ACCESS_DENIED", "No tienes permiso para realizar esta operación.");
  }
  return access;
}
