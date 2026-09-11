import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";

export interface DisponibilidadParams {
  sucursalId?: string;
  servicioId?: string;
  fecha?: string;
  profesionalId?: string;
}

export function useDisponibilidad(params: DisponibilidadParams) {
  return useQuery({
    queryKey: [
      "cliente",
      "disponibilidad",
      params.sucursalId,
      params.servicioId,
      params.fecha,
      params.profesionalId,
    ],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.sucursalId) searchParams.set("sucursalId", params.sucursalId);
      if (params.servicioId) searchParams.set("servicioId", params.servicioId);
      if (params.fecha) searchParams.set("fecha", params.fecha);
      if (params.profesionalId) searchParams.set("profesionalId", params.profesionalId);
      const qs = searchParams.toString();
      return apiFetch<{ horarios: string[] }>(`/api/cliente/disponibilidad?${qs}`);
    },
    enabled: Boolean(params.sucursalId && params.servicioId && params.fecha),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
