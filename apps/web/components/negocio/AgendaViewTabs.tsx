"use client";

import { Clock, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { AgendaViewTab } from "./AgendaViewTab";
import { PendingBadge } from "@/components/ui";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";

interface AgendaViewTabsProps {
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  setViewMode: ReturnType<typeof useAgendaUi>["setViewMode"];
}

export function AgendaViewTabs({ viewMode, setViewMode }: AgendaViewTabsProps) {
  return (
<div
              role="tablist"
              aria-label="Modo de visualización"
              className="inline-flex items-center p-1 bg-surface-alt rounded-xl border border-border text-xs font-medium"
            >
              <AgendaViewTab active={viewMode === "cronograma"} onClick={() => setViewMode("cronograma")}>
<Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Día (Cronograma)</span>
</AgendaViewTab>

              <AgendaViewTab active={viewMode === "semanal"} onClick={() => setViewMode("semanal")} title="Semanal">
<CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Semana</span>
</AgendaViewTab>

              <AgendaViewTab active={viewMode === "mensual"} onClick={() => setViewMode("mensual")} title="Mensual">
<CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Mes</span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Vista mensual con arrastrar y soltar en desarrollo"
                  className="ml-0.5"
                />
</AgendaViewTab>
            </div>
  );
}
