import type { Sucursal, Servicio } from "@/lib/types";

export type SucursalWithPersonal = Sucursal & { personal?: number };

export function formatSucursalLocation(suc: {
  direccion: string;
  ciudad?: string | null;
  estado_provincia?: string | null;
}): string {
  return `${suc.direccion}${suc.ciudad ? ` · ${suc.ciudad}` : ""}${
    suc.estado_provincia ? `, ${suc.estado_provincia}` : ""
  }`;
}

export function getSucursalPersonalCount(suc: SucursalWithPersonal): number {
  return suc.personalCount ?? suc.personal ?? 0;
}

export function getServicioDuracion(servicio: Servicio): number {
  return servicio.duracion_minutos ?? servicio.duracionMinutos ?? 30;
}

export function formatServicioPrecio(precio: number | string): string {
  return Number(precio).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
