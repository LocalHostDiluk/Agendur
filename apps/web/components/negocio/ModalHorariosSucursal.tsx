"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Clock } from "lucide-react";
import { useHorariosSucursal, useUpdateHorariosSucursal, type BranchScheduleItem } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";
import type { Sucursal } from "@/lib/types";

export interface ModalHorariosSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
}

const DIAS = [
  { dia: 1, label: "Lunes" },
  { dia: 2, label: "Martes" },
  { dia: 3, label: "Miércoles" },
  { dia: 4, label: "Jueves" },
  { dia: 5, label: "Viernes" },
  { dia: 6, label: "Sábado" },
  { dia: 0, label: "Domingo" },
];

interface DayState {
  activo: boolean;
  apertura: string;
  cierre: string;
}

export function ModalHorariosSucursal({ isOpen, onClose, sucursal }: ModalHorariosSucursalProps) {
  if (!isOpen || !sucursal) return null;
  return <ModalHorariosSucursalContent key={sucursal.id} onClose={onClose} sucursal={sucursal} />;
}

function ModalHorariosSucursalContent({ onClose, sucursal }: { onClose: () => void; sucursal: Sucursal }) {
  const { data, isLoading } = useHorariosSucursal(sucursal.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bricolage font-bold text-text-primary">Horario Semanal — {sucursal.nombre}</h2>
              <p className="text-xs text-text-secondary">Define días y horas de apertura habituales.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {isLoading ? (
          <div className="p-12 flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-grape" /></div>
        ) : (
          <HorariosSucursalForm sucursal={sucursal} initialHorarios={data?.horarios ?? []} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function HorariosSucursalForm({ sucursal, initialHorarios, onClose }: { sucursal: Sucursal; initialHorarios: BranchScheduleItem[]; onClose: () => void }) {
  const updateMutation = useUpdateHorariosSucursal();
  const [schedule, setSchedule] = useState<Record<number, DayState>>(() => {
    const initial: Record<number, DayState> = {};
    DIAS.forEach(({ dia }) => {
      const match = initialHorarios.find((h) => h.dia_semana === dia);
      initial[dia] = {
        activo: Boolean(match),
        apertura: match?.hora_apertura?.slice(0, 5) || "09:00",
        cierre: match?.hora_cierre?.slice(0, 5) || "18:00",
      };
    });
    return initial;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rows: BranchScheduleItem[] = [];
    for (const { dia } of DIAS) {
      const item = schedule[dia];
      if (item?.activo) {
        if (!item.apertura || !item.cierre || item.apertura >= item.cierre) {
          return notify.warning("Horario inválido", `La hora de apertura debe ser menor al cierre en ${DIAS.find((d) => d.dia === dia)?.label}.`);
        }
        rows.push({ dia_semana: dia, hora_apertura: item.apertura, hora_cierre: item.cierre });
      }
    }
    if (rows.length === 0) {
      return notify.warning("Horario requerido", "Debes activar al menos un día laboral para la sucursal.");
    }
    try {
      await updateMutation.mutateAsync({ sucursalId: sucursal.id, horarios: rows });
      notify.success("Horario guardado", "El horario semanal de la sucursal fue actualizado con éxito.");
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar el horario semanal.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto">
      <div className="space-y-2">
        {DIAS.map(({ dia, label }) => {
          const item = schedule[dia] || { activo: false, apertura: "09:00", cierre: "18:00" };
          return (
            <div key={dia} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface-alt/50 gap-2">
              <label className="flex items-center gap-2 cursor-pointer w-28 shrink-0">
                <input type="checkbox" checked={item.activo} onChange={(e) => setSchedule((prev) => ({ ...prev, [dia]: { ...item, activo: e.target.checked } }))} className="rounded text-grape focus:ring-grape" />
                <span className="text-xs font-semibold text-text-primary">{label}</span>
              </label>
              {item.activo ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={item.apertura} onChange={(e) => setSchedule((prev) => ({ ...prev, [dia]: { ...item, apertura: e.target.value } }))} className="px-2 py-1 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-1 focus:ring-grape" />
                  <span className="text-xs text-text-muted">a</span>
                  <input type="time" value={item.cierre} onChange={(e) => setSchedule((prev) => ({ ...prev, [dia]: { ...item, cierre: e.target.value } }))} className="px-2 py-1 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-1 focus:ring-grape" />
                </div>
              ) : (
                <span className="text-xs text-text-muted italic px-2">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt rounded-lg">Cancelar</button>
        <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-grape hover:bg-grape/90 rounded-lg shadow-xs disabled:opacity-50">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Horario"}
        </button>
      </div>
    </form>
  );
}
