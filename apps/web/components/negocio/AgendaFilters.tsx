"use client";

import { PendingBadge } from "@/components/ui";
import type { Sucursal, Profesional, EstadoCita } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";

interface AgendaFiltersProps {
  sucursales: Sucursal[];
  profesionales: Profesional[];
  filterSucursal: string;
  filterProfesional: string;
  filterEstado: EstadoCita | "";
  setFilterSucursal: ReturnType<typeof useAgendaUi>["setFilterSucursal"];
  setFilterProfesional: ReturnType<typeof useAgendaUi>["setFilterProfesional"];
  setFilterEstado: ReturnType<typeof useAgendaUi>["setFilterEstado"];
}

export function AgendaFilters({ sucursales, profesionales, filterSucursal, filterProfesional, filterEstado, setFilterSucursal, setFilterProfesional, setFilterEstado }: AgendaFiltersProps) {
  return (
    <>
{/* Filtro por Sucursal */}
            {sucursales.length > 1 && (
              <select
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por sucursal"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Filtro por Profesional / Colaborador */}
            <div className="flex items-center gap-1">
              <select
                value={filterProfesional}
                onChange={(e) => setFilterProfesional(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por profesional"
              >
                <option value="">Todos los profesionales</option>
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <PendingBadge
                label="Pendiente"
                tooltip="Filtrado por profesional en desarrollo"
                className="ml-1 shrink-0"
              />
            </div>

            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as EstadoCita | "")
              }
              className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Filtrar por estado de cita"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente_pago">Pendientes de pago</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="no_asistio">No asistió</option>
            </select>
    </>
  );
}
