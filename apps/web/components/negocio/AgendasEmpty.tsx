"use client";

import { Ticket } from "lucide-react";
import { AgendasManualButton } from "./AgendasManualButton";

interface AgendasEmptyProps {
  setIsManualModalOpen: (open: boolean) => void;
}

export function AgendasEmpty({ setIsManualModalOpen }: AgendasEmptyProps) {
  return (
    <div className="p-10 sm:p-12 rounded-[var(--radius-lg)] bg-surface border border-dashed border-border text-center space-y-5 shadow-xs relative overflow-hidden">
      {/* Ilustración ligera de ticket risográfico (§5.6.2) */}
      <div className="relative mx-auto w-24 h-24 bg-surface-alt/70 rounded-2xl border-2 border-dashed border-grape/30 p-2.5 flex flex-col justify-between items-center shadow-xs">
        {/* Muescas semicirculares de ticket de turno */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-r border-dashed border-grape/30" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-l border-dashed border-grape/30" />

        <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center mt-1">
          <Ticket className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="w-full border-t border-dashed border-border my-1" />
        <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">
          AG-TICKET
        </span>
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-lg font-bricolage font-bold text-text-primary tracking-tight">
          No hay citas programadas para este período
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Las citas reservadas por clientes o agendadas desde recepción
          aparecerán aquí organizadas por horario.
        </p>
      </div>

      <div className="pt-1">
        <AgendasManualButton onClick={() => setIsManualModalOpen(true)} className="gap-2 min-h-[44px]" />
      </div>
    </div>
  );
}
