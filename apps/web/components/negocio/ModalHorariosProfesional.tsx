"use client";

import React, { useEffect } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { useHorariosProfesional, useHorariosSucursal } from "@/lib/hooks";
import { HorariosProfesionalForm } from "./HorariosProfesionalForm";

export interface ModalHorariosProfesionalProps {
  isOpen: boolean;
  onClose: () => void;
  profesional: { id: string; nombre: string; apellido?: string; sucursal_id?: string } | null;
  sucursalNombre?: string;
}

export function ModalHorariosProfesional({
  isOpen,
  onClose,
  profesional,
  sucursalNombre,
}: ModalHorariosProfesionalProps) {
  if (!isOpen || !profesional) return null;
  return (
    <ModalHorariosProfesionalContent
      key={profesional.id}
      onClose={onClose}
      profesional={profesional}
      sucursalNombre={sucursalNombre}
    />
  );
}

function ModalHorariosProfesionalContent({
  onClose,
  profesional,
  sucursalNombre,
}: {
  onClose: () => void;
  profesional: { id: string; nombre: string; apellido?: string; sucursal_id?: string };
  sucursalNombre?: string;
}) {
  const { data, isLoading } = useHorariosProfesional(profesional.id);
  const { data: sucursalHorariosData } = useHorariosSucursal(profesional.sucursal_id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fullName = `${profesional.nombre} ${profesional.apellido ?? ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bricolage font-bold text-text-primary">
                Turnos de {fullName}
              </h2>
              <p className="text-xs text-text-secondary">
                Jornada laboral individual para la atención de citas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-grape" />
          </div>
        ) : (
          <HorariosProfesionalForm
            profesional={profesional}
            initialHorarios={data?.horarios ?? []}
            sucursalHorarios={sucursalHorariosData?.horarios ?? []}
            sucursalNombre={sucursalNombre}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
