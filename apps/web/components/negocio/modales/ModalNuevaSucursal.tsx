"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { useModalEscapeAndScrollLock } from "@/lib/hooks/use-modal-colaborador-escape";
import { useModalSucursalForm } from "@/lib/hooks/use-modal-sucursal-form";
import { SucursalModalFields } from "./SucursalModalFields";

export interface ModalNuevaSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalNuevaSucursal({
  isOpen,
  onClose,
  onSuccess,
}: ModalNuevaSucursalProps) {
  useModalEscapeAndScrollLock(isOpen, onClose);
  const form = useModalSucursalForm({ onClose, onSuccess });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !form.isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-nueva-sucursal-title"
        className="modal-panel-animate surface-overlay-depth relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <h2
              id="modal-nueva-sucursal-title"
              className="heading-balance text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Nueva Sucursal
            </h2>
            <p className="prose-pretty text-xs sm:text-sm text-text-secondary mt-1">
              Registra una nueva sede para asignar personal y habilitar horarios.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={form.isSubmitting}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto scroll-shadows-y max-h-[calc(100dvh-11rem)]">
          <SucursalModalFields
            nombre={form.nombre}
            onChangeNombre={form.setNombre}
            direccion={form.direccion}
            onChangeDireccion={form.setDireccion}
            ciudad={form.ciudad}
            onChangeCiudad={form.setCiudad}
            estadoProvincia={form.estadoProvincia}
            onChangeEstadoProvincia={form.setEstadoProvincia}
            codigoPostal={form.codigoPostal}
            onChangeCodigoPostal={form.setCodigoPostal}
            telefono={form.telefono}
            onChangeTelefono={form.setTelefono}
            zonaHoraria={form.zonaHoraria}
            onChangeZonaHoraria={form.setZonaHoraria}
            isSubmitting={form.isSubmitting}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={form.isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary bg-surface border border-border hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-grape hover:opacity-95 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {form.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Crear Sucursal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
