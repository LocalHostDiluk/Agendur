"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { useModalEscapeAndScrollLock } from "@/lib/hooks/use-modal-colaborador-escape";
import { useModalServicioForm } from "@/lib/hooks/use-modal-servicio-form";
import { ServicioModalFields } from "./ServicioModalFields";

export interface ModalNuevoServicioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalNuevoServicio({
  isOpen,
  onClose,
  onSuccess,
}: ModalNuevoServicioProps) {
  useModalEscapeAndScrollLock(isOpen, onClose);
  const form = useModalServicioForm({ onClose, onSuccess });

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
        aria-labelledby="modal-nuevo-servicio-title"
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <h2
              id="modal-nuevo-servicio-title"
              className="text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Nuevo Servicio
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Configura el servicio que tus clientes podrán reservar.
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
          <ServicioModalFields
            nombre={form.nombre}
            onChangeNombre={form.setNombre}
            descripcion={form.descripcion}
            onChangeDescripcion={form.setDescripcion}
            duracionMinutos={form.duracionMinutos}
            onChangeDuracionMinutos={form.setDuracionMinutos}
            bufferMinutos={form.bufferMinutos}
            onChangeBufferMinutos={form.setBufferMinutos}
            precio={form.precio}
            onChangePrecio={form.setPrecio}
            isSubmitting={form.isSubmitting}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={form.isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary bg-surface border border-border hover:bg-surface-alt transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-grape hover:opacity-95 active:scale-[0.98] transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {form.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Servicio</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
