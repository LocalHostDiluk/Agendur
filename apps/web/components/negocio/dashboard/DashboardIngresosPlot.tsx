"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { getDashboardMonthlySeries } from "@/lib/utils/dashboard-series";
import { getDashboardChartGrid } from "./DashboardChartFrame";
import { DashboardChartTooltip } from "./DashboardChartTooltip";

interface DashboardIngresosPlotProps {
  ingresosPorMes: ReturnType<typeof getDashboardMonthlySeries>;
  activeBarIndex: number | null;
  setActiveBarIndex: (index: number | null) => void;
}

export function DashboardIngresosPlot({ ingresosPorMes, activeBarIndex, setActiveBarIndex }: DashboardIngresosPlotProps) {
  return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ingresosPorMes}
                  margin={{ top: 10, right: 10, left: -14, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (
                      state &&
                      typeof state.activeTooltipIndex !== "undefined" &&
                      state.activeTooltipIndex !== null
                    ) {
                      setActiveBarIndex(Number(state.activeTooltipIndex));
                    }
                  }}
                  onMouseLeave={() => setActiveBarIndex(null)}
                >
                  {getDashboardChartGrid()}
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    content={<DashboardChartTooltip unit="MXN" />}
                    cursor={{ fill: "var(--surface-alt)", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {/* Único uso autorizado de flame en gráficas (§6): la barra activa en hover */}
                    {ingresosPorMes.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={activeBarIndex === index ? "#d44324" : "#6a2875"}
                        className="transition-colors duration-150 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
  );
}
