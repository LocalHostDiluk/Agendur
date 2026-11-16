import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type {
  NegocioConfig,
  Profesional,
  CreateProfesionalPayload,
  UpdateProfesionalPayload,
  Servicio,
  Sucursal,
} from "@/lib/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NegocioConfig> & { monedaPrincipal?: string; logoUrl?: string | null }) =>
      apiFetch<{ configuracion: NegocioConfig & { id?: string; monedaPrincipal?: string; logoUrl?: string | null } }>(
        "/api/negocio/configuracion",
        { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(payload) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "configuracion"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useCreateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevaSucursal: Partial<Sucursal> & { nombre: string; direccion: string; ciudad: string; telefono: string }) =>
      apiFetch<{ sucursal: Sucursal }>("/api/negocio/sucursales", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(nuevaSucursal) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales"] }),
  });
}

export function useCreateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevoServicio: { nombre: string; duracion_minutos: number; buffer_minutos?: number; precio: number; descripcion?: string }) =>
      apiFetch<{ servicio: Servicio }>("/api/negocio/servicios", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(nuevoServicio) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["negocio", "servicios"] }),
  });
}

export function useUpdateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...cambios }: Partial<Servicio> & { id: string }) =>
      apiFetch<{ servicio: Servicio }>("/api/negocio/servicios", { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ id, ...cambios }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["negocio", "servicios"] }),
  });
}

function invalidateProfesionales(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
  queryClient.invalidateQueries({ queryKey: ["negocio", "suscripcion"] });
  queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
}

export function useCreateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevoProfesional: CreateProfesionalPayload) =>
      apiFetch<{ profesional: Profesional & { serviciosIds: string[] } }>("/api/negocio/profesionales", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(nuevoProfesional) }),
    onSuccess: () => invalidateProfesionales(queryClient),
  });
}

export function useUpdateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cambios: UpdateProfesionalPayload) =>
      apiFetch<{ profesional: Profesional & { serviciosIds: string[] } }>("/api/negocio/profesionales", { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(cambios) }),
    onSuccess: () => invalidateProfesionales(queryClient),
  });
}

export function useDeleteProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean; id: string }>(`/api/negocio/profesionales?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => invalidateProfesionales(queryClient),
  });
}
