import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Cita, EstadoCita } from "@/lib/types";

export interface CitasFiltros {
  sucursalId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoCita;
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
