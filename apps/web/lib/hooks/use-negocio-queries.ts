import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type {
  NegocioConfig,
  Profesional,
  Servicio,
  Sucursal,
} from "@/lib/types";
import type { SubscriptionUsageStats } from "@/lib/payments/types";

export function useSucursales() {
  return useQuery({
    queryKey: ["negocio", "sucursales"],
    queryFn: () =>
      apiFetch<{ sucursales: Sucursal[] }>("/api/negocio/sucursales"),
    staleTime: 30 * 1000,
  });
}

export function useSuscripcion(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["negocio", "suscripcion"],
    queryFn: () =>
      apiFetch<{ data: SubscriptionUsageStats }>("/api/negocio/suscripcion"),
    staleTime: 30 * 1000,
  });
}

export function useConfiguracion(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["negocio", "configuracion"],
    queryFn: () =>
      apiFetch<{
        configuracion: Omit<NegocioConfig, "whatsappNotificaciones"> & {
          id?: string;
          monedaPrincipal?: string;
          logoUrl?: string | null;
        };
      }>("/api/negocio/configuracion"),
    staleTime: 30 * 1000,
  });
}

export function useServicios() {
  return useQuery({
    queryKey: ["negocio", "servicios"],
    queryFn: () =>
      apiFetch<{ servicios: Servicio[] }>("/api/negocio/servicios"),
    staleTime: 30 * 1000,
  });
}

export function useProfesionales(filtros?: { sucursalId?: string; activo?: boolean }) {
  return useQuery({
    queryKey: ["negocio", "profesionales", filtros],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (filtros?.sucursalId && filtros.sucursalId !== "todas") {
        searchParams.set("sucursalId", filtros.sucursalId);
      }
      if (filtros?.activo !== undefined) {
        searchParams.set("activo", String(filtros.activo));
      }
      const qs = searchParams.toString();
      return apiFetch<{ profesionales: (Profesional & { serviciosIds: string[] })[] }>(
        `/api/negocio/profesionales${qs ? `?${qs}` : ""}`,
      );
    },
    staleTime: 30 * 1000,
  });
}
