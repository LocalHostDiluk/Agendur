"use client";

import { Store, Sparkles, ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PendingBadge } from "@/components/ui/PendingBadge";
import type { SucursalesTab } from "./SucursalesHeader";

interface SucursalesTabsProps {
  activeTab: SucursalesTab;
  onTabChange: (tab: SucursalesTab) => void;
  sucursalesCount: number;
  serviciosCount: number;
  loadingSucursales: boolean;
  loadingServicios: boolean;
}

export function SucursalesTabs({
  activeTab,
  onTabChange,
  sucursalesCount,
  serviciosCount,
  loadingSucursales,
  loadingServicios,
}: SucursalesTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
      <div
        role="tablist"
        aria-label="Pestañas de sedes y servicios"
        className="inline-flex items-center p-1 bg-surface-alt/70 border border-border rounded-xl text-xs sm:text-sm font-medium"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "sucursales"}
          aria-controls="panel-sucursales"
          id="tab-sucursales"
          onClick={() => onTabChange("sucursales")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[36px] cursor-pointer ${
            activeTab === "sucursales"
              ? "bg-surface text-text-primary shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Store className="w-4 h-4" strokeWidth={1.75} />
          <span>Sucursales</span>
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === "sucursales"
                ? "bg-grape-soft text-grape font-bold"
                : "bg-border/60 text-text-muted"
            }`}
          >
            {loadingSucursales ? "…" : sucursalesCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "servicios"}
          aria-controls="panel-servicios"
          id="tab-servicios"
          onClick={() => onTabChange("servicios")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[36px] cursor-pointer ${
            activeTab === "servicios"
              ? "bg-surface text-text-primary shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
          <span>Servicios</span>
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === "servicios"
                ? "bg-grape-soft text-grape font-bold"
                : "bg-border/60 text-text-muted"
            }`}
          >
            {loadingServicios ? "…" : serviciosCount}
          </span>
        </button>
      </div>

      {/* 5. Opciones avanzadas con marcas de pendientes */}
      <div className="flex items-center gap-2">
        {activeTab === "servicios" ? (
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-text-secondary"
              disabled
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Reordenar</span>
              <PendingBadge
                label="Pendiente"
                tooltip="Ordenamiento drag & drop de catálogo en desarrollo"
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-text-secondary"
              disabled
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
              <PendingBadge
                label="Pendiente"
                tooltip="Exportación en formato CSV/Excel en desarrollo"
              />
            </Button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-text-secondary"
              disabled
            >
              <Sparkles className="w-3.5 h-3.5 text-grape" />
              <span>Sincronizar Google Business</span>
              <PendingBadge
                label="Pendiente"
                tooltip="Sincronización automática de sucursales con Google Business"
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
