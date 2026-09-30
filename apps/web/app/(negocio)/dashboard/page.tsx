"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  DashboardBanners, DashboardAtajos, DashboardKpis, DashboardGraficas, DashboardCitas,
} from "@/components/negocio";
import {
  useAuthMe, useSuscripcion, useSucursales, useConfiguracion, useCitasNegocio, useDashboardActions,
} from "@/lib/hooks";
import { getDashboardIncomeMetrics, getDashboardOccupancy, getDashboardAbsences } from "@/lib/utils/dashboard-metrics";
import { getDashboardDailySeries, getDashboardMonthlySeries } from "@/lib/utils/dashboard-series";
import { getDashboardBannerDetails, getDashboardCurrentAppointments } from "@/lib/utils/dashboard-details";
import { getBusinessToday } from "@/lib/utils/business-date";
import { DashboardLoading } from "./loading";

const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [rangoCitas, setRangoCitas] = useState<"30d" | "mes">("30d");
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { data: auth, isLoading: authLoading, isError: authError, refetch: refetchAuth } = useAuthMe();
  const { data: suscripcionResponse, refetch: refetchSuscripcion } =
    useSuscripcion(Boolean(auth?.access?.capabilities.includes("billing:read")));
  const { data: sucursalesResponse, refetch: refetchSucursales } = useSucursales();
  const { data: configResponse, refetch: refetchConfiguracion } =
    useConfiguracion(Boolean(auth?.access?.capabilities.includes("config:read")));
  const { data: citasResponse, isLoading: citasLoading, isError: citasError, refetch: refetchCitas } = useCitasNegocio();

  const sucursalesList = useMemo(() => sucursalesResponse?.sucursales ?? [], [sucursalesResponse?.sucursales]);
  const negocio = auth?.negocio;
  const suscripcion = suscripcionResponse?.data.suscripcion ?? auth?.suscripcion;
  const citas = useMemo(() => citasResponse?.citas ?? [], [citasResponse?.citas]);
  const hoy = getBusinessToday(negocio?.zona_horaria);
  const { citasHoy, citasPendientes, ingresosConfirmados } = getDashboardCurrentAppointments(citas, hoy);
  const negocioSlug = negocio?.slug;
  const bannerDetails = getDashboardBannerDetails({
    auth, suscripcion, sucursalesList,
    configNombre: configResponse?.configuracion?.nombreNegocio,
    sucursalesUsadas: suscripcionResponse?.data.sucursales_usadas,
    sucursalesLimite: suscripcionResponse?.data.sucursales_limite,
  });
  const { ingresosMesActual, tendenciaIngresos } = useMemo(
    () => getDashboardIncomeMetrics(citas, ingresosConfirmados), [citas, ingresosConfirmados],
  );
  const tasaOcupacion = useMemo(() => getDashboardOccupancy(citas), [citas]);
  const { tasaInasistencias, totalCanceladas, inasistenciasElevadas } = useMemo(
    () => getDashboardAbsences(citas), [citas],
  );
  const citasPorDia = useMemo(() => getDashboardDailySeries(citas, rangoCitas), [citas, rangoCitas]);
  const ingresosPorMes = useMemo(() => getDashboardMonthlySeries(citas), [citas]);
  const totalCitasMostradas = useMemo(() => citasPorDia.reduce((acc, curr) => acc + curr.citas, 0), [citasPorDia]);
  const totalIngresos6Meses = useMemo(() => ingresosPorMes.reduce((acc, curr) => acc + curr.ingresos, 0), [ingresosPorMes]);
  const { handleRetryAll, copyBookingUrl } = useDashboardActions({
    negocioSlug, setCopied, setIsRetrying,
    refetchAuth, refetchSucursales, refetchSuscripcion, refetchConfiguracion, refetchCitas,
  });

  if (authLoading) return <DashboardLoading />;
  const isSyncError = Boolean(authError || !auth);
  const isOnboardingRequired = !isSyncError && auth?.onboardingStatus === "required";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardBanners
        {...bannerDetails} isSyncError={isSyncError} isOnboardingRequired={isOnboardingRequired}
        negocioSlug={negocioSlug} copied={copied} copyBookingUrl={copyBookingUrl}
        handleRetryAll={handleRetryAll} isRetrying={isRetrying}
      />
      {(isSyncError || isOnboardingRequired) && (
        <DashboardAtajos sucursalesCount={sucursalesList.length} />
      )}
      <DashboardKpis
        isSyncError={isSyncError} citasError={citasError} citasCount={citas.length}
        citasHoyCount={citasHoy.length} citasPendientesCount={citasPendientes.length}
        ingresosMesActual={ingresosMesActual} tendenciaIngresos={tendenciaIngresos}
        tasaOcupacion={tasaOcupacion} tasaInasistencias={tasaInasistencias}
        totalCanceladas={totalCanceladas} inasistenciasElevadas={inasistenciasElevadas}
      />
      <DashboardGraficas
        rangoCitas={rangoCitas} setRangoCitas={setRangoCitas}
        citasPorDia={citasPorDia} totalCitasMostradas={totalCitasMostradas}
        ingresosPorMes={ingresosPorMes} totalIngresos6Meses={totalIngresos6Meses}
        activeBarIndex={activeBarIndex} setActiveBarIndex={setActiveBarIndex}
        mounted={mounted} isSyncError={isSyncError} citasError={citasError}
        handleRetryAll={handleRetryAll} isRetrying={isRetrying}
      />
      <DashboardCitas
        citasLoading={citasLoading} citasError={citasError} citas={citas}
        handleRetryAll={handleRetryAll} isRetrying={isRetrying}
        copyBookingUrl={copyBookingUrl} negocioSlug={negocioSlug} copied={copied}
      />
    </div>
  );
}