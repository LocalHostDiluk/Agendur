import Link from "next/link";
import { ArrowUpRight, Clock, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import type { getDashboardIncomeMetrics } from "@/lib/utils/dashboard-metrics";
import { DashboardCitasTodayKpi } from "./DashboardCitasTodayKpi";
import { DashboardKpiCard } from "./DashboardKpiCard";

interface DashboardKpisProps {
  isSyncError: boolean;
  citasError: boolean;
  citasHoyCount: number;
  citasPendientesCount: number;
  ingresosMesActual: number;
  tendenciaIngresos: ReturnType<typeof getDashboardIncomeMetrics>["tendenciaIngresos"];
  tasaOcupacion: number;
  tasaInasistencias: string;
  totalCanceladas: number;
  inasistenciasElevadas: boolean;
  citasCount: number;
}

export function DashboardKpis({
  isSyncError, citasError,
  citasHoyCount, citasPendientesCount,
  ingresosMesActual, tendenciaIngresos,
  tasaOcupacion, tasaInasistencias,
  totalCanceladas, inasistenciasElevadas, citasCount,
}: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCitasTodayKpi
        isSyncError={isSyncError}
        citasError={citasError}
        citasHoyCount={citasHoyCount}
        citasPendientesCount={citasPendientesCount}
      />
      <DashboardKpiCard
        title="Ingresos del mes"
        icon={<DollarSign className="w-4 h-4 text-grape" />}
        delay={0.1}
        truncate
        metric={
          <>
            ${ingresosMesActual.toLocaleString("es-MX")}
            <span className="text-xs font-normal text-text-muted ml-1">
              MXN
            </span>
          </>
        }
        status={
          <Badge
            variant={tendenciaIngresos.positivo ? "success" : "danger"}
            size="sm"
            dot={true}
          >
            {tendenciaIngresos.texto}
          </Badge>
        }
        footer={
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>vs. mes anterior</span>
            <Link
              href="/pagos"
              className="text-grape font-medium hover:underline inline-flex items-center gap-0.5 shrink-0"
            >
              <span>Ver ingresos</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        }
      />
      <DashboardKpiCard
        title="Tasa de ocupación"
        icon={<Users className="w-4 h-4 text-grape" />}
        delay={0.16}
        metric={<>{tasaOcupacion}%</>}
        status={
          <Badge
            variant={tasaOcupacion >= 70 ? "success" : "warning"}
            size="sm"
            dot={true}
          >
            {tasaOcupacion >= 70 ? "Ocupación óptima" : "Moderada"}
          </Badge>
        }
        footer={
          <div className="space-y-1.5 pt-0.5">
            <div className="w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-grape h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tasaOcupacion, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>Capacidad estimada</span>
              <span className="font-mono text-text-primary">
                {tasaOcupacion}% de cupo
              </span>
            </div>
          </div>
        }
      />
      <DashboardKpiCard
        title="Tasa de inasistencias"
        icon={<Clock className="w-4 h-4 text-grape" />}
        delay={0.22}
        metric={<>{tasaInasistencias}%</>}
        status={
          <Badge
            variant={inasistenciasElevadas ? "danger" : "neutral"}
            size="sm"
            dot={true}
          >
            {inasistenciasElevadas ? "Atención" : "Bajo control"}
          </Badge>
        }
        footer={
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Citas canceladas</span>
            <span className="font-mono text-text-secondary">
              {totalCanceladas} de {citasCount || "0"}
            </span>
          </div>
        }
      />
    </div>
  );
}
