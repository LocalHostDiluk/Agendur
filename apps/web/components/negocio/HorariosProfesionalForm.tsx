"use client";

import React, { useState } from "react";
import { Loader2, Info, AlertTriangle } from "lucide-react";
import { useUpdateHorariosProfesional, type ProfessionalScheduleItem } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

export interface HorariosProfesionalFormProps {
  profesional: { id: string; nombre: string; apellido?: string };
  initialHorarios: ProfessionalScheduleItem[];
  sucursalHorarios: Array<{ dia_semana: number; hora_apertura: string; hora_cierre: string }>;
  sucursalNombre?: string;
  onClose: () => void;
}

const DIAS = [
  { dia: 1, label: "Lunes" }, { dia: 2, label: "Martes" }, { dia: 3, label: "Miércoles" },
  { dia: 4, label: "Jueves" }, { dia: 5, label: "Viernes" }, { dia: 6, label: "Sábado" }, { dia: 0, label: "Domingo" },
];

interface DayState {
  activo: boolean;
  inicio: string;
  fin: string;
}

export function HorariosProfesionalForm({
  profesional,
  initialHorarios,
  sucursalHorarios,
  sucursalNombre,
  onClose,
}: HorariosProfesionalFormProps) {
  const updateMutation = useUpdateHorariosProfesional();
  const hasPurgedDays = initialHorarios.some(
    (h) => sucursalHorarios.length > 0 && !sucursalHorarios.some((b) => b.dia_semana === h.dia_semana)
  );

  const [schedule, setSchedule] = useState<Record<number, DayState>>(() => {
    const initial: Record<number, DayState> = {};
    DIAS.forEach(({ dia }) => {
      const match = initialHorarios.find((h) => h.dia_semana === dia);
      const bMatch = sucursalHorarios.find((h) => h.dia_semana === dia);
      let ini = match?.hora_inicio?.slice(0, 5) || bMatch?.hora_apertura?.slice(0, 5) || "09:00";
      let fin = match?.hora_fin?.slice(0, 5) || bMatch?.hora_cierre?.slice(0, 5) || "18:00";
      if (bMatch) {
        if (ini < bMatch.hora_apertura.slice(0, 5)) ini = bMatch.hora_apertura.slice(0, 5);
        if (fin > bMatch.hora_cierre.slice(0, 5)) fin = bMatch.hora_cierre.slice(0, 5);
      }
      initial[dia] = { activo: Boolean(match) && (sucursalHorarios.length === 0 || Boolean(bMatch)), inicio: ini, fin };
    });
    return initial;
  });

  const handleToggleDay = (dia: number, checked: boolean, label: string) => {
    if (checked && sucursalHorarios.length > 0 && !sucursalHorarios.some((h) => h.dia_semana === dia)) {
      notify.warning("Día no laborable en la sucursal", `No hay horario ese día (${label}) en la sucursal.`);
      return;
    }
    const item = schedule[dia] || { activo: false, inicio: "09:00", fin: "18:00" };
    setSchedule((prev) => ({ ...prev, [dia]: { ...item, activo: checked } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rows: ProfessionalScheduleItem[] = [];
    for (const { dia, label } of DIAS) {
      const item = schedule[dia];
      const branchDay = sucursalHorarios.find((h) => h.dia_semana === dia);
      if (!item?.activo || (sucursalHorarios.length > 0 && !branchDay)) continue;
      if (!item.inicio || !item.fin || item.inicio >= item.fin) {
        return notify.warning("Horario inválido", `La hora de inicio debe ser menor al fin en ${label}.`);
      }
      if (branchDay && (item.inicio < branchDay.hora_apertura.slice(0, 5) || item.fin > branchDay.hora_cierre.slice(0, 5))) {
        return notify.warning("Horario fuera de rango", `El horario de ${label} debe estar dentro de la sucursal.`);
      }
      rows.push({ dia_semana: dia, hora_inicio: item.inicio, hora_fin: item.fin });
    }
    try {
      await updateMutation.mutateAsync({ profesionalId: profesional.id, horarios: rows });
      notify.success("Horario guardado", "El turno del colaborador fue actualizado con éxito.");
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar el horario del profesional.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
      <div className="p-3 bg-grape/5 border border-grape/20 rounded-xl text-xs space-y-1">
        <p className="font-semibold text-text-primary flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-grape shrink-0" />
          <span>Turnos personales del colaborador</span>
        </p>
        <p className="text-text-secondary leading-relaxed">
          Estás editando la jornada de <strong>{profesional.nombre} {profesional.apellido ?? ""}</strong>. No modifica el horario de la sucursal{sucursalNombre ? ` (${sucursalNombre})` : ""}.
        </p>
        {hasPurgedDays && (
          <p className="text-amber-500 font-medium flex items-center gap-1 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Días cerrados en la sucursal fueron desactivados automáticamente.</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        {DIAS.map(({ dia, label }) => {
          const item = schedule[dia] || { activo: false, inicio: "09:00", fin: "18:00" };
          const branchDay = sucursalHorarios.find((h) => h.dia_semana === dia);
          const isOpenInBranch = sucursalHorarios.length === 0 || Boolean(branchDay);
          return (
            <div key={dia} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface-alt/50 gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer w-44 shrink-0">
                <input
                  type="checkbox"
                  checked={item.activo && isOpenInBranch}
                  disabled={!isOpenInBranch}
                  onChange={(e) => handleToggleDay(dia, e.target.checked, label)}
                  className="rounded text-grape focus:ring-grape"
                />
                <div className="min-w-0">
                  <span className={`text-xs font-semibold block ${isOpenInBranch ? "text-text-primary" : "text-text-muted"}`}>{label}</span>
                  <span className="text-[10px] text-text-muted block truncate">
                    {isOpenInBranch && branchDay ? `Sucursal: ${branchDay.hora_apertura.slice(0, 5)} - ${branchDay.hora_cierre.slice(0, 5)}` : "Sucursal cerrada"}
                  </span>
                </div>
              </label>
              {item.activo && isOpenInBranch ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={item.inicio} onChange={(e) => setSchedule((prev) => ({ ...prev, [dia]: { ...item, inicio: e.target.value } }))} className="px-2 py-1 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-1 focus:ring-grape" />
                  <span className="text-xs text-text-muted">a</span>
                  <input type="time" value={item.fin} onChange={(e) => setSchedule((prev) => ({ ...prev, [dia]: { ...item, fin: e.target.value } }))} className="px-2 py-1 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-1 focus:ring-grape" />
                </div>
              ) : (
                <span className="text-xs text-text-muted italic px-2">{isOpenInBranch ? "Descanso" : "No disponible"}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt rounded-lg">Cancelar</button>
        <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-grape hover:bg-grape/90 rounded-lg shadow-xs disabled:opacity-50">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Horario"}
        </button>
      </div>
    </form>
  );
}
