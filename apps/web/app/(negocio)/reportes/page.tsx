"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Percent,
  CheckCircle2,
  DollarSign,
  Building,
  PieChart as PieChartIcon,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button, Badge, PendingBadge } from "@/components/ui";
import { useSucursales } from "@/lib/hooks";
import { ReportesLoading } from "./loading";

// Official rotating palette tokens (§6)
const PALETA_ROTATIVA = [
  "#6e49a6", // --grape
  "#3f9e76", // --success
  "#e8a23d", // --warning
  "#ff5a36", // --flame
  "#a39c8c", // --text-muted
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
  unit?: string;
}

function ReportTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface border border-border rounded-[var(--radius-sm)] shadow-xs p-2.5 text-xs font-sans min-w-[130px]">
        <p className="text-text-secondary font-medium">{label || item.name}</p>
        <p className="font-mono font-bold text-text-primary mt-1 text-sm tabular-nums">
          {unit === "MXN"
            ? `$${Number(item.value).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
            : unit === "%"
            ? `${item.value}% ocupación`
            : `${item.value} ${item.value === 1 ? "cita" : "citas"}`}
        </p>
      </div>
    );
  }
  return null;
}

// 1. Ocupación por sucursal (§6: Bar horizontal/vertical con paleta rotativa fija)
const OCUPACION_SUCURSALES_DATA = [
  { sucursal: "Matriz Centro", ocupacion: 84, citas: 68, color: PALETA_ROTATIVA[0] },
  { sucursal: "Providencia", ocupacion: 76, citas: 48, color: PALETA_ROTATIVA[1] },
  { sucursal: "Valle Oriente", ocupacion: 68, citas: 26, color: PALETA_ROTATIVA[2] },
];

// 2. Servicios más solicitados (§6: Donut con paleta rotativa oficial)
const SERVICIOS_POPULARES_DATA = [
  { name: "Corte & Estilo", citas: 54, porcentaje: 38, color: PALETA_ROTATIVA[0] },
  { name: "Colorimetría & Mechas", citas: 34, porcentaje: 24, color: PALETA_ROTATIVA[1] },
  { name: "Tratamiento Facial", citas: 26, porcentaje: 18, color: PALETA_ROTATIVA[2] },
  { name: "Masaje Relajante", citas: 17, porcentaje: 12, color: PALETA_ROTATIVA[3] },
  { name: "Manicura & Spa", citas: 11, porcentaje: 8, color: PALETA_ROTATIVA[4] },
];

// 3. Tasa de inasistencias (§6: Área con --danger al 12% de opacidad de relleno, línea sólida)
const INASISTENCIAS_DATA = [
  { fecha: "1-7 Sep", tasa: 5.2, inasistencias: 4 },
  { fecha: "8-14 Sep", tasa: 4.8, inasistencias: 3 },
  { fecha: "15-21 Sep", tasa: 3.5, inasistencias: 2 },
  { fecha: "22-28 Sep", tasa: 2.8, inasistencias: 2 },
  { fecha: "29-30 Sep", tasa: 2.1, inasistencias: 1 },
];

export default function ReportesPage() {
  const [rangoRapido, setRangoRapido] = useState<"7d" | "30d" | "mes">("30d");
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>("todas");

  const { data: sucursalesData } = useSucursales();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Reportes y Analítica
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza métricas operativas clave, rendimiento de sucursales y demanda de servicios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            disabled
            className="gap-2 shrink-0"
            title="Descarga en PDF/CSV en desarrollo"
          >
            <Download className="w-4 h-4" />
            <span>Exportar reporte</span>
            <span className="sr-only"> (Exportar informe)</span>
            <PendingBadge
              label="Pendiente"
              tooltip="Descarga en PDF/CSV en desarrollo"
            />
          </Button>
        </div>
      </div>

      {/* Barra de Filtros (§6 & §10) */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        {/* Rango de Fechas con botones rápidos */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-xl">
          <button
            type="button"
            onClick={() => setRangoRapido("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "7d"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => setRangoRapido("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "30d"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => setRangoRapido("mes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rangoRapido === "mes"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Este mes
          </button>
        </div>

        {/* Selector de Sucursal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary shrink-0">
            <Building className="w-3.5 h-3.5 text-grape" />
            <span>Sucursal:</span>
          </div>
          <select
            value={sucursalSeleccionada}
            onChange={(e) => setSucursalSeleccionada(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
          >
            <option value="todas">Todas las sedes</option>
            {sucursalesData?.sucursales?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Métricas Resumen (§10, §5.3 con jerarquía obligatoria y Space Mono 32px) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Destacada (Tasa de ocupación promedio) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-grape-soft/40 border border-grape/30 space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Tasa de ocupación promedio
            </span>
            <div className="size-8 rounded-lg bg-grape text-white flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              78.4%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% vs periodo anterior</span>
          </div>
        </div>

        {/* KPI 2: Citas Completadas */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Citas completadas
            </span>
            <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              142
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12 citas confirmadas</span>
          </div>
        </div>

        {/* KPI 3: Ticket Promedio */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Ticket promedio
            </span>
            <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              $420.00 MXN
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+$35.00 MXN de incremento</span>
          </div>
        </div>
      </div>

      {/* 3 Gráficas Recharts estilizadas con tokens Agendur (§6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRÁFICA 1: Ocupación por Sucursal (§6: Barra con paleta rotativa fija) */}
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
                  content={<ReportTooltip unit="%" />}
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

        {/* GRÁFICA 2: Servicios Más Solicitados (§6: Donut con paleta rotativa oficial) */}
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
                  <Tooltip content={<ReportTooltip unit="citas" />} />
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

        {/* GRÁFICA 3: Tasa de inasistencias (§6: Área con --danger al 12% de opacidad de relleno, línea sólida) */}
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
                <Tooltip content={<ReportTooltip unit="%" />} />
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
      </div>
    </div>
  );
}
