"use client";

import React from "react";
import { X, CheckCircle2, Check, XCircle } from "lucide-react";
import type { Cita, Servicio, Sucursal, Profesional } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { resolveCitaDetailView } from "@/lib/utils/cita-drawer-helpers";
import { useCitaDrawerState } from "@/lib/hooks/use-cita-drawer-state";
import { CitaDetailClienteSection } from "./CitaDetailClienteSection";
import { CitaDetailTicketSection } from "./CitaDetailTicketSection";

export interface CitaDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  sucursales?: Sucursal[];
  servicios?: Servicio[];
  profesionales?: Profesional[];
  onCitaUpdated?: () => void;
}

export function CitaDetailDrawer({
  isOpen, onClose, cita, sucursales = [], servicios = [], profesionales = [], onCitaUpdated,
}: CitaDetailDrawerProps) {
  const {
    activeCita, currentCita, notas, setNotas, isSavingNotas, pendingEstado,
    isMutating, confirmDialogProps, handleGuardarNotas, handleUpdateEstado,
  } = useCitaDrawerState({ isOpen, onClose, cita, onCitaUpdated });

  if (!isOpen && !activeCita) return null;
  if (!currentCita) return null;

  const view = resolveCitaDetailView(currentCita, servicios, sucursales, profesionales);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-cita-title"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full h-full bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-250 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 sm:p-6 border-b border-border bg-surface shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-text-muted tracking-wider uppercase">
              {view.folio}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2
              id="drawer-cita-title"
              className="text-xl sm:text-2xl font-bricolage font-bold text-text-primary tracking-tight"
            >
              Detalle de Cita
            </h2>
            <Badge variant={view.badgeConfig.variant} size="md" dot>
              {view.badgeConfig.label}
            </Badge>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          <CitaDetailClienteSection {...view} />
          <CitaDetailTicketSection
            {...view}
            montoAnticipoPagado={currentCita.monto_anticipo_pagado}
            notas={notas}
            onChangeNotas={setNotas}
            onGuardarNotas={handleGuardarNotas}
            isSavingNotas={isSavingNotas}
            isMutating={isMutating}
          />
        </div>

        <div className="p-5 border-t border-border bg-surface shrink-0 space-y-2">
          {currentCita.estado !== "confirmada" ? (
            <Button
              type="button" variant="primary" size="md" className="w-full min-h-[44px]"
              onClick={() => handleUpdateEstado("confirmada", view.folio)}
              isLoading={pendingEstado === "confirmada"} disabled={isMutating}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" strokeWidth={2} />
              <span>Confirmar cita</span>
            </Button>
          ) : (
            <Button
              type="button" variant="primary" size="md" className="w-full min-h-[44px]"
              onClick={() => handleUpdateEstado("completada", view.folio)}
              isLoading={pendingEstado === "completada"} disabled={isMutating}
            >
              <Check className="w-4 h-4 mr-1.5" strokeWidth={2} />
              <span>Marcar completada</span>
            </Button>
          )}

          {currentCita.estado !== "cancelada" && (
            <Button
              type="button" variant="destructive" size="md" className="w-full min-h-[44px]"
              onClick={() => handleUpdateEstado("cancelada", view.folio)}
              isLoading={pendingEstado === "cancelada"} disabled={isMutating}
            >
              <XCircle className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              <span>Cancelar cita</span>
            </Button>
          )}
        </div>
      </aside>

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
