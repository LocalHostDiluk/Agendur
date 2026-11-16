"use client";

import React from "react";
import { X, Loader2, CalendarPlus, Sparkles } from "lucide-react";
import type { Sucursal, Servicio } from "@/lib/types";
import { useCitaManualForm } from "@/lib/hooks/use-cita-manual-form";
import { ModalCitaManualScheduleFields } from "./ModalCitaManualScheduleFields";
import { ModalCitaManualClientFields } from "./ModalCitaManualClientFields";

export interface ModalNuevaCitaManualProps {
  isOpen: boolean;
  onClose: () => void;
  initialFecha?: string;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onSuccess?: () => void;
}

export function ModalNuevaCitaManual({
  isOpen, onClose, initialFecha, sucursales, servicios, onSuccess,
}: ModalNuevaCitaManualProps) {
  const form = useCitaManualForm({
    isOpen, onClose, initialFecha, sucursales, servicios, onSuccess,
  });

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !form.isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-manual-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-mint/15 text-mint border border-mint/30">
                <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                Recepción directa
              </span>
            </div>
            <h2
              id="modal-manual-title"
              className="text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Agendar Cita Manual
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Registra una cita directa para clientes presenciales o vía telefónica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={form.isSubmitting}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="p-5 sm:p-6 space-y-4">
          <ModalCitaManualScheduleFields
            sucursales={sucursales}
            servicios={servicios}
            sucursalId={form.sucursalId}
            onChangeSucursal={form.setSelectedSucursalId}
            servicioId={form.servicioId}
            onChangeServicio={form.setSelectedServicioId}
            fecha={form.fecha}
            onChangeFecha={form.setSelectedFecha}
            hora={form.hora}
            onChangeHora={form.setHora}
            isSubmitting={form.isSubmitting}
          />

          <ModalCitaManualClientFields
            clienteNombre={form.clienteNombre}
            onChangeNombre={form.setClienteNombre}
            clienteApellido={form.clienteApellido}
            onChangeApellido={form.setClienteApellido}
            clientePhone={form.clientePhone}
            onChangePhone={form.setClientePhone}
            clienteEmail={form.clienteEmail}
            onChangeEmail={form.setClienteEmail}
            notasCliente={form.notasCliente}
            onChangeNotas={form.setNotasCliente}
            isSubmitting={form.isSubmitting}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={form.isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary bg-surface border border-border hover:bg-surface-alt hover:text-text-primary transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-grape hover:opacity-95 active:scale-[0.98] transition-all focus:outline-hidden focus:ring-2 focus:ring-grape-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {form.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Agendando cita...</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" strokeWidth={1.75} />
                  <span>Agendar Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
