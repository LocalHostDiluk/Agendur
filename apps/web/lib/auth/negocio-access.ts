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

export async function resolveNegocioAccess(): Promise<NegocioAccess> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new NegocioAccessError(
      401,
      "AUTH_REQUIRED",
      "No autorizado. Sesión requerida.",
    );
  }

  const admin = createAdminClient();
  const { data: ownedBusinesses, error: ownerError } = await admin
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .is("desactivado_at", null)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1);

  if (ownerError) {
    throw new NegocioAccessError(
      503,
      "ACCESS_LOOKUP_FAILED",
      "No se pudo resolver el acceso al negocio.",
    );
  }
  const ownedBusiness = ownedBusinesses?.[0];
  if (ownedBusiness) {
    return {
      user,
      negocioId: ownedBusiness.id,
      role: "owner",
      sucursalId: null,
      profesionalId: null,
    };
  }

  const { data: collaborators, error: collaboratorError } = await admin
    .from("colaboradores")
    .select("negocio_id, sucursal_id, rol")
    .eq("usuario_id", user.id)
    .eq("activo", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1);

  if (collaboratorError) {
    throw new NegocioAccessError(
      503,
      "ACCESS_LOOKUP_FAILED",
      "No se pudo resolver el acceso al negocio.",
    );
  }
  const collaborator = collaborators?.[0];
  if (collaborator) {
    const { data: activeBusiness, error: businessError } = await admin
      .from("negocios")
      .select("id")
      .eq("id", collaborator.negocio_id)
      .is("desactivado_at", null)
      .maybeSingle();
    if (businessError) {
      throw new NegocioAccessError(
        503,
        "ACCESS_LOOKUP_FAILED",
        "No se pudo resolver el acceso al negocio.",
      );
    }
    if (!activeBusiness) {
      throw new NegocioAccessError(
        403,
        "BUSINESS_ACCESS_DENIED",
        "Esta cuenta no tiene acceso activo a un negocio.",
      );
    }
    const role = mapCollaboratorRole(collaborator.rol);
    if (!role) {
      throw new NegocioAccessError(
        403,
        "INVALID_BUSINESS_ROLE",
        "El rol asignado no es válido.",
      );
    }
    if (role === "receptionist" && !collaborator.sucursal_id) {
      throw new NegocioAccessError(
        403,
        "INVALID_BUSINESS_SCOPE",
        "El acceso asignado no tiene una sucursal válida.",
      );
    }
    return {
      user,
      negocioId: collaborator.negocio_id,
      role,
      sucursalId: collaborator.sucursal_id ?? null,
      profesionalId: null,
    };
  }

  const { data: professionals, error: professionalError } = await admin
    .from("profesionales")
    .select("id, sucursal_id")
    .eq("usuario_id", user.id)
    .eq("activo", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1);

  if (professionalError) {
    throw new NegocioAccessError(
      503,
      "ACCESS_LOOKUP_FAILED",
      "No se pudo resolver el acceso al negocio.",
    );
  }
  const professional = professionals?.[0];
  if (professional) {
    const { data: branch, error: branchError } = await admin
      .from("sucursales")
      .select("negocio_id")
      .eq("id", professional.sucursal_id)
      .maybeSingle();
    if (branchError) {
      throw new NegocioAccessError(
        503,
        "ACCESS_LOOKUP_FAILED",
        "No se pudo resolver el acceso al negocio.",
      );
    }
    if (branch) {
      const { data: activeBusiness, error: businessError } = await admin
        .from("negocios")
        .select("id")
        .eq("id", branch.negocio_id)
        .is("desactivado_at", null)
        .maybeSingle();
      if (businessError) {
        throw new NegocioAccessError(
          503,
          "ACCESS_LOOKUP_FAILED",
          "No se pudo resolver el acceso al negocio.",
        );
      }
      if (!activeBusiness) {
        throw new NegocioAccessError(
          403,
          "BUSINESS_ACCESS_DENIED",
          "Esta cuenta no tiene acceso activo a un negocio.",
        );
      }
      return {
        user,
        negocioId: branch.negocio_id,
        role: "professional",
        sucursalId: professional.sucursal_id,
        profesionalId: professional.id,
      };
    }
  }

  throw new NegocioAccessError(
    403,
    "BUSINESS_ACCESS_DENIED",
    "Esta cuenta no tiene acceso activo a un negocio.",
  );
}

export async function requireNegocioAccess(
  capability: NegocioCapability,
): Promise<NegocioAccess> {
  const access = await resolveNegocioAccess();
  if (!hasCapability(access, capability)) {
    throw new NegocioAccessError(
      403,
      "BUSINESS_ACCESS_DENIED",
      "No tienes permiso para realizar esta operación.",
    );
  }
  return access;
}
