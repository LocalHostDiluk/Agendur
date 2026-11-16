"use client";

import React from "react";
import { Clock, Calendar, MapPin, User, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CitaDetailTicketSectionProps {
  nombreServicio: string;
  duracion: number;
  precioFormatted: string;
  montoAnticipoPagado?: number | null;
  fechaFormateada: string;
  rangoHora: string;
  nombreProfesional: string;
  nombreSucursal: string;
  notas: string;
  onChangeNotas: (value: string) => void;
  onGuardarNotas: () => void;
  isSavingNotas: boolean;
  isMutating: boolean;
}

export function CitaDetailTicketSection({
  nombreServicio, duracion, precioFormatted, montoAnticipoPagado,
  fechaFormateada, rangoHora, nombreProfesional, nombreSucursal,
  notas, onChangeNotas, onGuardarNotas, isSavingNotas, isMutating,
}: CitaDetailTicketSectionProps) {
  return (
    <>
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Servicio y Ticket
        </h3>
        <div className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-grape shrink-0" strokeWidth={1.75} />
                <span>{nombreServicio}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                <span className="font-mono">{duracion} min</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-sm sm:text-base font-bold text-text-primary block">
                {precioFormatted}
              </span>
              {montoAnticipoPagado ? (
                <span className="font-mono text-[11px] text-success font-medium block">
                  Anticipo: $
                  {Number(montoAnticipoPagado).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
              <span>{fechaFormateada}</span>
            </div>
            {rangoHora && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                <span className="font-mono font-medium text-text-primary">
                  {rangoHora}
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <User className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
              <span className="truncate">{nombreProfesional}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
              <span className="truncate">{nombreSucursal}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
            <span>Notas Internas</span>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={notas}
            onChange={(e) => onChangeNotas(e.target.value)}
            rows={3}
            placeholder="Escribe notas internas sobre el cliente o la cita..."
            className="w-full text-xs sm:text-sm bg-surface border border-border rounded-xl p-3 text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-1 focus:ring-grape transition-all resize-none shadow-2xs"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onGuardarNotas}
              isLoading={isSavingNotas}
              disabled={isSavingNotas || isMutating}
            >
              Guardar notas
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
