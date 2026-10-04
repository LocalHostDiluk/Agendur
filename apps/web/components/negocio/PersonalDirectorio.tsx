"use client";

import { PersonalColaboradorCard } from "./PersonalColaboradorCard";
import { PersonalColaboradorRow } from "./PersonalColaboradorRow";
import type { UnifiedColaborador } from "@/lib/utils/personal-colaboradores";
import type { Sucursal, Servicio, Cita } from "@/lib/types";

interface PersonalDirectorioProps {
  colaboradores: UnifiedColaborador[];
  sucursales: Sucursal[];
  servicios: Servicio[];
  citas: Cita[];
  canWriteStaff: boolean;
  onViewHorarios: (colab: UnifiedColaborador) => void;
  onEdit: (colab: UnifiedColaborador) => void;
  onToggleActivo: (colab: UnifiedColaborador) => void;
  onDelete: (colab: UnifiedColaborador) => void;
}

export function PersonalDirectorio({
  colaboradores,
  sucursales,
  servicios,
  citas,
  canWriteStaff,
  onViewHorarios,
  onEdit,
  onToggleActivo,
  onDelete,
}: PersonalDirectorioProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* MOBILE VIEW (<640px): Tarjetas limpias apiladas (§8) */}
      <div className="sm:hidden space-y-3.5" data-testid="colaboradores-mobile-list">
        {colaboradores.map((colab) => (
          <PersonalColaboradorCard
            key={`mob-${colab.id}`}
            colab={colab}
            sucursal={sucursales.find((s) => s.id === colab.sucursal_id)}
            servicios={servicios}
            citas={citas}
            canWriteStaff={canWriteStaff}
            onViewHorarios={() => onViewHorarios(colab)}
            onEdit={() => onEdit(colab)}
            onToggleActivo={() => onToggleActivo(colab)}
            onDelete={() => onDelete(colab)}
          />
        ))}
      </div>

      {/* DESKTOP / TABLET VIEW (>=640px): Tabla completa (§5.5, §8) */}
      <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-secondary text-xs font-medium">
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Colaborador
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Rol
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Sucursal
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Especialidades
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-center">
                  Citas
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Estado
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {colaboradores.map((colab) => (
                <PersonalColaboradorRow
                  key={`desk-${colab.id}`}
                  colab={colab}
                  sucursal={sucursales.find((s) => s.id === colab.sucursal_id)}
                  servicios={servicios}
                  citas={citas}
                  canWriteStaff={canWriteStaff}
                  onViewHorarios={() => onViewHorarios(colab)}
                  onEdit={() => onEdit(colab)}
                  onToggleActivo={() => onToggleActivo(colab)}
                  onDelete={() => onDelete(colab)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
