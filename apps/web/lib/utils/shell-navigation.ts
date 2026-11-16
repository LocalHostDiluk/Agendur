import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Store,
  Users,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavModuleItem {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled: boolean;
  badge?: string;
}

export interface ShellSucursal {
  id: string;
  nombre: string;
  direccion?: string | null;
  ciudad?: string | null;
  es_matriz?: boolean;
}

export const navModules: NavModuleItem[] = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    disabled: false,
  },
  {
    name: "Calendario",
    href: "/agendas",
    icon: Calendar,
    disabled: false,
  },
  {
    name: "Servicios y sucursales",
    href: "/sucursales",
    icon: Store,
    disabled: false,
  },
  {
    name: "Personal",
    href: "/personal",
    icon: Users,
    disabled: false,
  },
  {
    name: "Pagos y facturación",
    href: "/pagos",
    icon: CreditCard,
    disabled: false,
    badge: "Nuevo",
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    disabled: false,
    badge: "Nuevo",
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Settings,
    disabled: false,
  },
];

export const emptySubscribe = () => () => {};

export function getIsMacSnapshot(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)
  );
}

export function getServerIsMacSnapshot(): boolean {
  return false;
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Inicio";
  if (pathname.startsWith("/agendas")) return "Calendario";
  if (pathname.startsWith("/sucursales")) return "Servicios y sucursales";
  if (pathname.startsWith("/personal")) return "Personal";
  if (pathname.startsWith("/pagos")) return "Pagos y facturación";
  if (pathname.startsWith("/reportes")) return "Reportes";
  if (pathname.startsWith("/configuracion")) return "Configuración";
  return "Inicio";
}
