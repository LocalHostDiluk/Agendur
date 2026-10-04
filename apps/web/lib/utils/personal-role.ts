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

export interface PermisoItem {
  id: string;
  nombre: string;
  concedido: boolean;
}

export interface RolPermisoItem {
  id: string;
  nombre: string;
  variant: BadgeVariant;
  descripcion: string;
  permisos: PermisoItem[];
}

export const ROLES_PERMISOS_CATALOGO: RolPermisoItem[] = [
  {
    id: "admin",
    nombre: "Administrador",
    variant: "grape",
    descripcion:
      "Acceso total a la administración, configuración, personal, reportes y facturación.",
    permisos: [
      { id: "p1", nombre: "Gestión completa de citas y reservas", concedido: true },
      { id: "p2", nombre: "Administración de colaboradores y horarios", concedido: true },
      { id: "p3", nombre: "Edición de catálogo de servicios y precios", concedido: true },
      { id: "p4", nombre: "Configuración de sucursales y negocio", concedido: true },
      { id: "p5", nombre: "Visualización de reportes e ingresos", concedido: true },
      { id: "p6", nombre: "Gestión de pasarelas de pago y suscripción", concedido: true },
    ],
  },
  {
    id: "especialista",
    nombre: "Especialista",
    variant: "info",
    descripcion:
      "Profesional operativo que atiende citas y consulta su propia disponibilidad.",
    permisos: [
      { id: "p1", nombre: "Gestión de su propia agenda de citas", concedido: true },
      { id: "p2", nombre: "Visualización de historial de clientes asignados", concedido: true },
      { id: "p3", nombre: "Ajuste de horarios habituales y descansos", concedido: true },
      { id: "p4", nombre: "Edición de datos de otros colaboradores", concedido: false },
      { id: "p5", nombre: "Acceso a reportes financieros y facturación", concedido: false },
    ],
  },
  {
    id: "recepcionista",
    nombre: "Recepcionista",
    variant: "neutral",
    descripcion:
      "Atención al cliente en recepción, asignación de citas y cobros en sucursal.",
    permisos: [
      { id: "p1", nombre: "Creación y reprogramación de citas en sucursal", concedido: true },
      { id: "p2", nombre: "Consulta de disponibilidad de todos los especialistas", concedido: true },
      { id: "p3", nombre: "Registro y actualización de datos de clientes", concedido: true },
      { id: "p4", nombre: "Cobro y registro de anticipos en recepción", concedido: true },
      { id: "p5", nombre: "Baja de personal o cambios en suscripción", concedido: false },
    ],
  },
];
