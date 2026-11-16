import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";

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

export function useSpecialSchedules(
  tipo: SaveSpecialScheduleInput["tipo"],
  recursoId?: string,
) {
  return useQuery({
    queryKey: ["negocio", "horarios-especiales", tipo, recursoId],
    queryFn: () =>
      apiFetch<{ excepciones: SpecialSchedule[] }>(
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
      queryClient.invalidateQueries({
        queryKey: ["negocio", "horarios-especiales", input.tipo, input.recursoId],
      });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
  });
}

export function useDeleteSpecialSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Pick<SaveSpecialScheduleInput, "tipo" | "recursoId" | "fecha">,
    ) =>
      apiFetch<{ deleted: boolean }>(
        `/api/negocio/horarios-especiales?tipo=${input.tipo}&recursoId=${encodeURIComponent(input.recursoId)}&fecha=${input.fecha}`,
        { method: "DELETE" },
      ),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ["negocio", "horarios-especiales", input.tipo, input.recursoId],
      });
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
  });
}
