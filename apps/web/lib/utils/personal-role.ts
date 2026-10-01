import type { BadgeVariant } from "@/components/ui/Badge";

export function getRoleBadgeVariant(rol?: string): BadgeVariant {
  const r = (rol || "").toLowerCase();
  if (r.includes("admin")) return "grape";
  if (r.includes("recep")) return "neutral";
  if (r.includes("especialista")) return "info";
  return "neutral";
}

export function formatRoleLabel(rol?: string): string {
  if (!rol) return "Especialista";
  const r = rol.toLowerCase();
  if (r.includes("admin")) return "Administrador";
  if (r.includes("recep")) return "Recepcionista";
  if (r.includes("especialista")) return "Especialista";
  return rol;
}

