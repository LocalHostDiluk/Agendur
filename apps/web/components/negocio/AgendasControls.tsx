"use client";

import type { Dispatch, SetStateAction, ComponentProps } from "react";
import { AgendasDateNavigation } from "./AgendasDateNavigation";
import { AgendasViewSwitcher } from "./AgendasViewSwitcher";
import { AgendasFilters } from "./AgendasFilters";

interface AgendasControlsProps extends ComponentProps<typeof AgendasFilters> {
  selectedDate: string;
  todayStr: string;
  viewMode: "cronograma" | "semanal" | "mensual";
  mondayYMD: string;
  sundayYMD: string;
  setSelectedDate: Dispatch<SetStateAction<string>>;
  setViewMode: (mode: "cronograma" | "semanal" | "mensual") => void;
}

export function AgendasControls({ selectedDate, todayStr, viewMode, mondayYMD, sundayYMD, setSelectedDate, setViewMode, sucursales, profesionales, filterSucursal, filterProfesional, filterEstado, setFilterSucursal, setFilterProfesional, setFilterEstado }: AgendasControlsProps) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navegador de Fecha */}
        <AgendasDateNavigation selectedDate={selectedDate} todayStr={todayStr} viewMode={viewMode} mondayYMD={mondayYMD} sundayYMD={sundayYMD} setSelectedDate={setSelectedDate} />

        {/* Alternador Canónico de 3 Vistas (§10) y Filtros */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          {/* Switcher 3 Pestañas: Día (Cronograma) / Semana / Mes */}
          <AgendasViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />

          <AgendasFilters sucursales={sucursales} profesionales={profesionales} filterSucursal={filterSucursal} filterProfesional={filterProfesional} filterEstado={filterEstado} setFilterSucursal={setFilterSucursal} setFilterProfesional={setFilterProfesional} setFilterEstado={setFilterEstado} />
        </div>
      </div>
    </div>
  );
}
