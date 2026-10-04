import { PendingBadge } from "@/components/ui";
import { AgendaMonthCell } from "./AgendaMonthCell";
import { formatDisplayMonth } from "@/lib/utils/agenda-display-date";
import type { Cita } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";
import type { useAgendaDerived } from "@/lib/hooks/use-agenda-derived";

interface AgendaMonthProps {
  loadingCitas: boolean;
  errorCitas: boolean;
  citas: Cita[];
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  monthDays: ReturnType<typeof useAgendaDerived>["monthDays"];
  citasByDay: Record<string, Cita[]>;
  todayStr: string;
  selectedDate: string;
  setSelectedDate: ReturnType<typeof useAgendaUi>["setSelectedDate"];
  setViewMode: ReturnType<typeof useAgendaUi>["setViewMode"];
}

export function AgendaMonth({ loadingCitas, errorCitas, citas, viewMode, monthDays, citasByDay, todayStr, selectedDate, setSelectedDate, setViewMode }: AgendaMonthProps) {
  return (
    <>
{!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "mensual" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span>
                  {citas.length}{" "}
                  {citas.length === 1 ? "cita en el mes" : "citas en el mes"}
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
                {monthDays.map((cell) => (
                  <AgendaMonthCell key={cell.ymd} cell={cell} citasByDay={citasByDay} todayStr={todayStr} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setViewMode={setViewMode} />
                ))}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
