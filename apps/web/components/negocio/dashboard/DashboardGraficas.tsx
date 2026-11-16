import type { getDashboardDailySeries, getDashboardMonthlySeries } from "@/lib/utils/dashboard-series";
import { DashboardCitasChart } from "./DashboardCitasChart";
import { DashboardIngresosChart } from "./DashboardIngresosChart";

interface DashboardGraficasProps {
  rangoCitas: "30d" | "mes";
  setRangoCitas: (range: "30d" | "mes") => void;
  citasPorDia: ReturnType<typeof getDashboardDailySeries>;
  totalCitasMostradas: number;
  ingresosPorMes: ReturnType<typeof getDashboardMonthlySeries>;
  totalIngresos6Meses: number;
  activeBarIndex: number | null;
  setActiveBarIndex: (index: number | null) => void;
  mounted: boolean;
  isSyncError: boolean;
  citasError: boolean;
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardGraficas({ rangoCitas, setRangoCitas, citasPorDia, totalCitasMostradas, ingresosPorMes, totalIngresos6Meses, activeBarIndex, setActiveBarIndex, mounted, isSyncError, citasError, handleRetryAll, isRetrying }: DashboardGraficasProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCitasChart
        rangoCitas={rangoCitas} setRangoCitas={setRangoCitas}
        citasPorDia={citasPorDia} totalCitasMostradas={totalCitasMostradas}
        mounted={mounted} isSyncError={isSyncError} citasError={citasError}
        handleRetryAll={handleRetryAll} isRetrying={isRetrying}
      />
      <DashboardIngresosChart
        ingresosPorMes={ingresosPorMes} totalIngresos6Meses={totalIngresos6Meses}
        activeBarIndex={activeBarIndex} setActiveBarIndex={setActiveBarIndex}
        mounted={mounted} isSyncError={isSyncError} citasError={citasError}
      />
    </div>
  );
}
