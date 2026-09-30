"use client";

import { DashboardGraficas } from "@/components/negocio/DashboardGraficas";
import { DashboardKpis } from "@/components/negocio/DashboardKpis";

import { DashboardAtajos } from "@/components/negocio/DashboardAtajos";

import { DashboardBanners } from "@/components/negocio/DashboardBanners";

import { DashboardCitas } from "@/components/negocio/DashboardCitas";

import { useState, useMemo, useSyncExternalStore } from "react";
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
        <DashboardAtajos sucursalesCount={sucursalesList.length} />
      )}

      {/* 4 KPI CARDS CON JERARQUÍA CANÓNICA (§5.3 & §7.2) */}
      <DashboardKpis
        isSyncError={isSyncError}
        citasError={citasError}
        citasHoyCount={citasHoy.length}
        citasPendientesCount={citasPendientes.length}
        ingresosMesActual={ingresosMesActual}
        tendenciaIngresos={tendenciaIngresos}
        tasaOcupacion={tasaOcupacion}
        tasaInasistencias={tasaInasistencias}
        totalCanceladas={totalCanceladas}
        inasistenciasElevadas={inasistenciasElevadas}
        citasCount={citas.length}
      />

      {/* GRÁFICAS RECHARTS ESTILIZADAS CON TOKENS DE AGENDUR (§6) */}
      <DashboardGraficas
        rangoCitas={rangoCitas} setRangoCitas={setRangoCitas}
        citasPorDia={citasPorDia} totalCitasMostradas={totalCitasMostradas}
        ingresosPorMes={ingresosPorMes} totalIngresos6Meses={totalIngresos6Meses}
        activeBarIndex={activeBarIndex} setActiveBarIndex={setActiveBarIndex}
        mounted={mounted} isSyncError={isSyncError} citasError={citasError}
        handleRetryAll={handleRetryAll} isRetrying={isRetrying}
      />

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