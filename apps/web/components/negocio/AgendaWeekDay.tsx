import { AgendaWeekCita } from "./AgendaWeekCita";
import type { Cita, Servicio } from "@/lib/types";
import type { useAgendaDerived } from "@/lib/hooks/use-agenda-derived";

interface AgendaWeekDayProps {
  day: ReturnType<typeof useAgendaDerived>["weekDays"][number];
  citasByDay: Record<string, Cita[]>;
  servicios: Servicio[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendaWeekDay({ day, citasByDay, servicios, setSelectedCita }: AgendaWeekDayProps) {
                const dayCitas = citasByDay[day.ymd] ?? [];

  return (
<div
                    className={`rounded-[var(--radius-lg)] border flex flex-col min-h-[320px] transition-all duration-100 ease-out ${
                      day.isToday
                        ? "bg-surface border-grape/40 shadow-xs ring-1 ring-grape/20"
                        : "bg-surface border-border"
                    }`}
                  >
                    {/* Encabezado del Día */}
                    <div
                      className={`p-3 border-b text-center rounded-t-[var(--radius-lg)] ${
                        day.isToday
                          ? "bg-grape-soft/40 border-grape/30"
                          : "bg-surface-alt/70 border-border"
                      }`}
                    >
                      <span className="text-[11px] font-mono font-semibold text-text-secondary block">
                        {day.dayName}
                      </span>
                      <span
                        className={`text-lg font-bricolage font-bold ${
                          day.isToday ? "text-grape" : "text-text-primary"
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                        {dayCitas.length}{" "}
                        {dayCitas.length === 1 ? "cita" : "citas"}
                      </span>
                    </div>

                    {/* Lista de citas de ese día */}
                    <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                      {dayCitas.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4 text-center">
                          <span className="text-[11px] text-text-muted font-mono">
                            Sin citas
                          </span>
                        </div>
                      ) : (
                        dayCitas.map((c) => (
                          <AgendaWeekCita key={c.id} c={c} servicios={servicios} setSelectedCita={setSelectedCita} />
                        ))
                      )}
                    </div>
                  </div>
  );
}
