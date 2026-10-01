"use client";

import type { Cita } from "@/lib/types";
import type { getMonthDaysGrid } from "@/lib/utils/agendas-month-grid";
import { AgendasMesCita } from "./AgendasMesCita";

interface AgendasMesDiaProps {
  cell: ReturnType<typeof getMonthDaysGrid>[number];
  dayCitas: Cita[];
  todayStr: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: "cronograma" | "semanal" | "mensual") => void;
}

export function AgendasMesDia({ cell, dayCitas, todayStr, selectedDate, setSelectedDate, setViewMode }: AgendasMesDiaProps) {
  const isToday = cell.ymd === todayStr;
  const isSelected = cell.ymd === selectedDate;
  return (
    <div
      key={cell.ymd}
      onClick={() => {
        setSelectedDate(cell.ymd);
        setViewMode("cronograma");
      }}
      className={`p-2 min-h-[95px] sm:min-h-[110px] flex flex-col justify-between cursor-pointer transition-colors duration-100 ease-out hover:bg-surface-alt/60 group ${
        !cell.isCurrentMonth
          ? "bg-surface-alt/20 opacity-40"
          : isSelected
            ? "bg-grape-soft/20"
            : "bg-surface"
      }`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`inline-flex items-center justify-center text-xs font-mono font-bold rounded-[var(--radius-sm)] px-1.5 py-0.5 ${
            isToday
              ? "bg-grape text-white"
              : isSelected
                ? "text-grape font-bold"
                : "text-text-primary"
          }`}
        >
          {cell.dayNumber}
        </span>

        {dayCitas.length > 0 && (
          <span className="text-[10px] font-mono font-semibold text-text-secondary bg-surface-alt px-1.5 py-0.2 rounded-md border border-border">
            {dayCitas.length}
          </span>
        )}
      </div>

      {/* Dots de citas / disponibilidad */}
      <div className="mt-2 space-y-1">
        {dayCitas.slice(0, 2).map((c) => (<AgendasMesCita key={c.id} c={c} />))}
        {dayCitas.length > 2 && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-text-muted px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
            <span>+{dayCitas.length - 2} más</span>
          </div>
        )}
      </div>
    </div>
  );
}
