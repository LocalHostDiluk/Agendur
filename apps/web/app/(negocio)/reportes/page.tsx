"use client";

import {
  ReportesHeaderFilters,
  ReportesKpiGrid,
  ReportesOcupacionChart,
  ReportesServiciosChart,
  ReportesInasistenciasChart,
} from "@/components/negocio/reportes";
import { useReportesFilters } from "@/lib/hooks/use-reportes-filters";

export default function ReportesPage() {
  const {
    rangoRapido,
    setRangoRapido,
    sucursalSeleccionada,
    setSucursalSeleccionada,
    sucursales,
  } = useReportesFilters();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      <ReportesHeaderFilters
        rangoRapido={rangoRapido}
        onRangoChange={setRangoRapido}
        sucursalSeleccionada={sucursalSeleccionada}
        onSucursalChange={setSucursalSeleccionada}
        sucursales={sucursales}
      />

      <ReportesKpiGrid />

      {/* 3 Gráficas Recharts estilizadas con tokens Agendur (§6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ReportesOcupacionChart />
        <ReportesServiciosChart />
        <ReportesInasistenciasChart />
      </div>
    </div>
  );
}
