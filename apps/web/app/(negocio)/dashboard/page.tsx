"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
  Cell,
} from "recharts";
import { notify } from "@/lib/utils/toast";
import { getBusinessToday } from "@/lib/utils/business-date";
import {
  useAuthMe,
  useCitasNegocio,
  useConfiguracion,
  useSucursales,
  useSuscripcion,
} from "@/lib/hooks";
import { DashboardLoading } from "./loading";
import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
  unit?: string;
}

function CustomChartTooltip({
  active,
  payload,
  label,
  unit,
}: ChartTooltipProps) {
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
  const [isRetrying, setIsRetrying] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

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
    .filter((cita) => cita.estado === "confirmada")
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
      const label = d.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      });
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
        .filter(
          (c) =>
            c.fecha?.startsWith(prefix) &&
            (c.estado === "confirmada" || c.estado === "completada"),
        )
        .reduce((sum, c) => sum + (c.precio_total ?? 0), 0);
      series.push({
        month: prefix,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        ingresos: total,
      });
    }
    return series;
  }, [citas]);

  const totalCitas30Dias = useMemo(
    () => citasPorDia.reduce((acc, curr) => acc + curr.citas, 0),
    [citasPorDia],
  );
  const totalIngresos6Meses = useMemo(
    () => ingresosPorMes.reduce((acc, curr) => acc + curr.ingresos, 0),
    [ingresosPorMes],
  );

  if (authLoading) {
    return <DashboardLoading />;
  }

  const isSyncError = Boolean(authError || !auth);
  const isOnboardingRequired =
    !isSyncError && auth?.onboardingStatus === "required";

  const handleRetryAll = async () => {
    setIsRetrying(true);
    try {
      await Promise.allSettled([
        refetchAuth(),
        refetchSucursales(),
        refetchSuscripcion(),
        refetchConfiguracion(),
        refetchCitas(),
      ]);
    } finally {
      setTimeout(() => setIsRetrying(false), 350);
    }
  };

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
      {/* TOP BANNER: 3 Estados con personalidad de marca (Ticket Resiliente / Onboarding Ticket / Welcome Activo) */}
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-soft text-danger border border-danger/20 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    No pudimos cargar tu negocio.
                  </span>
                  {sucursalesList.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
                      <Store className="w-3.5 h-3.5" />
                      {sucursalesList.length}{" "}
                      {sucursalesList.length === 1
                        ? "sede detectada"
                        : "sedes detectadas"}
                    </span>
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
                <button
                  type="button"
                  onClick={handleRetryAll}
                  disabled={isRetrying}
                  className="inline-flex items-center justify-center gap-2 px-4 h-[40px] rounded-md bg-grape text-white hover:opacity-95 text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  <span>
                    {isRetrying
                      ? "Sincronizando datos…"
                      : "Reintentar conexión ahora"}
                  </span>
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-4 h-[40px] rounded-md border border-border bg-surface hover:bg-surface-alt text-text-primary text-xs font-medium transition-colors active:scale-[0.98]"
                >
                  <LogIn className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Volver a iniciar sesión</span>
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

              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-grape px-4 h-[40px] text-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                <span>Registrar primera sucursal</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* WELCOME BANNER ACTIVO */
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
              Tu portal de reservas está activo y listo para recibir clientes en
              línea en tus sedes.
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

      {/* 4 KPI Cards with strict hierarchy & staggered animation (§5.3 & §7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 (DESTACADA): Citas para Hoy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="bg-grape-soft/50 border border-grape/30 rounded-xl p-5 shadow-sm space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium tracking-normal">
              Citas para Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-grape/10 text-grape flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none">
              {citasHoy.length}
            </span>
            {isSyncError || citasError ? (
              <button
                type="button"
                onClick={handleRetryAll}
                className="bg-warning-soft text-warning border border-warning/25 text-[11px] rounded-md px-2 py-0.5 font-medium inline-flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                <span>Sin sincronizar</span>
              </button>
            ) : (
              <span className="bg-warning-soft text-warning border border-warning/20 text-[11px] rounded-md px-2 py-0.5 font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                {citasPendientes.length} pendiente
                {citasPendientes.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">
              {isSyncError || citasError
                ? "Revisa o agenda manualmente"
                : "Todas tus sucursales activas"}
            </span>
            {isSyncError || citasError ? (
              <Link
                href="/agendas"
                className="text-grape font-medium hover:underline inline-flex items-center gap-0.5"
              >
                <span>Abrir Agenda</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-success font-medium inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-success" />
                Activas hoy
              </span>
            )}
          </div>
        </motion.div>

        {/* Card 2: Sedes Habilitadas */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium tracking-normal">
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
          <p className="text-[11px] text-text-secondary truncate">
            {sucursalesList[0]?.nombre
              ? `Sede activa: ${sucursalesList[0].nombre}`
              : `Capacidad de tu plan: ${sucursalesLimite} sedes`}
          </p>
        </motion.div>

        {/* Card 3: Suscripción SaaS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium tracking-normal">
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
                suscripcion?.estado === "active" ||
                suscripcion?.estado === "trialing"
                  ? "bg-success-soft text-success border border-success/20 text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1"
                  : isSyncError
                    ? "bg-warning-soft text-warning border border-warning/20 text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1"
                    : "bg-surface-alt text-text-secondary border border-border text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  suscripcion?.estado === "active" ||
                  suscripcion?.estado === "trialing"
                    ? "bg-success"
                    : isSyncError
                      ? "bg-warning"
                      : "bg-text-muted"
                }`}
              />
              {suscripcion?.estado ?? (isSyncError ? "en caché" : "activo")}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">
              Facturación {suscripcion?.intervalo ?? "mensual"}
            </span>
            <Link
              href="/pagos"
              className="text-grape font-medium hover:underline inline-flex items-center gap-0.5"
            >
              <span>Ver plan</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Card 4: Servicios Agendados / Ingresos */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium tracking-normal">
              Servicios Agendados / Ingresos
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[28px] font-bold tabular-nums text-text-primary leading-none">
              {`$${ingresosConfirmados.toLocaleString("es-MX")}`}
              <span className="text-xs font-normal text-text-muted ml-1">
                MXN
              </span>
            </span>
            <span className="bg-success-soft text-success border border-success/20 text-[11px] font-medium rounded-md px-2 py-0.5 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Confirmadas
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">
              Valor total de citas confirmadas
            </span>
            <Link
              href="/reportes"
              className="text-grape font-medium hover:underline inline-flex items-center gap-0.5"
            >
              <span>Reportes</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
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
              <p className="text-xs text-text-secondary">
                Últimos 30 días de actividad
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2.5 py-1 rounded-md">
              {totalCitas30Dias} citas
            </span>
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

            {/* Tarjeta flotante traslúcida cuando no hay datos sincronizados */}
            {(isSyncError || citasError || totalCitas30Dias === 0) && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto backdrop-blur-[2px] bg-surface/92 border border-border rounded-xl px-4 py-3 shadow-xs max-w-xs text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-grape-soft text-grape text-[11px] font-mono font-medium">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isSyncError || citasError
                        ? "SINCRONIZACIÓN EN PAUSA"
                        : "SIN CITAS EN 30 DÍAS"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">
                    {isSyncError || citasError
                      ? "Restablece la conexión para graficar el volumen diario de reservaciones."
                      : "Las reservaciones confirmadas se graficarán automáticamente aquí."}
                  </p>
                  <div className="pt-0.5 flex items-center justify-center gap-2">
                    {isSyncError || citasError ? (
                      <button
                        type="button"
                        onClick={handleRetryAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-grape text-white text-[11px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
                        />
                        <span>Actualizar serie</span>
                      </button>
                    ) : (
                      <Link
                        href="/agendas"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-grape hover:underline"
                      >
                        <span>Agendar en Calendario</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
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
              <p className="text-xs text-text-secondary">
                Últimos 6 meses confirmados
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2.5 py-1 rounded-md">
              ${totalIngresos6Meses.toLocaleString("es-MX")} MXN
            </span>
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
                    <Link
                      href="/pagos"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-grape hover:underline"
                    >
                      <span>Ver Pagos y Facturación</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
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
                  <tr key={i} className="h-12">
                    <td className="py-3 px-4">
                      <div className="space-y-1.5">
                        <SkeletonText
                          className="h-3.5"
                          style={{ width: "70%" }}
                        />
                        <SkeletonText
                          className="h-2.5"
                          style={{ width: "40%" }}
                        />
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
              <button
                type="button"
                onClick={handleRetryAll}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-4 h-[36px] rounded-md bg-grape text-white hover:opacity-90 text-xs font-medium transition-all active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`}
                />
                <span>Reintentar sincronización</span>
              </button>
              <Link
                href="/agendas"
                className="inline-flex items-center gap-1.5 px-3.5 h-[36px] rounded-md border border-border bg-surface hover:bg-surface-alt text-xs font-medium text-text-primary transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-grape" />
                <span>Abrir Calendario</span>
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
              <button
                type="button"
                onClick={copyBookingUrl}
                disabled={!negocioSlug}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-grape text-white hover:opacity-90 text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}
                </span>
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
                          {[
                            cita.cliente_nombre ?? cita.clienteNombre,
                            cita.cliente_apellido,
                          ]
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
                          <span>
                            {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                          </span>
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
                        {cita.precio_total === undefined
                          ? "—"
                          : `$${cita.precio_total} MXN`}
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
                        {[
                          cita.cliente_nombre ?? cita.clienteNombre,
                          cita.cliente_apellido,
                        ]
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
                      <span className="text-[10px] uppercase text-text-muted block">
                        Servicio
                      </span>
                      <span className="font-medium text-text-primary">
                        {cita.servicio_id ?? cita.servicioId ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">
                        Sede
                      </span>
                      <span className="inline-flex items-center gap-1 text-text-primary">
                        <Store className="w-3 h-3 text-text-muted" />
                        {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">
                        Fecha y Hora
                      </span>
                      <span className="font-mono tabular-nums text-text-primary">
                        {cita.fecha} {cita.hora_inicio ?? cita.hora ?? ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block">
                        Total
                      </span>
                      <span className="font-mono tabular-nums font-bold text-text-primary">
                        {cita.precio_total === undefined
                          ? "—"
                          : `$${cita.precio_total} MXN`}
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
