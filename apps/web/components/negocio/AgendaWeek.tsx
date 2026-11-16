import { AgendaWeekDay } from "./AgendaWeekDay";
import type { Cita, Servicio } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";
import type { useAgendaDerived } from "@/lib/hooks/use-agenda-derived";

interface AgendaWeekProps {
  loadingCitas: boolean;
  errorCitas: boolean;
  citas: Cita[];
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  weekDays: ReturnType<typeof useAgendaDerived>["weekDays"];
  citasByDay: Record<string, Cita[]>;
  servicios: Servicio[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendaWeek({ loadingCitas, errorCitas, citas, viewMode, weekDays, citasByDay, servicios, setSelectedCita }: AgendaWeekProps) {
  return (
    <>
{!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "semanal" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <span>
                {citas.length}{" "}
                {citas.length === 1
                  ? "cita en la semana"
                  : "citas en la semana"}
              </span>
              <span className="font-mono text-text-muted">7 días</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <AgendaWeekDay key={day.ymd} day={day} citasByDay={citasByDay} servicios={servicios} setSelectedCita={setSelectedCita} />
              ))}
            </div>
          </div>
        )}
    </>
  );
}
