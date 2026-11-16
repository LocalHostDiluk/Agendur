import { Download, Building } from "lucide-react";
import { Button, PendingBadge } from "@/components/ui";
import type { RangoRapido } from "@/lib/utils/reportes-data";

interface SucursalOption {
  id: string;
  nombre: string;
}

interface ReportesHeaderFiltersProps {
  rangoRapido: RangoRapido;
  onRangoChange: (rango: RangoRapido) => void;
  sucursalSeleccionada: string;
  onSucursalChange: (sucursalId: string) => void;
  sucursales: SucursalOption[];
}

export function ReportesHeaderFilters({
  rangoRapido,
  onRangoChange,
  sucursalSeleccionada,
  onSucursalChange,
  sucursales,
}: ReportesHeaderFiltersProps) {
  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Reportes y Analítica
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza métricas operativas clave, rendimiento de sucursales y demanda de servicios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            disabled
            className="gap-2 shrink-0"
            title="Descarga en PDF/CSV en desarrollo"
          >
            <Download className="w-4 h-4" />
            <span>Exportar reporte</span>
            <span className="sr-only"> (Exportar informe)</span>
            <PendingBadge
              label="Pendiente"
              tooltip="Descarga en PDF/CSV en desarrollo"
            />
          </Button>
        </div>
      </div>

      {/* Barra de Filtros (§6 & §10) */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        {/* Rango de Fechas con botones rápidos */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-xl">
          <button
            type="button"
            onClick={() => onRangoChange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "7d"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => onRangoChange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "30d"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => onRangoChange("mes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "mes"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Este mes
          </button>
        </div>

        {/* Selector de Sucursal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary shrink-0">
            <Building className="w-3.5 h-3.5 text-grape" />
            <span>Sucursal:</span>
          </div>
          <select
            value={sucursalSeleccionada}
            onChange={(e) => onSucursalChange(e.target.value)}
            className="select-native w-full sm:w-56 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape focus:ring-2 focus:ring-grape min-h-[38px]"
          >
            <option value="todas">Todas las sedes</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
