"use client";

import React from "react";
import { X, UserCheck, Loader2 } from "lucide-react";
import type { Sucursal, Servicio } from "@/lib/types";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import { useModalEscapeAndScrollLock } from "@/lib/hooks/use-modal-colaborador-escape";
import { useModalColaboradorEdit } from "@/lib/hooks/use-modal-colaborador-edit";
import { ColaboradorModalBasicFields } from "./ColaboradorModalBasicFields";
import {
  ColaboradorModalAvatarField,
  ColaboradorModalEstadoField,
} from "./ColaboradorModalEditExtras";
import { ColaboradorModalServiciosField } from "./ColaboradorModalServiciosField";

export interface ModalEditarColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: UnifiedColaborador;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onColaboradorActualizado?: (colaborador: UnifiedColaborador) => void;
}

export function ModalEditarColaborador({
  isOpen, onClose, colaborador, sucursales, servicios, onColaboradorActualizado,
}: ModalEditarColaboradorProps) {
  useModalEscapeAndScrollLock(isOpen, onClose);
  const form = useModalColaboradorEdit({ colaborador, sucursales, servicios, onClose, onColaboradorActualizado });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="modal-editar-colaborador-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-editar-colaborador-title" className="font-bricolage font-bold text-lg text-text-primary leading-tight">
                Editar Colaborador
              </h2>
              <p className="text-xs text-text-secondary">
                Modifica el perfil, sede, servicios asignados y estado del especialista.
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
            idPrefix="edit-colaborador" rolLabel="Cargo o Rol"
            nombre={form.nombre} onChangeNombre={form.setNombre}
            apellido={form.apellido} onChangeApellido={form.setApellido}
            sucursalId={form.sucursalId} onChangeSucursalId={form.setSucursalId}
            sucursales={sucursales} rol={form.rol} onChangeRol={form.setRol}
            telefono={form.telefono} onChangeTelefono={form.setTelefono}
            email={form.email} onChangeEmail={form.setEmail}
            afterNameSlot={
              <ColaboradorModalAvatarField
                avatarUrl={form.avatarUrl} nombre={form.nombre}
                sucursalId={form.sucursalId} colaboradorId={colaborador.id}
                onUploaded={form.setAvatarUrl}
              />
            }
          />

          <ColaboradorModalEstadoField activo={form.activo} onChangeActivo={form.setActivo} />

          <ColaboradorModalServiciosField
            label="Servicios Asignados" emptyText="No hay servicios creados en el catálogo."
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
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando...</span></>
              ) : (
                <><UserCheck className="w-4 h-4" /><span>Guardar Cambios</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
