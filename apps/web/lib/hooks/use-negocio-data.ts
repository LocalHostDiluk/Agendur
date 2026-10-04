import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type {
  Cita,
  EstadoCita,
  NegocioConfig,
  Profesional,
  CreateProfesionalPayload,
  UpdateProfesionalPayload,
  Servicio,
  Sucursal,
} from "@/lib/types";
import type { SubscriptionUsageStats } from "@/lib/payments/types";

export interface CitasFiltros {
  sucursalId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoCita;
}

export interface SpecialSchedule {
  id: string;
  fecha: string;
  cerrado: boolean;
  inicio: string | null;
  fin: string | null;
  motivo: string | null;
}

export interface SaveSpecialScheduleInput {
  tipo: "sucursal" | "profesional";
  recursoId: string;
  fecha: string;
  cerrado: boolean;
  motivo?: string;
  bloques: { inicio: string; fin: string }[];
}

export function useSucursales() {
  return useQuery({
    queryKey: ["negocio", "sucursales"],
    queryFn: () =>
      apiFetch<{ sucursales: Sucursal[] }>("/api/negocio/sucursales"),
    staleTime: 30 * 1000,
  });
}

export function useSpecialSchedules(
  tipo: SaveSpecialScheduleInput["tipo"],
  recursoId?: string,
) {
  return useQuery({
    queryKey: ["negocio", "horarios-especiales", tipo, recursoId],
    queryFn: () => apiFetch<{ excepciones: SpecialSchedule[] }>(
      `/api/negocio/horarios-especiales?tipo=${tipo}&recursoId=${encodeURIComponent(recursoId!)}`,
    ),
    enabled: Boolean(recursoId),
    staleTime: 30 * 1000,
  });
}

export function useSaveSpecialSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveSpecialScheduleInput) =>
      apiFetch<{ excepciones: SpecialSchedule[] }>("/api/negocio/horarios-especiales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "horarios-especiales", input.tipo, input.recursoId] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
  });
}

export function useDeleteSpecialSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<SaveSpecialScheduleInput, "tipo" | "recursoId" | "fecha">) =>
      apiFetch<{ deleted: boolean }>(
        `/api/negocio/horarios-especiales?tipo=${input.tipo}&recursoId=${encodeURIComponent(input.recursoId)}&fecha=${input.fecha}`,
        { method: "DELETE" },
      ),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "horarios-especiales", input.tipo, input.recursoId] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
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

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Partial<NegocioConfig> & {
        monedaPrincipal?: string;
        logoUrl?: string | null;
      },
    ) =>
      apiFetch<{
        configuracion: NegocioConfig & {
          id?: string;
          monedaPrincipal?: string;
          logoUrl?: string | null;
        };
      }>("/api/negocio/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "configuracion"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useCitasNegocio(filtros?: CitasFiltros) {
  return useQuery({
    queryKey: ["negocio", "citas", filtros],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (filtros?.sucursalId)
        searchParams.set("sucursalId", filtros.sucursalId);
      if (filtros?.fechaInicio)
        searchParams.set("fechaInicio", filtros.fechaInicio);
      if (filtros?.fechaFin) searchParams.set("fechaFin", filtros.fechaFin);
      if (filtros?.estado) searchParams.set("estado", filtros.estado);
      const qs = searchParams.toString();
      return apiFetch<{ citas: Cita[] }>(
        `/api/negocio/citas${qs ? `?${qs}` : ""}`,
      );
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateCitaEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      citaId,
      nuevoEstado,
      notas,
    }: {
      citaId: string;
      nuevoEstado?: EstadoCita;
      notas?: string;
    }) =>
      apiFetch<{ cita: Cita }>("/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citaId,
          ...(nuevoEstado ? { nuevoEstado } : {}),
          ...(notas !== undefined ? { notas } : {}),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "citas"] });
    },
  });
}

export function useCreateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      nuevaSucursal: Partial<Sucursal> & {
        nombre: string;
        direccion: string;
        ciudad: string;
        telefono: string;
      },
    ) =>
      apiFetch<{ sucursal: Sucursal }>("/api/negocio/sucursales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSucursal),
      }),
    onSuccess: (data) => {
      if (data?.sucursal) {
        queryClient.setQueryData<{ sucursales: Sucursal[] }>(
          ["negocio", "sucursales"],
          (old) => {
            if (!old?.sucursales) return { sucursales: [data.sucursal] };
            return { ...old, sucursales: [...old.sucursales, data.sucursal] };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
  });
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...cambios }: Partial<Sucursal> & { id: string }) =>
      apiFetch<{ sucursal: Sucursal }>("/api/negocio/sucursales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...cambios }),
      }),
    onSuccess: (data, vars) => {
      if (data?.sucursal) {
        queryClient.setQueryData<{ sucursales: Sucursal[] }>(
          ["negocio", "sucursales"],
          (old) => {
            if (!old?.sucursales) return old;
            return {
              ...old,
              sucursales: old.sucursales.map((s) =>
                s.id === vars.id ? { ...s, ...data.sucursal } : s,
              ),
            };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
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

export function useCreateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevoServicio: {
      nombre: string;
      duracion_minutos: number;
      buffer_minutos?: number;
      precio: number;
      descripcion?: string;
    }) =>
      apiFetch<{ servicio: Servicio }>("/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoServicio),
      }),
    onSuccess: (data) => {
      if (data?.servicio) {
        queryClient.setQueryData<{ servicios: Servicio[] }>(
          ["negocio", "servicios"],
          (old) => {
            if (!old?.servicios) return { servicios: [data.servicio] };
            return { ...old, servicios: [...old.servicios, data.servicio] };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["negocio", "servicios"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
  });
}

export function useUpdateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...cambios }: Partial<Servicio> & { id: string }) =>
      apiFetch<{ servicio: Servicio }>("/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...cambios }),
      }),
    onSuccess: (data, vars) => {
      if (data?.servicio) {
        queryClient.setQueryData<{ servicios: Servicio[] }>(
          ["negocio", "servicios"],
          (old) => {
            if (!old?.servicios) return old;
            return {
              ...old,
              servicios: old.servicios.map((s) =>
                s.id === vars.id ? { ...s, ...data.servicio } : s,
              ),
            };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["negocio", "servicios"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
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

export function useCreateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevoProfesional: CreateProfesionalPayload) =>
      apiFetch<{ profesional: Profesional & { serviciosIds: string[] } }>(
        "/api/negocio/profesionales",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoProfesional),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", "suscripcion"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
  });
}

export function useUpdateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cambios: UpdateProfesionalPayload) =>
      apiFetch<{ profesional: Profesional & { serviciosIds: string[] } }>(
        "/api/negocio/profesionales",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cambios),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", "suscripcion"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
  });
}

export function useDeleteProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean; id: string }>(
        `/api/negocio/profesionales?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", "suscripcion"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "catalogo"] });
    },
  });
}

