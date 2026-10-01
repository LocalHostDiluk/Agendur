"use client";

import { Clock, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { PendingBadge } from "@/components/ui";
import { AgendasViewTab } from "./AgendasViewTab";

interface AgendasViewSwitcherProps {
  viewMode: "cronograma" | "semanal" | "mensual";
  setViewMode: (mode: "cronograma" | "semanal" | "mensual") => void;
}

export function AgendasViewSwitcher({ viewMode, setViewMode }: AgendasViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Modo de visualización"
      className="inline-flex items-center p-1 bg-surface-alt rounded-xl border border-border text-xs font-medium"
    >
      <AgendasViewTab selected={viewMode === "cronograma"} onClick={() => setViewMode("cronograma")}>
        <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Día (Cronograma)</span>
      </AgendasViewTab>

      <AgendasViewTab selected={viewMode === "semanal"} onClick={() => setViewMode("semanal")} title="Semanal">
        <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Semana</span>
      </AgendasViewTab>

      <AgendasViewTab selected={viewMode === "mensual"} onClick={() => setViewMode("mensual")} title="Mensual">
        <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Mes</span>
        <PendingBadge
          label="Próximamente"
          tooltip="Vista mensual con arrastrar y soltar en desarrollo"
          className="ml-0.5"
        />
      </AgendasViewTab>
    </div>
  );
}
