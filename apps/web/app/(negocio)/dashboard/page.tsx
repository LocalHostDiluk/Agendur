"use client";

import { DashboardBanners } from "@/components/negocio/DashboardBanners";

import { DashboardCitas } from "@/components/negocio/DashboardCitas";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DashboardChartTooltip } from "@/components/negocio/DashboardChartTooltip";
import {
  Calendar,
  Store,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Users,
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
  Cell
} from "recharts";
import { getDashboardIncomeMetrics, getDashboardOccupancy, getDashboardAbsences } from "@/lib/utils/dashboard-metrics";
import { getBusinessToday } from "@/lib/utils/business-date";
import { getDashboardDailySeries, getDashboardMonthlySeries } from "@/lib/utils/dashboard-series";
import {
  useAuthMe,
  useDashboardActions,
  useCitasNegocio,
  useConfiguracion,
  useSucursales,
  useSuscripcion,
} from "@/lib/hooks";
import { DashboardLoading } from "./loading";
import {
  Button,
  Badge,
  PendingBadge,
} from "@/components/ui";

const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [rangoCitas, setRangoCitas] = useState<"30d" | "mes">("30d");
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const {
    data: auth,
    isLoading: authLoading,
    isError: authError,
    refetch: refetchAuth,
  } = useAuthMe();
  const { data: suscripcionResponse, refetch: refetchSuscripcion } =
    useSuscripcion(Boolean(auth?.access?.capabilities.includes("billing:read")));
  const { data: sucursalesResponse, refetch: refetchSucursales } =
    useSucursales();
  const { data: configResponse, refetch: refetchConfiguracion } =
    useConfiguracion(Boolean(auth?.access?.capabilities.includes("config:read")));
  const {
    data: citasResponse,
    isLoading: citasLoading,
    isError: citasError,
    refetch: refetchCitas,
  } = useCitasNegocio();

  const sucursalesList = useMemo(
    () => sucursalesResponse?.sucursales ?? [],
    [sucursalesResponse?.sucursales],
  );

  const negocio = auth?.negocio;
  const suscripcion =
    suscripcionResponse?.data.suscripcion ?? auth?.suscripcion;
  const citas = useMemo(
    () => citasResponse?.citas ?? [],
    [citasResponse?.citas],
  );
  const hoy = getBusinessToday(negocio?.zona_horaria);
  const citasHoy = hoy ? citas.filter((cita) => cita.fecha === hoy) : [];
  const citasPendientes = citasHoy.filter(
    (cita) => cita.estado === "pendiente_pago",
  );
  const ingresosConfirmados = citas
    .filter((cita) => cita.estado === "confirmada" || cita.estado === "completada")
    .reduce((total, cita) => total + (cita.precio_total ?? 0), 0);
  const negocioSlug = negocio?.slug;
  const nombreNegocioRescatado =
    negocio?.nombre_comercial ??
    configResponse?.configuracion?.nombreNegocio ??
    (sucursalesList[0]?.nombre ? sucursalesList[0].nombre : null);
  const planNombre = suscripcion?.plan_nombre ?? "Estándar";
  const sucursalesUsadas =
    suscripcionResponse?.data.sucursales_usadas ??
    auth?.sucursalesCount ??
    (sucursalesList.length > 0 ? sucursalesList.length : 0);
  const sucursalesLimite =
    suscripcionResponse?.data.sucursales_limite ??
    suscripcion?.limite_sucursales ??
    (sucursalesList.length > 0 ? Math.max(sucursalesList.length, 2) : 2);

  // Métrica canónica 2: Ingresos del Mes & Comparativa vs Mes Anterior
  const { ingresosMesActual, tendenciaIngresos } = useMemo(() => getDashboardIncomeMetrics(citas, ingresosConfirmados), [citas, ingresosConfirmados]);

  // Métrica canónica 3: Tasa de Ocupación estimada
  const tasaOcupacion = useMemo(() => getDashboardOccupancy(citas), [citas]);

  // Métrica canónica 4: Tasa de Inasistencias (No-shows / canceladas)
  const { tasaInasistencias, totalCanceladas, inasistenciasElevadas } = useMemo(() => getDashboardAbsences(citas), [citas]);

  // Chart 1: Serie diaria según rango
  const citasPorDia = useMemo(() => getDashboardDailySeries(citas, rangoCitas), [citas, rangoCitas]);

  // Chart 2: 6 months income series
  const ingresosPorMes = useMemo(() => getDashboardMonthlySeries(citas), [citas]);

  const totalCitasMostradas = useMemo(
    () => citasPorDia.reduce((acc, curr) => acc + curr.citas, 0),
    [citasPorDia],
  );
  const totalIngresos6Meses = useMemo(
    () => ingresosPorMes.reduce((acc, curr) => acc + curr.ingresos, 0),
    [ingresosPorMes],
  );

  const { handleRetryAll, copyBookingUrl } = useDashboardActions({
    negocioSlug,
    setCopied,
    setIsRetrying,
    refetchAuth,
    refetchSucursales,
    refetchSuscripcion,
    refetchConfiguracion,
    refetchCitas,
  });

  if (authLoading) {
    return <DashboardLoading />;
  }

  const isSyncError = Boolean(authError || !auth);
  const isOnboardingRequired =
    !isSyncError && auth?.onboardingStatus === "required";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* TOP BANNER: 3 Estados con personalidad de marca (Ticket Resiliente / Onboarding Ticket / Welcome Activo + Ticket Upgrade) */}
      <DashboardBanners
        isSyncError={isSyncError}
        isOnboardingRequired={isOnboardingRequired}
        sucursalesCount={sucursalesList.length}
        nombreNegocioRescatado={nombreNegocioRescatado}
        nombreUsuario={auth?.perfil?.nombres ?? auth?.user?.email ?? "bienvenido"}
        nombreNegocio={negocio?.nombre_comercial}
        negocioSlug={negocioSlug}
        copyBookingUrl={copyBookingUrl}
        copied={copied}
        suscripcion={suscripcion}
        planNombre={planNombre}
        sucursalesUsadas={sucursalesUsadas}
        sucursalesLimite={sucursalesLimite}
        handleRetryAll={handleRetryAll}
        isRetrying={isRetrying}
      />

      {/* ATAJOS OPERATIVOS RÁPIDOS (Visibles cuando hay error de sincronización o cuenta en configuración) */}
      {(isSyncError || isOnboardingRequired) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/agendas"
            className="group bg-surface hover:bg-surface-alt/60 border border-border hover:border-grape/40 rounded-xl p-4 flex items-start justify-between gap-3 transition-all shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-grape-soft text-grape flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary group-hover:text-grape transition-colors">
                  Ir al Calendario y Agenda
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Revisa disponibilidad por día o registra una cita manual.
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-grape group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </Link>

          <Link
            href="/sucursales"
            className="group bg-surface hover:bg-surface-alt/60 border border-border hover:border-grape/40 rounded-xl p-4 flex items-start justify-between gap-3 transition-all shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-alt text-text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4 text-grape" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary group-hover:text-grape transition-colors">
                  Servicios y Sucursales
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {sucursalesList.length > 0
                    ? `${sucursalesList.length} ${sucursalesList.length === 1 ? "sede activa lista" : "sedes activas listas"} para administrar.`
                    : "Administra tus ubicaciones, horarios y catálogo."}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-grape group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </Link>

          <Link
            href="/personal"
            className="group bg-surface hover:bg-surface-alt/60 border border-border hover:border-grape/40 rounded-xl p-4 flex items-start justify-between gap-3 transition-all shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-alt text-text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-grape" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary group-hover:text-grape transition-colors">
                  Equipo y Personal
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Gestiona profesionales, permisos y turnos semanales.
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-grape group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </Link>
        </div>
      )}

      {/* 4 KPI CARDS CON JERARQUÍA CANÓNICA (§5.3 & §7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 (DESTACADA): Citas para Hoy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="bg-grape-soft/60 border border-grape/30 rounded-xl p-5 shadow-xs space-y-3 transition-colors relative"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[13px] font-medium tracking-normal text-text-secondary">
              Citas para hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-grape/10 text-grape flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-grape" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {citasHoy.length}
            </span>
            {isSyncError || citasError ? (
              <Badge variant="warning" size="sm" dot={true}>
                Sin sincronizar
              </Badge>
            ) : citasPendientes.length > 0 ? (
              <Badge variant="warning" size="sm" dot={true}>
                {citasPendientes.length} pendiente
                {citasPendientes.length === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot={true}>
                Al día
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span className="truncate">
              {isSyncError || citasError
                ? "Revisa o agenda manualmente"
                : `${citasHoy.length} ${citasHoy.length === 1 ? "cita programada" : "citas programadas"}`}
            </span>
            <Link
              href="/agendas"
              className="text-grape font-medium hover:underline inline-flex items-center gap-0.5 shrink-0"
            >
              <span>Ver agenda</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Card 2: Ingresos del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[13px] font-medium tracking-normal text-text-secondary">
              Ingresos del mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-grape" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none truncate">
              ${ingresosMesActual.toLocaleString("es-MX")}
              <span className="text-xs font-normal text-text-muted ml-1">
                MXN
              </span>
            </span>
            <Badge
              variant={tendenciaIngresos.positivo ? "success" : "danger"}
              size="sm"
              dot={true}
            >
              {tendenciaIngresos.texto}
            </Badge>
          </div>
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
        </motion.div>

        {/* Card 3: Tasa de Ocupación */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[13px] font-medium tracking-normal text-text-secondary">
              Tasa de ocupación
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-grape" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {tasaOcupacion}%
            </span>
            <Badge
              variant={tasaOcupacion >= 70 ? "success" : "warning"}
              size="sm"
              dot={true}
            >
              {tasaOcupacion >= 70 ? "Ocupación óptima" : "Moderada"}
            </Badge>
          </div>
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
        </motion.div>

        {/* Card 4: Tasa de Inasistencias (No-shows) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[13px] font-medium tracking-normal text-text-secondary">
              Tasa de inasistencias
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-grape" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {tasaInasistencias}%
            </span>
            <Badge
              variant={inasistenciasElevadas ? "danger" : "neutral"}
              size="sm"
              dot={true}
            >
              {inasistenciasElevadas ? "Atención" : "Bajo control"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Citas canceladas</span>
            <span className="font-mono text-text-secondary">
              {totalCanceladas} de {citas.length || "0"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* GRÁFICAS RECHARTS ESTILIZADAS CON TOKENS DE AGENDUR (§6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Citas por día */}
        <div
          className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs min-w-0 space-y-4"
          role="region"
          aria-label="Citas por día (últimos 30 días)"
          aria-describedby="chart-citas-desc"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bricolage font-semibold text-base text-text-primary">
                  Citas por día
                </h2>
                <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2 py-0.5 rounded-md tabular-nums">
                  {totalCitasMostradas} citas
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {rangoCitas === "30d"
                  ? "Últimos 30 días de actividad"
                  : "Actividad del mes en curso"}
              </p>
            </div>

            {/* Selector de rango de fechas con PendingBadge (§6) */}
            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setRangoCitas("30d")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  rangoCitas === "30d"
                    ? "bg-surface text-text-primary shadow-2xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => setRangoCitas("mes")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  rangoCitas === "mes"
                    ? "bg-surface text-text-primary shadow-2xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Este mes
              </button>
              <div className="inline-flex items-center gap-1 px-2 py-1 text-text-muted cursor-not-allowed">
                <span>Personalizado</span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Filtro de fecha personalizado en desarrollo"
                />
              </div>
            </div>
          </div>
          <p id="chart-citas-desc" className="sr-only">
            Gráfica de línea mostrando la cantidad de citas registradas por día
            en los últimos 30 días.
          </p>

          <div className="relative h-[260px] w-full">
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
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}

            {/* Tarjeta flotante traslúcida cuando no hay datos sincronizados */}
            {(isSyncError || citasError || totalCitasMostradas === 0) && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto backdrop-blur-[2px] bg-surface/92 border border-border rounded-xl px-4 py-3 shadow-xs max-w-xs text-center space-y-2">
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfica 2: Ingresos por mes */}
        <div
          className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs min-w-0 space-y-4"
          role="region"
          aria-label="Ingresos por mes (últimos 6 meses)"
          aria-describedby="chart-ingresos-desc"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bricolage font-semibold text-base text-text-primary">
                  Ingresos por mes
                </h2>
                <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2 py-0.5 rounded-md tabular-nums">
                  ${totalIngresos6Meses.toLocaleString("es-MX")} MXN
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Últimos 6 meses confirmados
              </p>
            </div>

            {/* Botón Exportar reporte con PendingBadge (§6) */}
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
          </div>
          <p id="chart-ingresos-desc" className="sr-only">
            Gráfica de barras mostrando el total de ingresos por mes en pesos
            mexicanos durante los últimos 6 meses.
          </p>

          <div className="relative h-[260px] w-full">
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
            ) : (
              <div className="h-full w-full bg-surface-alt/40 rounded-lg animate-pulse" />
            )}

            {/* Tarjeta flotante traslúcida cuando no hay ingresos sincronizados */}
            {(isSyncError || citasError || totalIngresos6Meses === 0) && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto backdrop-blur-[2px] bg-surface/92 border border-border rounded-xl px-4 py-3 shadow-xs max-w-xs text-center space-y-2">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE PRÓXIMAS CITAS / CITAS RECIENTES (§5.5) */}
      <DashboardCitas
        citasLoading={citasLoading}
        citasError={citasError}
        citas={citas}
        handleRetryAll={handleRetryAll}
        isRetrying={isRetrying}
        copyBookingUrl={copyBookingUrl}
        negocioSlug={negocioSlug}
        copied={copied}
      />
    </div>
  );
}