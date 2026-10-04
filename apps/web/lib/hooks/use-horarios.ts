import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";

export interface BranchScheduleItem {
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
}

export interface ProfessionalScheduleItem {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export function useHorariosSucursal(sucursalId?: string) {
  return useQuery({
    queryKey: ["negocio", "sucursales", sucursalId, "horarios"],
    queryFn: () =>
      apiFetch<{ horarios: BranchScheduleItem[] }>(
        `/api/negocio/sucursales/horarios?sucursalId=${encodeURIComponent(sucursalId!)}`,
      ),
    enabled: Boolean(sucursalId),
    staleTime: 30 * 1000,
  });
}

export function useUpdateHorariosSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sucursalId,
      horarios,
    }: {
      sucursalId: string;
      horarios: BranchScheduleItem[];
    }) =>
      apiFetch<{ horarios: BranchScheduleItem[] }>("/api/negocio/sucursales/horarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sucursalId, horarios }),
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales", vars.sucursalId, "horarios"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
    },
  });
}

export function useHorariosProfesional(profesionalId?: string) {
  return useQuery({
    queryKey: ["negocio", "profesionales", profesionalId, "horarios"],
    queryFn: () =>
      apiFetch<{ horarios: ProfessionalScheduleItem[] }>(
        `/api/negocio/profesionales/horarios?profesionalId=${encodeURIComponent(profesionalId!)}`,
      ),
    enabled: Boolean(profesionalId),
    staleTime: 30 * 1000,
  });
}

export function useUpdateHorariosProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profesionalId,
      horarios,
    }: {
      profesionalId: string;
      horarios: ProfessionalScheduleItem[];
    }) =>
      apiFetch<{ horarios: ProfessionalScheduleItem[] }>("/api/negocio/profesionales/horarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profesionalId, horarios }),
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales", vars.profesionalId, "horarios"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", "profesionales"] });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
  });
}
