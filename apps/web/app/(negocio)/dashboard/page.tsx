"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Calendar,
  Store,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { notify } from "@/lib/utils/toast";
import { getBusinessToday } from "@/lib/utils/business-date";
import { useAuthMe, useCitasNegocio, useSuscripcion } from "@/lib/hooks";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
  unit?: string;
}

function CustomChartTooltip({ active, payload, label, unit }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-surface border border-border rounded-md shadow-sm p-2 text-xs">
        <p className="text-text-secondary font-medium">{label}</p>
        <p className="font-mono font-bold text-text-primary mt-0.5">
          {unit === "MXN"
            ? `$${Number(val).toLocaleString("es-MX")} MXN`
            : `${val} ${val === 1 ? "cita" : "citas"}`}
        </p>
      </div>
    );
  }
  return null;
}

const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const { data: auth, isLoading: authLoading, isError: authError } = useAuthMe();
  const { data: suscripcionResponse } = useSuscripcion();
  const {
    data: citasResponse,
    isLoading: citasLoading,
    isError: citasError,
    refetch: refetchCitas,
  } = useCitasNegocio();

  const negocio = auth?.negocio;
  const suscripcion = suscripcionResponse?.data.suscripcion ?? auth?.suscripcion;
  const citas = useMemo(() => citasResponse?.citas ?? [], [citasResponse?.citas]);
  const hoy = getBusinessToday(negocio?.zona_horaria);
  const citasHoy = hoy ? citas.filter((cita) => cita.fecha === hoy) : undefined;
  const citasPendientes = citasHoy?.filter((cita) => cita.estado === "pendiente_pago");
  const ingresosConfirmados = citas
    .filter((cita) => cita.estado === "confirmada")
    .reduce((total, cita) => total + (cita.precio_total ?? 0), 0);
  const negocioSlug = negocio?.slug;
  const planNombre = suscripcion?.plan_nombre ?? "—";
  const sucursalesUsadas = suscripcionResponse?.data.sucursales_usadas ?? "—";
  const sucursalesLimite =
    suscripcionResponse?.data.sucursales_limite ?? suscripcion?.limite_sucursales ?? "—";

  // Chart 1: 30 days series from citas
  const citasPorDia = useMemo(() => {
    const series = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const count = citas.filter((c) => c.fecha === dateStr).length;
      const label = d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
      series.push({
        date: dateStr,
        label,
        citas: count,
      });
    }
    return series;
  }, [citas]);

  // Chart 2: 6 months income series
  const ingresosPorMes = useMemo(() => {
    const series = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const prefix = `${yyyy}-${mm}`;
      const monthLabel = d.toLocaleDateString("es-MX", { month: "short" });
      const total = citas
        .filter((c) => c.fecha?.startsWith(prefix) && (c.estado === "confirmada" || c.estado === "completada"))
        .reduce((sum, c) => sum + (c.precio_total ?? 0), 0);
      series.push({
        month: prefix,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        ingresos: total,
      });
    }
    return series;
  }, [citas]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-12" role="status">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-grape border-t-transparent animate-spin" />
          <span>Cargando tu negocio…</span>
        </div>
      </div>
    );
  }

  if (authError || !auth) {
    return (
      <div role="alert" className="p-6 rounded-xl border border-danger/20 bg-danger-soft text-danger text-sm max-w-xl mx-auto">
        <p className="font-semibold">No pudimos cargar tu negocio.</p>
        <p className="text-xs mt-1 text-text-secondary">Recarga la página o vuelve a iniciar sesión.</p>
      </div>
    );
  }

  if (auth?.onboardingStatus === "required") {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
        <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Hola, {auth.perfil?.nombres ?? auth.user?.email ?? "bienvenido"}
        </h1>
        <p className="text-sm text-text-secondary">
          Tu negocio aún no tiene una primera sucursal. Completa tus datos y registra una ubicación real antes de publicar tu portal de reservas.
        </p>
        <p className="text-sm font-medium text-text-primary">0 sedes registradas</p>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center rounded-md bg-grape px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
        >
          Registrar primera sucursal
        </Link>
      </div>
    );
  }

  const copyBookingUrl = () => {
    if (!negocioSlug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/reserva/${negocioSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    notify.success("Enlace copiado", "Se copió el enlace al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return (
          <span className="inline-flex items-center gap-1.5 bg-success-soft text-success border border-success/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Confirmada
          </span>
        );
      case "pendiente_pago":
        return (
          <span className="inline-flex items-center gap-1.5 bg-warning-soft text-warning border border-warning/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            Pendiente pago
          </span>
        );
      case "completada":
        return (
          <span className="inline-flex items-center gap-1.5 bg-grape-soft text-grape border border-grape/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-grape" />
            Completada
          </span>
        );
      case "cancelada":
        return (
          <span className="inline-flex items-center gap-1.5 bg-danger-soft text-danger border border-danger/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-surface-alt text-text-secondary border border-border rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
            <span>Plan {planNombre}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-text-secondary font-normal">Activo</span>
          </div>
          <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Hola, {negocio?.nombre_comercial ?? "—"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
            Tu portal de reservas está activo y listo para recibir clientes en línea en tus sedes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyBookingUrl}
            disabled={!negocioSlug}
            className="inline-flex items-center gap-2 px-3 border border-border bg-surface hover:bg-surface-alt text-text-primary text-xs font-medium rounded-md h-[36px] transition-colors disabled:opacity-50"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-text-secondary" />
            )}
            <span>
              {copied ? "¡Enlace Copiado!" : "Copiar Enlace de Reserva"}
            </span>
          </button>

          <Link
            href={negocioSlug ? `/reserva/${negocioSlug}` : "/"}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 bg-grape text-white hover:opacity-90 text-xs font-medium rounded-md h-[36px] transition-opacity"
          >
            <span>Ver Portal Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards with strict hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 (DESTACADA): Citas para Hoy */}
        <div className="bg-grape-soft/50 border border-grape/30 rounded-xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-normal">
              Citas para Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-grape/10 text-grape flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {citasHoy?.length ?? "—"}
            </span>
            <span className="bg-warning-soft text-warning border border-warning/20 text-[11px] rounded-md px-2 py-0.5 font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {citasPendientes?.length ?? 0} pendiente{citasPendientes?.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">Todas tus sucursales activas</span>
            <span className="text-success font-medium inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-success" />
              Activas hoy
            </span>
          </div>
        </div>

        {/* Card 2: Sedes Habilitadas */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-normal">
              Sedes Habilitadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {sucursalesUsadas}{" "}
              <span className="text-sm font-normal text-text-muted">
                / {sucursalesLimite}
              </span>
            </span>
            <Link
              href="/sucursales"
              className="text-[11px] font-medium text-grape hover:underline inline-flex items-center gap-0.5"
            >
              Gestionar <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-text-secondary">
            Capacidad de tu plan: {sucursalesLimite} sedes
          </p>
        </div>

        {/* Card 3: Suscripción SaaS */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-normal">
              Suscripción SaaS
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-medium text-text-primary capitalize truncate">
              {planNombre}
            </span>
            <span
              className={
                suscripcion?.estado === "active" || suscripcion?.estado === "trialing"
                  ? "bg-success-soft text-success border border-success/20 text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1"
                  : "bg-surface-alt text-text-secondary border border-border text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  suscripcion?.estado === "active" || suscripcion?.estado === "trialing"
                    ? "bg-success"
                    : "bg-text-muted"
                }`}
              />
              {suscripcion?.estado ?? "—"}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Facturación {suscripcion?.intervalo ?? "—"}
          </p>
        </div>

        {/* Card 4: Servicios Agendados / Ingresos */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-normal">
              Servicios Agendados / Ingresos
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[28px] font-bold tabular-nums text-text-primary leading-none">
              {ingresosConfirmados === undefined
                ? "—"
                : `$${ingresosConfirmados.toLocaleString("es-MX")}`}
              <span className="text-xs font-normal text-text-muted ml-1">MXN</span>
            </span>
            <span className="bg-success-soft text-success border border-success/20 text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Confirmadas
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Valor total de citas confirmadas
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Citas por día */}
        <div
          className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm min-w-0 space-y-4"
          role="region"
          aria-label="Citas por día (últimos 30 días)"
          aria-describedby="chart-citas-desc"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bricolage font-semibold text-base text-text-primary">
                Citas por día
              </h2>
              <p className="text-xs text-text-secondary">Últimos 30 días de actividad</p>
            </div>
            <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2.5 py-1 rounded-md">
              {citasPorDia.reduce((acc, curr) => acc + curr.citas, 0)} citas
            </span>
          </div>
          <p id="chart-citas-desc" className="sr-only">
            Gráfica de línea mostrando la cantidad de citas registradas por día en los últimos 30 días.
          </p>

          <div className="h-[260px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={citasPorDia}
                  margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomChartTooltip unit="citas" />} />
                  <Line
                    type="monotone"
                    dataKey="citas"
                    name="Citas"
                    stroke="#6E49A6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#6E49A6" }}
                    activeDot={{ r: 5, fill: "#6E49A6" }}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}
          </div>
        </div>

        {/* Chart 2: Ingresos por mes */}
        <div
          className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm min-w-0 space-y-4"
          role="region"
          aria-label="Ingresos por mes (últimos 6 meses)"
          aria-describedby="chart-ingresos-desc"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bricolage font-semibold text-base text-text-primary">
                Ingresos por mes
              </h2>
              <p className="text-xs text-text-secondary">Últimos 6 meses confirmados</p>
            </div>
            <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2.5 py-1 rounded-md">
              ${ingresosPorMes.reduce((acc, curr) => acc + curr.ingresos, 0).toLocaleString("es-MX")} MXN
            </span>
          </div>
          <p id="chart-ingresos-desc" className="sr-only">
            Gráfica de barras mostrando el total de ingresos por mes en pesos mexicanos durante los últimos 6 meses.
          </p>

          <div className="h-[260px] w-full">
            {mounted ? (
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
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
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                  />
                  <Tooltip
                    content={<CustomChartTooltip unit="MXN" />}
                    cursor={{ fill: "var(--surface-alt)", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {ingresosPorMes.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={activeBarIndex === index ? "#FF7A57" : "#6E49A6"}
                        className="transition-colors duration-150 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Main Appointments Table Container */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bricolage font-bold text-base text-text-primary">
              Citas Recientes y Próximas
            </h2>
            <p className="text-xs text-text-secondary">
              Listado de reservaciones de clientes en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agendas"
              className="text-xs font-medium text-grape hover:underline inline-flex items-center gap-1"
            >
              <span>Ver Calendario Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 ESTADOS DE LA TABLA (Section 5.5) */}
        {/* Estado 1: Loading (Skeleton) */}
        {citasLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-surface-alt text-text-secondary text-[12px] font-medium tracking-normal uppercase border-b border-border z-10">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Sede / Sucursal</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="h-12 animate-pulse">
                    <td className="py-3 px-4">
                      <div className="h-3.5 w-28 bg-surface-alt rounded" />
                      <div className="h-2.5 w-20 bg-surface-alt rounded mt-1.5" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-3 w-20 bg-surface-alt rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-3 w-24 bg-surface-alt rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-3 w-24 bg-surface-alt rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-3 w-16 bg-surface-alt rounded" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-5 w-20 bg-surface-alt rounded-full ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Estado 2: Error state with retry */}
        {!citasLoading && citasError && (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center bg-danger-soft/20 border border-danger/20 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-danger-soft text-danger flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-primary">
                No pudimos cargar tus citas
              </h3>
              <p className="text-xs text-text-secondary max-w-sm">
                Ocurrió un problema al sincronizar las reservaciones del negocio. Revisa tu conexión o vuelve a intentar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchCitas()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt text-xs font-medium text-text-primary transition-colors active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-text-secondary" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Estado 3: Empty state with ticket motif (Section 5.6 & 5.8) */}
        {!citasLoading && !citasError && citas.length === 0 && (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="relative mb-4 flex items-center justify-center">
              <svg
                width="120"
                height="72"
                viewBox="0 0 120 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-grape drop-shadow-xs"
              >
                {/* Ticket body with classic punch notches */}
                <path
                  d="M 8 0 H 112 C 116.4 0 120 3.6 120 8 V 26 C 114.5 26 110 30.5 110 36 C 110 41.5 114.5 46 120 46 V 64 C 120 68.4 116.4 72 112 72 H 8 C 3.6 72 0 68.4 0 64 V 46 C 5.5 46 10 41.5 10 36 C 10 30.5 5.5 26 0 26 V 8 C 0 3.6 3.6 0 8 0 Z"
                  fill="var(--surface-alt)"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                {/* Perforated dashed line */}
                <line
                  x1="44"
                  y1="8"
                  x2="44"
                  y2="64"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Ticket stamp on left section */}
                <circle cx="22" cy="36" r="11" fill="var(--grape-soft)" />
                <path
                  d="M 18 36 L 21 39 L 26 33"
                  stroke="var(--grape)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Ticket lines on right section */}
                <rect x="54" y="24" width="50" height="5" rx="2.5" fill="var(--border)" />
                <rect x="54" y="34" width="36" height="5" rx="2.5" fill="var(--grape-soft)" />
                <rect x="54" y="44" width="24" height="4" rx="2" fill="var(--border)" />
              </svg>
            </div>
            <h3 className="font-bricolage font-bold text-lg text-text-primary">
              Aún no tienes citas agendadas
            </h3>
            <p className="mt-1.5 text-xs text-text-secondary max-w-sm">
              Cuando tus clientes reserven citas a través de tu portal público, aparecerán listadas aquí en tiempo real.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={copyBookingUrl}
                disabled={!negocioSlug}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-grape text-white hover:opacity-90 text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}</span>
              </button>
              {negocioSlug && (
                <Link
                  href={`/reserva/${negocioSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-surface hover:bg-surface-alt text-text-primary text-xs font-medium transition-colors"
                >
                  <span>Ver portal público</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Estado 4: Data state (Table & Mobile Cards) */}
        {!citasLoading && !citasError && citas.length > 0 && (
          <>
            {/* Desktop Table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-surface-alt text-text-secondary text-[12px] font-medium tracking-normal uppercase border-b border-border z-10">
                  <tr>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Sede / Sucursal</th>
                    <th className="py-3 px-4">Servicio</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {citas.map((cita) => (
                    <tr
                      key={cita.id}
                      className="h-12 hover:bg-surface-alt/70 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-text-primary">
                          {[cita.cliente_nombre ?? cita.clienteNombre, cita.cliente_apellido]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {cita.cliente_telefono ?? cita.clientePhone ?? "—"}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 text-text-secondary">
                        <span className="inline-flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-text-muted" />
                          <span>{cita.sucursal_id ?? cita.sucursalId ?? "—"}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-text-primary">
                        {cita.servicio_id ?? cita.servicioId ?? "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="inline-flex items-center gap-1.5 text-text-secondary font-mono tabular-nums">
                          <Clock className="w-3 h-3 text-grape" />
                          <span>{cita.fecha}</span>
                          <span className="text-text-muted">·</span>
                          <span className="font-semibold text-grape">
                            {cita.hora_inicio ?? cita.hora ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-text-primary">
                        {cita.precio_total === undefined ? "—" : `$${cita.precio_total} MXN`}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {getStatusBadge(cita.estado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards view (Section 8) */}
            <div className="sm:hidden space-y-3">
              {citas.map((cita) => (
                <div
                  key={cita.id}
                  className="bg-surface border border-border rounded-lg p-3.5 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">
                        {[cita.cliente_nombre ?? cita.clienteNombre, cita.cliente_apellido]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {cita.cliente_telefono ?? cita.clientePhone ?? "—"}
                      </p>
                    </div>
                    <div>{getStatusBadge(cita.estado)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-text-secondary">
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">Servicio</span>
                      <span className="font-medium text-text-primary">
                        {cita.servicio_id ?? cita.servicioId ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">Sede</span>
                      <span className="inline-flex items-center gap-1 text-text-primary">
                        <Store className="w-3 h-3 text-text-muted" />
                        {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">Fecha y Hora</span>
                      <span className="font-mono tabular-nums text-text-primary">
                        {cita.fecha} {cita.hora_inicio ?? cita.hora ?? ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">Total</span>
                      <span className="font-mono tabular-nums font-bold text-text-primary">
                        {cita.precio_total === undefined ? "—" : `$${cita.precio_total} MXN`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
