"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { HorariosEspecialesPanel } from "@/components/negocio/HorariosEspecialesPanel";
import { ModalHorariosProfesional } from "@/components/negocio/ModalHorariosProfesional";
import { DIAS_SEMANA_HEADERS, type UnifiedColaborador } from "@/lib/utils/personal-colaboradores";
import type { Sucursal } from "@/lib/types";

interface PersonalHorariosProps {
  colaboradores: UnifiedColaborador[];
  sucursales: Sucursal[];
  todosLosColaboradores: UnifiedColaborador[];
  canWriteBranches: boolean;
}

export function PersonalHorarios({
  colaboradores,
  sucursales,
  todosLosColaboradores,
  canWriteBranches,
}: PersonalHorariosProps) {
  const [editingColab, setEditingColab] = useState<UnifiedColaborador | null>(null);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
      <div className="p-4 border-b border-border bg-surface-alt flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-bricolage font-bold text-base text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-grape" />
            <span>Turnos y Jornadas Semanales</span>
          </h2>
          <p className="text-xs text-text-secondary">Horarios de disponibilidad habitual de los colaboradores.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="size-2.5 rounded-full bg-mint" />
          <span>Jornada activa</span>
          <span className="size-2.5 rounded-full bg-border ml-2" />
          <span>Día de descanso</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary w-56 sticky left-0 bg-surface z-10">Colaborador</th>
              {DIAS_SEMANA_HEADERS.map((d) => (
                <th key={d.dia} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <span className="block font-bricolage font-bold text-text-primary">{d.corto}</span>
                  <span className="text-[10px] text-text-muted font-normal">{d.nombre}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {colaboradores.map((colab) => {
              const sucursal = sucursales.find((s) => s.id === colab.sucursal_id);
              return (
                <tr key={colab.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="p-3.5 sticky left-0 bg-surface z-10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-grape/15 text-grape font-bold font-bricolage text-xs flex items-center justify-center shrink-0">{colab.nombre[0]}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{colab.nombre} {colab.apellido ?? ""}</p>
                          <p className="text-[10px] text-text-muted truncate">{sucursal?.nombre || colab.rol || "Especialista"}</p>
                        </div>
                      </div>
                      {canWriteBranches && Boolean(colab.id) && (
                        <button type="button" onClick={() => setEditingColab(colab)} aria-label={`Editar horario de ${colab.nombre}`} title="Editar horario semanal" className="p-1 rounded-md text-text-muted hover:text-grape hover:bg-grape/10 transition-colors shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  {DIAS_SEMANA_HEADERS.map((d) => {
                    const horario = colab.horarios?.find((item) => item.dia_semana === d.dia);
                    return (
                      <td key={d.dia} className="p-2.5 text-center align-middle">
                        {horario ? (
                          <div className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg bg-mint/10 border border-mint/20 text-mint-dark min-w-[80px]">
                            <span className="font-mono tabular-nums text-xs font-bold">{horario.hora_inicio.slice(0, 5)}</span>
                            <span className="text-[9px] text-text-muted select-none">a</span>
                            <span className="font-mono tabular-nums text-xs font-bold">{horario.hora_fin.slice(0, 5)}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-surface-alt border border-border text-text-muted text-[11px] min-w-[80px]">Descanso</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <HorariosEspecialesPanel sucursales={sucursales} profesionales={todosLosColaboradores} canWrite={canWriteBranches} />
      <ModalHorariosProfesional
        isOpen={Boolean(editingColab)}
        onClose={() => setEditingColab(null)}
        profesional={editingColab}
        sucursalNombre={sucursales.find((s) => s.id === editingColab?.sucursal_id)?.nombre}
      />
    </div>
  );
}
