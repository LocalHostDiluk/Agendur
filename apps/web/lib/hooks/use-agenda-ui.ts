"use client";

import { useState, useMemo } from "react";
import type { Cita, EstadoCita } from "@/lib/types";
import { getTodayString, parseYMD, formatYMD, addDaysYMD } from "@/lib/utils/agenda-date";

export function useAgendaUi(negocioTz?: string | null) {
  const todayStr = useMemo(() => getTodayString(negocioTz), [negocioTz]);

  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);
  const [viewMode, setViewMode] = useState<
    "cronograma" | "semanal" | "mensual"
  >("cronograma");
  const [filterSucursal, setFilterSucursal] = useState<string>("");
  const [filterProfesional, setFilterProfesional] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<EstadoCita | "">("");

  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Navegación temporal adaptativa
  const handlePrev = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, -1));
    } else if (viewMode === "semanal") {
      setSelectedDate((prev) => addDaysYMD(prev, -7));
    } else {
      const d = parseYMD(selectedDate);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(formatYMD(d));
    }
  };

  const handleNext = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, 1));
    } else if (viewMode === "semanal") {
      setSelectedDate((prev) => addDaysYMD(prev, 7));
    } else {
      const d = parseYMD(selectedDate);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(formatYMD(d));
    }
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  return { todayStr, selectedDate, setSelectedDate, viewMode, setViewMode, filterSucursal, setFilterSucursal, filterProfesional, setFilterProfesional, filterEstado, setFilterEstado, selectedCita, setSelectedCita, isManualModalOpen, setIsManualModalOpen, handlePrev, handleNext, handleToday };
}
