"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { getDashboardDailySeries } from "@/lib/utils/dashboard-series";
import { getDashboardChartGrid } from "./DashboardChartFrame";
import { DashboardChartTooltip } from "./DashboardChartTooltip";

interface DashboardCitasPlotProps {
  citasPorDia: ReturnType<typeof getDashboardDailySeries>;
  rangoCitas: "30d" | "mes";
}

export function DashboardCitasPlot({ citasPorDia, rangoCitas }: DashboardCitasPlotProps) {
  return (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={citasPorDia}
                  margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
                >
                  {getDashboardChartGrid()}
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    interval={rangoCitas === "30d" ? 4 : 2}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<DashboardChartTooltip unit="citas" />} />
                  <Line
                    type="monotone"
                    dataKey="citas"
                    name="Citas"
                    stroke="#6a2875"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#6a2875",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
  );
}
