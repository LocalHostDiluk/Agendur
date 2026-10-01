"use client";

import type { Cita } from "@/lib/types";
import { PendingBadge } from "@/components/ui";
import type { getMonthDaysGrid } from "@/lib/utils/agendas-month-grid";
import { formatDisplayMonth } from "@/lib/utils/agendas-date-labels";
import { AgendasMesDia } from "./AgendasMesDia";

interface AgendasMensualProps {
  citasCount: number;
  monthDays: ReturnType<typeof getMonthDaysGrid>;
  citasByDay: Record<string, Cita[]>;
  todayStr: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: "cronograma" | "semanal" | "mensual") => void;
}

export function AgendasMensual({ citasCount, monthDays, citasByDay, todayStr, selectedDate, setSelectedDate, setViewMode }: AgendasMensualProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span>
            {citasCount}{" "}
            {citasCount === 1 ? "cita en el mes" : "citas en el mes"}
          </span>
          <PendingBadge
            label="Próximamente"
            tooltip="Vista mensual con arrastrar y soltar en desarrollo"
          />
        </div>
        <span className="font-mono text-text-muted">
          {formatDisplayMonth(selectedDate)}
        </span>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-xs">
        {/* Encabezado de Días de la Semana */}
        <div className="grid grid-cols-7 border-b border-border bg-surface-alt/70 text-center">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(
            (dName) => (
              <div
                key={dName}
                className="py-2.5 text-[11px] font-mono font-semibold text-text-secondary"
              >
                {dName}
              </div>
            ),
          )}
        </div>

        {/* Grilla de Días del Mes */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {monthDays.map((cell) => (<AgendasMesDia key={cell.ymd} cell={cell} dayCitas={citasByDay[cell.ymd] ?? []} todayStr={todayStr} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setViewMode={setViewMode} />))}
        </div>
      </div>
    </div>
  );
}
