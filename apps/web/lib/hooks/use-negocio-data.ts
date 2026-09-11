import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Cita, EstadoCita, NegocioConfig, Sucursal } from "@/lib/types";
import type { SubscriptionUsageStats } from "@/lib/payments/types";

export interface CitasFiltros {
  sucursalId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoCita;
}

export function useSucursales() {
  return useQuery({
    queryKey: ["negocio", "sucursales"],
    queryFn: () => apiFetch<{ sucursales: Sucursal[] }>("/api/negocio/sucursales"),
    staleTime: 30 * 1000,
  });
}

export function useSuscripcion() {
  return useQuery({
    queryKey: ["negocio", "suscripcion"],
    queryFn: () => apiFetch<{ data: SubscriptionUsageStats }>("/api/negocio/suscripcion"),
    staleTime: 30 * 1000,
  });
}

export function useConfiguracion() {
  return useQuery({
    queryKey: ["negocio", "configuracion"],
    queryFn: () =>
      apiFetch<{ configuracion: Omit<NegocioConfig, "whatsappNotificaciones"> }>(
        "/api/negocio/configuracion",
      ),
    staleTime: 30 * 1000,
  });
}

export function useCitasNegocio(filtros?: CitasFiltros) {
  return useQuery({
    queryKey: ["negocio", "citas", filtros],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (filtros?.sucursalId) searchParams.set("sucursalId", filtros.sucursalId);
      if (filtros?.fechaInicio) searchParams.set("fechaInicio", filtros.fechaInicio);
      if (filtros?.fechaFin) searchParams.set("fechaFin", filtros.fechaFin);
      if (filtros?.estado) searchParams.set("estado", filtros.estado);
      const qs = searchParams.toString();
      return apiFetch<{ citas: Cita[] }>(`/api/negocio/citas${qs ? `?${qs}` : ""}`);
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateCitaEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ citaId, nuevoEstado }: { citaId: string; nuevoEstado: EstadoCita }) =>
      apiFetch<{ cita: Cita }>("/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId, nuevoEstado }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "citas"] });
    },
  });
}
