import { PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { SERVICIOS_POPULARES_DATA } from "@/lib/utils/reportes-data";
import { ReportesTooltip } from "./ReportesTooltip";

export function ReportesServiciosChart() {
  return (
    <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-grape" />
            <h2 className="font-bricolage font-bold text-base text-text-primary">
              Servicios Más Solicitados
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Distribución porcentual sobre el total de citas atendidas.
          </p>
        </div>
        <span className="font-mono text-xs text-text-secondary">
          Top 5
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Donut Chart */}
        <div
          className="sm:col-span-7 h-[280px] w-full"
          aria-describedby="desc-servicios-populares"
        >
          <span id="desc-servicios-populares" className="sr-only">
            Gráfica donut de servicios más solicitados: Corte 38%, Colorimetría 24%, Facial 18%, Masaje 12%, Manicura 8%.
          </span>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ReportesTooltip unit="citas" />} />
              <Pie
                data={SERVICIOS_POPULARES_DATA}
                dataKey="citas"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {SERVICIOS_POPULARES_DATA.map((entry, index) => (
                  <Cell key={`donut-cell-${index}`} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="sm:col-span-5 space-y-2.5 text-xs">
          {SERVICIOS_POPULARES_DATA.map((srv) => (
            <div key={srv.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: srv.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-text-primary font-medium">
                  {srv.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                <span className="font-bold text-text-primary">{srv.porcentaje}%</span>
                <span className="text-text-muted">({srv.citas})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
