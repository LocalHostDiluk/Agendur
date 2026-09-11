import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Negocio, Sucursal, Servicio, Profesional } from "@/lib/types";

export interface CatalogoData {
  negocio: Negocio | null;
  sucursales: Sucursal[];
  servicios: Servicio[];
  profesionales: Profesional[];
}

export interface CatalogoResponse {
  data: CatalogoData;
}

export function useCatalogo(slug?: string | null) {
  return useQuery({
    queryKey: ["cliente", "catalogo", slug],
    queryFn: () =>
      apiFetch<CatalogoResponse>(
        `/api/cliente/catalogo?slug=${encodeURIComponent(slug!)}`,
      ),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
}
