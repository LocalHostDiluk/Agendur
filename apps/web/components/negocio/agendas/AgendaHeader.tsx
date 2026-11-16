"use client";

import { AgendaManualButton } from "./AgendaManualButton";

interface AgendaHeaderProps {
  onCreateCita: () => void;
}

export function AgendaHeader({ onCreateCita }: AgendaHeaderProps) {
  return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Calendario & Agendas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza y administra las citas programadas por sucursal, fecha y
            horario.
          </p>
        </div>

        <AgendaManualButton onClick={onCreateCita} className="gap-2 shrink-0 min-h-[44px]" />
      </div>
  );
}
