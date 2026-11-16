"use client";

import React from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import type { Sucursal, Servicio } from "@/lib/types";
import type { ColaboradorCreadoPayload } from "@/lib/utils/modal-colaborador-constants";
import { useModalEscapeAndScrollLock } from "@/lib/hooks/use-modal-colaborador-escape";
import { useModalColaboradorCreate } from "@/lib/hooks/use-modal-colaborador-create";
import { ColaboradorModalBasicFields } from "./ColaboradorModalBasicFields";
import { ColaboradorModalHorarioField } from "./ColaboradorModalHorarioField";
import { ColaboradorModalServiciosField } from "./ColaboradorModalServiciosField";

export type { ColaboradorCreadoPayload };

export interface ModalNuevoColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onColaboradorCreado?: (colaborador: ColaboradorCreadoPayload) => void;
}

export function ModalNuevoColaborador({
  isOpen, onClose, sucursales, servicios, onColaboradorCreado,
}: ModalNuevoColaboradorProps) {
  useModalEscapeAndScrollLock(isOpen, onClose);
  const form = useModalColaboradorCreate({ sucursales, servicios, onClose, onColaboradorCreado });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="modal-nuevo-colaborador-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-nuevo-colaborador-title" className="font-bricolage font-bold text-lg text-text-primary leading-tight">
                Registrar Colaborador
              </h2>
              <p className="text-xs text-text-secondary">
                Agrega un nuevo especialista o miembro de equipo a tu negocio.
              </p>
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Cerrar modal"
            className="size-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <ColaboradorModalBasicFields
            idPrefix="colaborador" rolLabel="Rol en el Negocio"
            nombre={form.nombre} onChangeNombre={form.setNombre}
            apellido={form.apellido} onChangeApellido={form.setApellido}
            sucursalId={form.sucursalId} onChangeSucursalId={form.setSucursalId}
            sucursales={sucursales} rol={form.rol} onChangeRol={form.setRol}
            telefono={form.telefono} onChangeTelefono={form.setTelefono}
            email={form.email} onChangeEmail={form.setEmail}
          />

          <ColaboradorModalHorarioField
            diasLaborables={form.diasLaborables} onToggleDia={form.toggleDia}
            horaInicio={form.horaInicio} onChangeHoraInicio={form.setHoraInicio}
            horaFin={form.horaFin} onChangeHoraFin={form.setHoraFin}
          />

          <ColaboradorModalServiciosField
            label="Servicios que Puede Atender"
            emptyText="No hay servicios creados en el catálogo. Podrás asignarlos más adelante."
            servicios={servicios} selectedServicios={form.selectedServicios}
            onToggleServicio={form.toggleServicio} onSelectAll={form.selectAllServicios}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button" onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={form.isPending}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-grape hover:bg-grape/90 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {form.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Registrando...</span></>
              ) : (
                <><UserPlus className="w-4 h-4" /><span>Registrar Colaborador</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
