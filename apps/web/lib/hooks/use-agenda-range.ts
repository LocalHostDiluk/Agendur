"use client";

import { useMemo } from "react";
import type { EstadoCita } from "@/lib/types";
import { getMondayOfDate, getSundayOfDate } from "@/lib/utils/agenda-date";
import type { useAgendaUi } from "./use-agenda-ui";

type AgendaRangeInput = Pick<ReturnType<typeof useAgendaUi>, "selectedDate" | "viewMode" | "filterSucursal" | "filterEstado">;

export function useAgendaRange({ selectedDate, viewMode, filterSucursal, filterEstado }: AgendaRangeInput) {
  // Rango de fechas según la vista activa
  const mondayYMD = useMemo(
    () => getMondayOfDate(selectedDate),
    [selectedDate],
  );
  const sundayYMD = useMemo(
    () => getSundayOfDate(selectedDate),
    [selectedDate],
  );

  const [selYear, selMonth] = useMemo(
    () => selectedDate.split("-").map(Number),
    [selectedDate],
  );

  const startOfMonthYMD = useMemo(() => {
    const m = String(selMonth).padStart(2, "0");
    return `${selYear}-${m}-01`;
  }, [selYear, selMonth]);

  const endOfMonthYMD = useMemo(() => {
    const lastDay = new Date(selYear, selMonth, 0).getDate();
    const m = String(selMonth).padStart(2, "0");
    const d = String(lastDay).padStart(2, "0");
    return `${selYear}-${m}-${d}`;
  }, [selYear, selMonth]);

  const filtrosQuery = useMemo(() => {
    const res: {
      sucursalId?: string;
      fechaInicio?: string;
      fechaFin?: string;
      estado?: EstadoCita;
    } = {};

    if (filterSucursal) res.sucursalId = filterSucursal;
    if (filterEstado) res.estado = filterEstado;

    if (viewMode === "cronograma") {
      res.fechaInicio = selectedDate;
      res.fechaFin = selectedDate;
    } else if (viewMode === "semanal") {
      res.fechaInicio = mondayYMD;
      res.fechaFin = sundayYMD;
    } else {
      res.fechaInicio = startOfMonthYMD;
      res.fechaFin = endOfMonthYMD;
    }

    return res;
  }, [
    filterSucursal,
    filterEstado,
    viewMode,
    selectedDate,
    mondayYMD,
    sundayYMD,
    startOfMonthYMD,
    endOfMonthYMD,
  ]);

  return { mondayYMD, sundayYMD, filtrosQuery };
}
