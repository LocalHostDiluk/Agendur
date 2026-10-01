"use client";

import type { Cita, Servicio } from "@/lib/types";
import type { getWeekDays } from "@/lib/utils/agendas-data";
import { AgendasSemanaDia } from "./AgendasSemanaDia";

interface AgendasSemanalProps {
  citasCount: number;
  weekDays: ReturnType<typeof getWeekDays>;
  citasByDay: Record<string, Cita[]>;
  servicios: Servicio[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendasSemanal({ citasCount, weekDays, citasByDay, servicios, setSelectedCita }: AgendasSemanalProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
        <span>
          {citasCount}{" "}
          {citasCount === 1
            ? "cita en la semana"
            : "citas en la semana"}
        </span>
        <span className="font-mono text-text-muted">7 días</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => (<AgendasSemanaDia key={day.ymd} day={day} dayCitas={citasByDay[day.ymd] ?? []} servicios={servicios} setSelectedCita={setSelectedCita} />))}
      </div>
    </div>
  );
}
