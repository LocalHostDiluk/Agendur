"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DashboardChartTooltip } from "@/components/negocio/DashboardChartTooltip";
import { DashboardStatusBadge } from "@/components/negocio/DashboardStatusBadge";
import { DashboardClienteAvatar } from "@/components/negocio/DashboardClienteAvatar";
import {
  Calendar,
  Store,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Users,
  LogIn,
  Sparkles,
  CheckCircle2,
  CircleDot,
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
import { getDashboardAppointmentLabels } from "@/lib/utils/dashboard-appointment";
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
import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";
import {
  Button,
  Badge,
  PendingBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
      {isSyncError ? (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-surface border border-border rounded-2xl shadow-xs"
        >
          {/* Barra superior de acento semántico */}
          <div className="h-1 w-full bg-gradient-to-r from-danger via-warning to-grape" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Cuerpo izquierdo del Ticket */}
            <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="danger" size="sm" dot={true}>
                    No pudimos cargar tu negocio.
                  </Badge>
                  {sucursalesList.length > 0 && (
                    <Badge variant="grape" size="sm" dot={false}>
                      <Store className="w-3.5 h-3.5 mr-1" />
                      {sucursalesList.length}{" "}
                      {sucursalesList.length === 1
                        ? "sede detectada"
                        : "sedes detectadas"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-bricolage font-bold text-2xl sm:text-[28px] text-text-primary tracking-tight leading-tight">
                    {nombreNegocioRescatado
                      ? `Hola, ${nombreNegocioRescatado}`
                      : "Panel en modo de recuperación"}
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                    Recarga la página o vuelve a iniciar sesión para sincronizar
                    tu perfil completo. Mientras se restablece la conexión, tu
                    estructura operativa y accesos directos siguen disponibles
                    abajo.
                  </p>
                </div>
              </div>

              {/* Chips de diagnóstico vivo */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
                  <CircleDot className="w-3.5 h-3.5 text-warning" />
                  Sesión de negocio: Pendiente de respuesta
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  Sedes en caché:{" "}
                  <strong className="font-mono text-text-primary">
                    {sucursalesList.length}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-grape" />
                  Navegación local activa
                </span>
              </div>
            </div>

            {/* Talón derecho del Ticket con perforación y sello circular */}
            <div className="lg:col-span-4 relative border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-7 flex flex-col justify-between gap-4">
              {/* Muescas semicirculares del corte de ticket (Desktop) */}
              <span
                aria-hidden="true"
                className="hidden lg:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
              />
              <span
                aria-hidden="true"
                className="hidden lg:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
              />

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted block">
                    TICKET DE ESTADO
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    Acciones de conexión
                  </span>
                </div>

                {/* Sello circular oficial (Design System §0.B Técnica 3) */}
                <div
                  aria-hidden="true"
                  className="sello text-danger/80 border-danger/40 shrink-0 select-none"
                  style={{ width: "70px", height: "70px", fontSize: "9px" }}
                >
                  <span>
                    SYNC
                    <br />
                    RETRY
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRetryAll}
                  isLoading={isRetrying}
                  className="w-full cursor-pointer text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {isRetrying
                      ? "Sincronizando datos…"
                      : "Reintentar conexión ahora"}
                  </span>
                </Button>

                <Link href="/login" className="w-full">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full text-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Volver a iniciar sesión</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ) : isOnboardingRequired ? (
        /* ONBOARDING BANNER: Motivo Ticket + Sello Circular de Progreso (Design System §5.6 #1) */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs"
        >
          <div className="h-1 w-full bg-gradient-to-r from-grape via-flame to-mint" />
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Configuración inicial del negocio</span>
              </div>
              <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                Hola,{" "}
                {auth?.perfil?.nombres ?? auth?.user?.email ?? "bienvenido"}
              </h1>
              <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
                Tu negocio aún no tiene una primera sucursal. Completa tus datos
                y registra una ubicación real antes de publicar tu portal de
                reservas.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-soft text-success text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  1. Cuenta creada
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-grape-soft text-grape border border-grape/30 text-xs font-semibold">
                  2. Registrar primera sucursal
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
                  3. Recibir reservas
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 relative border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-8 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted block">
                    PROGRESO
                  </span>
                  <p className="text-sm font-medium text-text-primary mt-0.5">
                    0 sedes registradas
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="sello text-grape border-grape/40 shrink-0"
                  style={{ width: "72px", height: "72px", fontSize: "10px" }}
                >
                  <span>
                    1 / 3
                    <br />
                    PASOS
                  </span>
                </div>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  <span>Registrar primera sucursal</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* WELCOME BANNER ACTIVO + TARJETA DE PLAN Y UPGRADE CON MUESCA DE TICKET (§5.6.4) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Welcome Card (8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <Badge variant="success" size="sm" dot={true}>
                  Portal en línea activo
                </Badge>
                {sucursalesList.length > 0 && (
                  <span className="text-xs text-text-secondary font-medium">
                    {sucursalesList.length}{" "}
                    {sucursalesList.length === 1
                      ? "sede operativa"
                      : "sedes operativas"}
                  </span>
                )}
              </div>
              <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                Hola, {negocio?.nombre_comercial ?? "—"}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                Tu portal de reservas está activo y listo para recibir clientes en
                línea en tus sedes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={copyBookingUrl}
                disabled={!negocioSlug}
                className="cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-text-secondary" />
                )}
                <span>
                  {copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}
                </span>
              </Button>

              <Link
                href={negocioSlug ? `/reserva/${negocioSlug}` : "/"}
                target="_blank"
              >
                <Button variant="primary" size="sm">
                  <span>Ver portal público</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tarjeta de Plan y Upgrade con Muesca de Ticket (§5.6.4) (4 cols) */}
          <div className="lg:col-span-4 relative bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
            {/* Muesca semicircular autorizada en esquina superior derecha (§5.6.4 - radio 12px) */}
            <span
              aria-hidden="true"
              className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border z-10 select-none pointer-events-none"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 pr-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  SUSCRIPCIÓN AGENDUR
                </span>
                <Badge
                  variant={
                    suscripcion?.estado === "active" ||
                    suscripcion?.estado === "trialing"
                      ? "success"
                      : "neutral"
                  }
                  size="sm"
                  dot={true}
                >
                  {suscripcion?.estado ?? "Activo"}
                </Badge>
              </div>

              <div>
                <h2 className="font-bricolage font-bold text-xl text-text-primary capitalize">
                  Plan {planNombre}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Facturación {suscripcion?.intervalo ?? "mensual"}
                </p>
              </div>

              {/* Capacidad de sedes */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Sedes habilitadas</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {sucursalesUsadas} / {sucursalesLimite}
                  </span>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-grape h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          (sucursalesUsadas / Math.max(sucursalesLimite, 1)) *
                            100,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Link href="/pagos" className="block w-full">
                <Button variant="primary" size="sm" className="w-full">
                  <span>Mejorar plan o gestionar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
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
            <Link href="/agendas">
              <Button
                variant="secondary"
                size="sm"
                className="inline-flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-grape" />
                <span>Ver agenda completa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
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
                  <th className="py-3 px-4">Folio</th>
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
                  <tr key={i} className="h-12">
                    <td className="py-3 px-4">
                      <SkeletonText className="h-3 w-16" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
                        <div className="space-y-1.5 w-full">
                          <SkeletonText
                            className="h-3.5"
                            style={{ width: "70%" }}
                          />
                          <SkeletonText
                            className="h-2.5"
                            style={{ width: "40%" }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <SkeletonText className="h-3" style={{ width: "50%" }} />
                    </td>
                    <td className="py-3 px-4">
                      <SkeletonText className="h-3" style={{ width: "70%" }} />
                    </td>
                    <td className="py-3 px-4">
                      <SkeletonText className="h-3" style={{ width: "40%" }} />
                    </td>
                    <td className="py-3 px-4">
                      <SkeletonText className="h-3" style={{ width: "30%" }} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SkeletonBlock className="h-5 w-20 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Estado 2: Error state with Ticket Motif & retry */}
        {!citasLoading && citasError && (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-surface-alt/35 border border-dashed border-border rounded-xl space-y-4">
            <div className="relative flex items-center justify-center">
              <svg
                width="120"
                height="72"
                viewBox="0 0 120 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xs"
              >
                <path
                  d="M 8 0 H 112 C 116.4 0 120 3.6 120 8 V 26 C 114.5 26 110 30.5 110 36 C 110 41.5 114.5 46 120 46 V 64 C 120 68.4 116.4 72 112 72 H 8 C 3.6 72 0 68.4 0 64 V 46 C 5.5 46 10 41.5 10 36 C 10 30.5 5.5 26 0 26 V 8 C 0 3.6 3.6 0 8 0 Z"
                  fill="var(--surface)"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                <line
                  x1="44"
                  y1="8"
                  x2="44"
                  y2="64"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx="22" cy="36" r="11" fill="var(--warning-soft)" />
                <path
                  d="M 22 31 V 37 M 22 41 H 22.01"
                  stroke="var(--warning)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <rect
                  x="54"
                  y="24"
                  width="50"
                  height="5"
                  rx="2.5"
                  fill="var(--border)"
                />
                <rect
                  x="54"
                  y="34"
                  width="36"
                  height="5"
                  rx="2.5"
                  fill="var(--grape-soft)"
                />
                <rect
                  x="54"
                  y="44"
                  width="24"
                  height="4"
                  rx="2"
                  fill="var(--border)"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-bricolage font-bold text-base text-text-primary">
                No pudimos sincronizar tus citas recientes
              </h3>
              <p className="text-xs text-text-secondary max-w-md">
                Ocurrió un inconveniente al consultar las reservaciones en
                tiempo real. Puedes reintentar ahora o abrir directamente el
                módulo de Calendario.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRetryAll}
                isLoading={isRetrying}
                className="cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar sincronización</span>
              </Button>
              <Link href="/agendas">
                <Button variant="secondary" size="sm">
                  <Calendar className="w-3.5 h-3.5 text-grape" />
                  <span>Abrir Calendario</span>
                </Button>
              </Link>
            </div>
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
                <rect
                  x="54"
                  y="24"
                  width="50"
                  height="5"
                  rx="2.5"
                  fill="var(--border)"
                />
                <rect
                  x="54"
                  y="34"
                  width="36"
                  height="5"
                  rx="2.5"
                  fill="var(--grape-soft)"
                />
                <rect
                  x="54"
                  y="44"
                  width="24"
                  height="4"
                  rx="2"
                  fill="var(--border)"
                />
              </svg>
            </div>
            <h3 className="font-bricolage font-bold text-lg text-text-primary">
              Aún no tienes citas agendadas
            </h3>
            <p className="mt-1.5 text-xs text-text-secondary max-w-sm">
              Cuando tus clientes reserven citas a través de tu portal público,
              aparecerán listadas aquí en tiempo real.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={copyBookingUrl}
                disabled={!negocioSlug}
                className="cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}
                </span>
              </Button>
              {negocioSlug && (
                <Link href={`/reserva/${negocioSlug}`} target="_blank">
                  <Button variant="secondary" size="sm">
                    <span>Ver portal público</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Estado 4: Data state (Table & Mobile Cards) */}
        {!citasLoading && !citasError && citas.length > 0 && (
          <>
            {/* Desktop Table view */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Sede / Sucursal</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citas.map((cita) => {
                    const { clienteNombre, folio } = getDashboardAppointmentLabels(cita);

                    return (
                      <TableRow key={cita.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-text-secondary font-medium tabular-nums">
                            {folio}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <DashboardClienteAvatar clienteNombre={clienteNombre} />
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate">
                                {clienteNombre}
                              </p>
                              <p className="text-[11px] text-text-muted truncate">
                                {cita.cliente_telefono ??
                                  cita.clientePhone ??
                                  "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-text-secondary text-xs">
                            <Store className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span className="truncate">
                              {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-text-primary text-xs">
                            {cita.servicio_id ?? cita.servicioId ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-text-secondary font-mono text-xs tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-grape shrink-0" />
                            <span>{cita.fecha}</span>
                            <span className="text-text-muted">·</span>
                            <span className="font-semibold text-grape">
                              {cita.hora_inicio ?? cita.hora ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono tabular-nums font-bold text-text-primary text-xs">
                            {cita.precio_total === undefined
                              ? "—"
                              : `$${Number(cita.precio_total).toLocaleString("es-MX")} MXN`}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DashboardStatusBadge estado={cita.estado} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards view (Section 8) */}
            <div className="sm:hidden space-y-3">
              {citas.map((cita) => {
                const { clienteNombre, folio } = getDashboardAppointmentLabels(cita);

                return (
                  <div
                    key={cita.id}
                    className="bg-surface border border-border rounded-lg p-3.5 space-y-2.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <DashboardClienteAvatar clienteNombre={clienteNombre} />
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary text-sm truncate">
                            {clienteNombre}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted">
                            <span className="font-mono text-text-secondary">
                              {folio}
                            </span>
                            <span>·</span>
                            <span>
                              {cita.cliente_telefono ??
                                cita.clientePhone ??
                                "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0"><DashboardStatusBadge estado={cita.estado} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-text-secondary">
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          Servicio
                        </span>
                        <span className="font-medium text-text-primary truncate block">
                          {cita.servicio_id ?? cita.servicioId ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          Sede
                        </span>
                        <span className="inline-flex items-center gap-1 text-text-primary truncate">
                          <Store className="w-3 h-3 text-text-muted shrink-0" />
                          <span className="truncate">
                            {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          Fecha y Hora
                        </span>
                        <span className="font-mono tabular-nums text-text-primary">
                          {cita.fecha} {cita.hora_inicio ?? cita.hora ?? ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          Total
                        </span>
                        <span className="font-mono tabular-nums font-bold text-text-primary">
                          {cita.precio_total === undefined
                            ? "—"
                            : `$${Number(cita.precio_total).toLocaleString("es-MX")} MXN`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}