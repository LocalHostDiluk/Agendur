import type { Sucursal, Servicio, Profesional } from "@/lib/types";

export const FRANJAS_HORARIAS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

export function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDefaultSucursalId(list: Sucursal[]): string {
  const matriz = list.find((s) => s.activa && s.es_matriz);
  if (matriz) return matriz.id;
  const primeraActiva = list.find((s) => s.activa);
  if (primeraActiva) return primeraActiva.id;
  return list[0]?.id || "";
}

export function getDefaultServicioId(list: Servicio[]): string {
  const primerActivo = list.find((s) => s.activo !== false);
  return primerActivo?.id || list[0]?.id || "";
}

export function formatServicioOption(s: Servicio): string {
  const duracion = s.duracion_minutos ?? s.duracionMinutos ?? 30;
  return `${s.nombre} — ${duracion} min — $${s.precio} MXN`;
}

export function resolveProfesionalId(
  profesionales: Profesional[],
  sucursalId: string,
  servicioId: string,
  fallbackNegocioId?: string,
): string {
  // ponytail: Auto-selects first eligible professional from catalog for the chosen branch/service.
  // Ceiling: Does not allow reception to choose specific staff member manually.
  // Upgrade path: Add optional professional dropdown selector in form.
  const profEnSucursal =
    profesionales.find(
      (p) =>
        (p.sucursal_id === sucursalId || p.sucursalId === sucursalId) &&
        (!p.serviciosIds ||
          p.serviciosIds.length === 0 ||
          p.serviciosIds.includes(servicioId)),
    ) ||
    profesionales.find(
      (p) => p.sucursal_id === sucursalId || p.sucursalId === sucursalId,
    ) ||
    profesionales[0];

  return (
    profEnSucursal?.id ||
    fallbackNegocioId ||
    "00000000-0000-0000-0000-000000000000"
  );
}
