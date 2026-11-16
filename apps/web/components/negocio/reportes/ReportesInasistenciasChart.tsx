import { Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { INASISTENCIAS_DATA } from "@/lib/utils/reportes-data";
import { ReportesTooltip } from "./ReportesTooltip";

export function ReportesInasistenciasChart() {
  return (
    <div className="lg:col-span-12 p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-danger" />
            <h2 className="font-bricolage font-bold text-base text-text-primary">
              Tasa de Inasistencias
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Seguimiento porcentual de citas no asistidas o canceladas sin previo aviso (§6).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-danger" />
          <span className="text-xs text-text-secondary font-medium">
            Tasa semanal
          </span>
        </div>
      </div>

      <div
        className="h-[300px] w-full"
        aria-describedby="desc-tasa-inasistencias"
      >
        <span id="desc-tasa-inasistencias" className="sr-only">
          Gráfica de área continua mostrando la tasa de inasistencias por semana, con promedio de 3.7%.
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={INASISTENCIAS_DATA}
            margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d14343" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#d14343" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="fecha"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              domain={[0, 10]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<ReportesTooltip unit="%" />} />
            <Area
              type="monotone"
              dataKey="tasa"
              name="Tasa de Inasistencia"
              stroke="#d14343"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#dangerGradient)"
              animationDuration={600}
              animationEasing="ease-out"
              activeDot={{ r: 5, fill: "#d14343", stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
