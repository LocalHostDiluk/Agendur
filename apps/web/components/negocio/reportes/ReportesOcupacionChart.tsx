import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { OCUPACION_SUCURSALES_DATA } from "@/lib/utils/reportes-data";
import { ReportesTooltip } from "./ReportesTooltip";

export function ReportesOcupacionChart() {
  return (
    <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-grape" />
            <h2 className="font-bricolage font-bold text-base text-text-primary">
              Ocupación por Sucursal
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Porcentaje de utilización de sillones y consultorios.
          </p>
        </div>
        <span className="font-mono text-xs text-grape font-bold">
          3 sedes
        </span>
      </div>

      <div
        className="h-[280px] w-full"
        aria-describedby="desc-ocupacion-sucursales"
      >
        <span id="desc-ocupacion-sucursales" className="sr-only">
          Gráfica de barras mostrando la tasa de ocupación por sucursal: Matriz Centro 84%, Providencia 76%, Valle Oriente 68%.
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={OCUPACION_SUCURSALES_DATA}
            margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="sucursal"
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
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-alt)", opacity: 0.6 }}
              content={<ReportesTooltip unit="%" />}
            />
            <Bar
              dataKey="ocupacion"
              radius={[6, 6, 0, 0]}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {OCUPACION_SUCURSALES_DATA.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
