"use client";

import { useMemo, useState } from "react";
import {
  useDeleteSpecialSchedule,
  useSaveSpecialSchedule,
  useSpecialSchedules,
  type SpecialSchedule,
} from "@/lib/hooks";
import type { Profesional, Sucursal } from "@/lib/types";
import { notify } from "@/lib/utils/toast";

export type ResourceType = "sucursal" | "profesional";
export type SpecialBlock = { inicio: string; fin: string };

export function useHorariosEspecialesState(
  sucursales: Sucursal[],
  profesionales: Profesional[],
) {
  const [tipo, setTipo] = useState<ResourceType>("profesional");
  const [selectedId, setSelectedId] = useState("");
  const [fecha, setFecha] = useState("");
  const [cerrado, setCerrado] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [bloques, setBloques] = useState<SpecialBlock[]>([{ inicio: "09:00", fin: "17:00" }]);

  const resources =
    tipo === "sucursal"
      ? sucursales.map((item) => ({ id: item.id, label: item.nombre }))
      : profesionales.map((item) => ({
          id: item.id,
          label: `${item.nombre} ${item.apellido ?? ""}`.trim(),
        }));
  const recursoId = resources.some((item) => item.id === selectedId)
    ? selectedId
    : resources[0]?.id;
  const schedules = useSpecialSchedules(tipo, recursoId);
  const save = useSaveSpecialSchedule();
  const remove = useDeleteSpecialSchedule();

  const grouped = useMemo(() => {
    const result = new Map<string, SpecialSchedule[]>();
    for (const item of schedules.data?.excepciones ?? []) {
      const rows = result.get(item.fecha) ?? [];
      rows.push(item);
      result.set(item.fecha, rows);
    }
    return [...result.entries()];
  }, [schedules.data?.excepciones]);

  function editSchedule(date: string, rows: SpecialSchedule[]) {
    setFecha(date);
    setCerrado(rows[0]?.cerrado ?? false);
    setMotivo(rows[0]?.motivo ?? "");
    setBloques(
      rows[0]?.cerrado
        ? [{ inicio: "09:00", fin: "17:00" }]
        : rows.map((row) => ({
            inicio: row.inicio?.slice(0, 5) ?? "09:00",
            fin: row.fin?.slice(0, 5) ?? "17:00",
          })),
    );
  }

  async function saveSchedule() {
    if (!recursoId || !fecha)
      return notify.error("Faltan datos", "Selecciona un recurso y una fecha.");
    try {
      await save.mutateAsync({
        tipo, recursoId, fecha, cerrado, motivo, bloques: cerrado ? [] : bloques,
      });
      notify.success("Horario guardado", "La disponibilidad especial ya está activa.");
    } catch (error) {
      notify.error("No se pudo guardar", error instanceof Error ? error.message : "Revisa los bloques capturados.");
    }
  }

  async function deleteSchedule(date: string) {
    if (!recursoId) return;
    try {
      await remove.mutateAsync({ tipo, recursoId, fecha: date });
      if (fecha === date) setFecha("");
      notify.success("Horario eliminado", "Se volverá a usar el horario semanal.");
    } catch (error) {
      notify.error("No se pudo eliminar", error instanceof Error ? error.message : "Inténtalo nuevamente.");
    }
  }

  return {
    tipo, setTipo, setSelectedId, fecha, setFecha, cerrado, setCerrado,
    motivo, setMotivo, bloques, setBloques, resources, recursoId,
    schedules, save, remove, grouped, editSchedule, saveSchedule, deleteSchedule,
  };
}
