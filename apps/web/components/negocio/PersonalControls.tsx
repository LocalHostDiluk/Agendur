"use client";
import { Users, Calendar, Search } from "lucide-react";
import type { Sucursal } from "@/lib/types";
interface PersonalControlsProps {
  activeTab: "directorio" | "horarios"; setActiveTab: (tab: "directorio" | "horarios") => void;
  totalColaboradores: number; sucursales: Sucursal[];
  selectedSucursalId: string; setSelectedSucursalId: (id: string) => void;
  searchQuery: string; setSearchQuery: (query: string) => void;
}
export function PersonalControls({ activeTab, setActiveTab, totalColaboradores, sucursales,
  selectedSucursalId, setSelectedSucursalId, searchQuery, setSearchQuery }: PersonalControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Pills Switcher (§10: Directorio y Horarios semanales) */}
      <div
        className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit shrink-0"
        role="tablist"
        aria-label="Vistas de personal"
      >
        <button
          type="button"
          role="tab"
          id="tab-directorio"
          aria-selected={activeTab === "directorio"}
          onClick={() => setActiveTab("directorio")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
            activeTab === "directorio"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio del Equipo</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === "directorio"
                ? "bg-white/20 text-white"
                : "bg-surface-alt text-text-muted"
            }`}
          >
            {totalColaboradores}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-horarios"
          aria-selected={activeTab === "horarios"}
          onClick={() => setActiveTab("horarios")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
            activeTab === "horarios"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horarios semanales</span>
          <span className="sr-only">Matriz de Horarios</span>
        </button>

      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-md lg:justify-end">
        {/* Branch Filter */}
        {sucursales.length > 1 && (
          <div className="relative shrink-0 sm:w-48">
            <select
              value={selectedSucursalId}
              onChange={(e) => setSelectedSucursalId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
              aria-label="Filtrar por sucursal"
            >
              <option value="todas">Todas las sedes</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.es_matriz ? "(Matriz)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar colaborador o servicio..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
          />
        </div>
      </div>
    </div>
  );
}
