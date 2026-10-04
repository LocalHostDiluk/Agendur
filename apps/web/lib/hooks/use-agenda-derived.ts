"use client";

import { useMemo } from "react";
import type { Cita } from "@/lib/types";
import { parseYMD, addDaysYMD } from "@/lib/utils/agenda-date";
import { getMonthDaysGrid } from "@/lib/utils/agenda-month-grid";

interface AgendaDerivedInput {
  citasData: { citas: Cita[] } | undefined;
  filterProfesional: string;
  mondayYMD: string;
  todayStr: string;
  selectedDate: string;
}

export function useAgendaDerived({ citasData, filterProfesional, mondayYMD, todayStr, selectedDate }: AgendaDerivedInput) {
  // Ordenar citas cronológicamente por hora_inicio y filtrar por profesional si aplica
  const citas = useMemo(() => {
    const list = citasData?.citas ?? [];
    let filtered = list;
    if (filterProfesional) {
      filtered = filtered.filter((c) => c.profesional_id === filterProfesional);
    }
    return [...filtered].sort((a, b) => {
      const hA = a.hora_inicio ?? a.hora ?? "00:00";
      const hB = b.hora_inicio ?? b.hora ?? "00:00";
      return hA.localeCompare(hB);
    });
  }, [citasData?.citas, filterProfesional]);

  // 7 días de la semana para la vista semanal
  const weekDays = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const dayYMD = addDaysYMD(mondayYMD, i);
      const d = parseYMD(dayYMD);
      return {
        ymd: dayYMD,
        dayName: ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"][i],
        dayNumber: d.getDate(),
        isToday: dayYMD === todayStr,
        isSelected: dayYMD === selectedDate,
      };
    });
  }, [mondayYMD, todayStr, selectedDate]);

  // Días para la cuadrícula mensual
  const monthDays = useMemo(
    () => getMonthDaysGrid(selectedDate, todayStr),
    [selectedDate, todayStr],
  );

  // Resumen de citas agrupadas por fecha
  const citasByDay = useMemo(() => {
    const map: Record<string, Cita[]> = {};
    for (const c of citas) {
      if (!map[c.fecha]) map[c.fecha] = [];
      map[c.fecha].push(c);
    }
    return map;
  }, [citas]);

  return { citas, weekDays, monthDays, citasByDay };
}
