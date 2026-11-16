"use client";

import Link from "next/link";
import { Button, PendingBadge } from "@/components/ui";
import { DashboardChartFrame } from "./DashboardChartFrame";
import { DashboardChartOverlay } from "./DashboardChartOverlay";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import type { getDashboardMonthlySeries } from "@/lib/utils/dashboard-series";
import { DashboardIngresosPlot } from "./DashboardIngresosPlot";

interface DashboardIngresosChartProps {
  ingresosPorMes: ReturnType<typeof getDashboardMonthlySeries>;
  totalIngresos6Meses: number;
  activeBarIndex: number | null;
  setActiveBarIndex: (index: number | null) => void;
  mounted: boolean;
  isSyncError: boolean;
  citasError: boolean;
}

export function DashboardIngresosChart({ ingresosPorMes, totalIngresos6Meses, activeBarIndex, setActiveBarIndex, mounted, isSyncError, citasError }: DashboardIngresosChartProps) {
  return (
    <DashboardChartFrame
      ariaLabel="Ingresos por mes (últimos 6 meses)"
      descriptionId="chart-ingresos-desc"
      title="Ingresos por mes"
      summary={<>${totalIngresos6Meses.toLocaleString("es-MX")} MXN</>}
      subtitle={"Últimos 6 meses confirmados"}
      controls={
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface text-text-muted text-xs font-medium cursor-not-allowed select-none"
                title="Exportación de reportes en preparación"
              >
                <span>Exportar reporte</span>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Exportación de reportes en preparación"
                />
              </button>
            </div>
      }
      description={<>Gráfica de barras mostrando el total de ingresos por mes en pesos mexicanos durante los últimos 6 meses.</>}
    >
          <div className="relative h-[260px] w-full">
            {mounted ? (
              <DashboardIngresosPlot ingresosPorMes={ingresosPorMes} activeBarIndex={activeBarIndex} setActiveBarIndex={setActiveBarIndex} />
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}

            {/* Tarjeta flotante traslúcida cuando no hay ingresos sincronizados */}
            {(isSyncError || citasError || totalIngresos6Meses === 0) && (
              <DashboardChartOverlay>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary border border-border text-[11px] font-mono font-medium">
                    <TrendingUp className="w-3 h-3 text-grape" />
                    <span>
                      {isSyncError || citasError
                        ? "HISTORIAL PENDIENTE"
                        : "$0 MXN ACUMULADOS"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">
                    {isSyncError || citasError
                      ? "Al reconectar tu cuenta verás la comparativa mensual de ingresos."
                      : "Los ingresos de citas confirmadas y completadas se reflejan mes a mes."}
                  </p>
                  <div className="pt-0.5 flex items-center justify-center gap-2">
                    <Link href="/pagos">
                      <Button variant="secondary" size="sm" className="text-xs">
                        <span>Ver Pagos y Facturación</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
              </DashboardChartOverlay>
            )}
          </div>
    </DashboardChartFrame>
  );
}
