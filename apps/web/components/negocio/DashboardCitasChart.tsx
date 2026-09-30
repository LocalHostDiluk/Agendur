"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { DashboardChartFrame } from "./DashboardChartFrame";
import { DashboardChartOverlay } from "./DashboardChartOverlay";
import { ArrowUpRight, Clock, RefreshCw } from "lucide-react";
import type { getDashboardDailySeries } from "@/lib/utils/dashboard-series";
import { DashboardChartRange } from "./DashboardChartRange";
import { DashboardCitasPlot } from "./DashboardCitasPlot";

interface DashboardCitasChartProps {
  rangoCitas: "30d" | "mes";
  setRangoCitas: (range: "30d" | "mes") => void;
  citasPorDia: ReturnType<typeof getDashboardDailySeries>;
  totalCitasMostradas: number;
  mounted: boolean;
  isSyncError: boolean;
  citasError: boolean;
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardCitasChart({ rangoCitas, setRangoCitas, citasPorDia, totalCitasMostradas, mounted, isSyncError, citasError, handleRetryAll, isRetrying }: DashboardCitasChartProps) {
  return (
    <DashboardChartFrame
      ariaLabel="Citas por día (últimos 30 días)"
      descriptionId="chart-citas-desc"
      title="Citas por día"
      summary={<>{totalCitasMostradas} citas</>}
      subtitle={rangoCitas === "30d" ? "Últimos 30 días de actividad" : "Actividad del mes en curso"}
      controls={
            <DashboardChartRange rangoCitas={rangoCitas} setRangoCitas={setRangoCitas} />
      }
      description={<>Gráfica de línea mostrando la cantidad de citas registradas por día en los últimos 30 días.</>}
    >
          <div className="relative h-[260px] w-full">
            {mounted ? (
              <DashboardCitasPlot citasPorDia={citasPorDia} rangoCitas={rangoCitas} />
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}

            {/* Tarjeta flotante traslúcida cuando no hay datos sincronizados */}
            {(isSyncError || citasError || totalCitasMostradas === 0) && (
              <DashboardChartOverlay>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-grape-soft text-grape text-[11px] font-mono font-medium">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isSyncError || citasError
                        ? "SINCRONIZACIÓN EN PAUSA"
                        : "SIN CITAS EN ESTE PERIODO"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">
                    {isSyncError || citasError
                      ? "Restablece la conexión para graficar el volumen diario de reservaciones."
                      : "Las reservaciones confirmadas se graficarán automáticamente aquí."}
                  </p>
                  <div className="pt-0.5 flex items-center justify-center gap-2">
                    {isSyncError || citasError ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRetryAll}
                        isLoading={isRetrying}
                        className="cursor-pointer text-xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Actualizar serie</span>
                      </Button>
                    ) : (
                      <Link href="/agendas">
                        <Button variant="secondary" size="sm" className="text-xs">
                          <span>Agendar en Calendario</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
              </DashboardChartOverlay>
            )}
          </div>
    </DashboardChartFrame>
  );
}
