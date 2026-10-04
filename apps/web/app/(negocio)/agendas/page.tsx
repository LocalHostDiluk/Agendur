"use client";


import {






  AlertCircle,
  RefreshCw,

  Ticket,
} from "lucide-react";
import {
  useAgendaUi,
  useAgendaDerived,
  useAgendaRange,
  useAuthMe,
  useCitasNegocio,
  useSucursales,
  useServicios,
  useCatalogo,
} from "@/lib/hooks";



import { AgendaWeek } from "@/components/negocio/AgendaWeek";
import { AgendaCronograma } from "@/components/negocio/AgendaCronograma";
import { AgendaLoading } from "@/components/negocio/AgendaLoading";
import { AgendaDateNavigation } from "@/components/negocio/AgendaDateNavigation";
import { AgendaFilters } from "@/components/negocio/AgendaFilters";
import { AgendaViewTabs } from "@/components/negocio/AgendaViewTabs";
import { AgendaManualButton } from "@/components/negocio/AgendaManualButton";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
import {
  Button,

  PendingBadge,



} from "@/components/ui";
import { formatDisplayMonth } from "@/lib/utils/agenda-display-date";

import { getEstadoBadgeProps } from "@/lib/utils/agenda-estado";


// ==============================================================================
// Utilidades de Fechas (UTC-safe y limpias)
// ==============================================================================

// ==============================================================================
// Componente Principal
// ==============================================================================

export default function AgendasPage() {
  const { data: auth } = useAuthMe();
  const negocioTz = auth?.negocio?.zona_horaria;
  const negocioSlug = auth?.negocio?.slug;

  const { todayStr, selectedDate, setSelectedDate, viewMode, setViewMode, filterSucursal, setFilterSucursal, filterProfesional, setFilterProfesional, filterEstado, setFilterEstado, selectedCita, setSelectedCita, isManualModalOpen, setIsManualModalOpen, handlePrev, handleNext, handleToday } = useAgendaUi(negocioTz);

  // Consultas de datos de apoyo
  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const { data: catalogoData } = useCatalogo(negocioSlug);

  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];
  const profesionales = catalogoData?.data?.profesionales ?? [];

  const { mondayYMD, sundayYMD, filtrosQuery } = useAgendaRange({ selectedDate, viewMode, filterSucursal, filterEstado });

  // Consulta de citas en Supabase
  const {
    data: citasData,
    isLoading: loadingCitas,
    isError: errorCitas,
    refetch: refetchCitas,
  } = useCitasNegocio(filtrosQuery);

  const { citas, weekDays, monthDays, citasByDay } = useAgendaDerived({ citasData, filterProfesional, mondayYMD, todayStr, selectedDate });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* Encabezado y Acciones Principales (§5.13)                               */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Calendario & Agendas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza y administra las citas programadas por sucursal, fecha y
            horario.
          </p>
        </div>

        <AgendaManualButton onClick={() => setIsManualModalOpen(true)} className="gap-2 shrink-0 min-h-[44px]" />
      </div>

      {/* ======================================================================= */}
      {/* Barra de Control: Fecha, Alternador de Vista (3 pestañas) y Filtros     */}
      {/* ======================================================================= */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <AgendaDateNavigation selectedDate={selectedDate} todayStr={todayStr} mondayYMD={mondayYMD} sundayYMD={sundayYMD} viewMode={viewMode} setSelectedDate={setSelectedDate} handleToday={handleToday} handlePrev={handlePrev} handleNext={handleNext} />

          {/* Alternador Canónico de 3 Vistas (§10) y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            {/* Switcher 3 Pestañas: Día (Cronograma) / Semana / Mes */}
            <AgendaViewTabs viewMode={viewMode} setViewMode={setViewMode} />

            <AgendaFilters sucursales={sucursales} profesionales={profesionales} filterSucursal={filterSucursal} filterProfesional={filterProfesional} filterEstado={filterEstado} setFilterSucursal={setFilterSucursal} setFilterProfesional={setFilterProfesional} setFilterEstado={setFilterEstado} />
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 1. LOADING CON SKELETONS RISOGRÁFICOS    */}
      {/* ======================================================================= */}
      <AgendaLoading loadingCitas={loadingCitas} viewMode={viewMode} weekDays={weekDays} />

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 2. ERROR CON BANNER Y REINTENTO          */}
      {/* ======================================================================= */}
      {!loadingCitas && errorCitas && (
        <div
          role="alert"
          className="p-8 rounded-[var(--radius-lg)] bg-surface border border-danger/30 text-center space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-text-primary font-bricolage">
              No se pudieron consultar las citas
            </h3>
            <p className="text-xs text-text-secondary">
              Ocurrió un error al consultar la agenda del negocio. Intenta
              recargar la información.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => refetchCitas()}
            className="gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reintentar</span>
          </Button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 3. ESTADO VACÍO (TICKET RISOGRÁFICO)      */}
      {/* ======================================================================= */}
      {!loadingCitas && !errorCitas && citas.length === 0 && (
        <div className="p-10 sm:p-12 rounded-[var(--radius-lg)] bg-surface border border-dashed border-border text-center space-y-5 shadow-xs relative overflow-hidden">
          {/* Ilustración ligera de ticket risográfico (§5.6.2) */}
          <div className="relative mx-auto w-24 h-24 bg-surface-alt/70 rounded-2xl border-2 border-dashed border-grape/30 p-2.5 flex flex-col justify-between items-center shadow-xs">
            {/* Muescas semicirculares de ticket de turno */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-r border-dashed border-grape/30" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-l border-dashed border-grape/30" />

            <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center mt-1">
              <Ticket className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="w-full border-t border-dashed border-border my-1" />
            <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">
              AG-TICKET
            </span>
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-bricolage font-bold text-text-primary tracking-tight">
              No hay citas programadas para este período
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Las citas reservadas por clientes o agendadas desde recepción
              aparecerán aquí organizadas por horario.
            </p>
          </div>

          <div className="pt-1">
            <AgendaManualButton onClick={() => setIsManualModalOpen(true)} className="gap-2 min-h-[44px]" />
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 1: CRONOGRAMA       */}
      {/* ======================================================================= */}
      <AgendaCronograma loadingCitas={loadingCitas} errorCitas={errorCitas} citas={citas} viewMode={viewMode} sucursales={sucursales} servicios={servicios} profesionales={profesionales} setSelectedCita={setSelectedCita} />

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 2: SEMANAL           */}
      {/* ======================================================================= */}
      <AgendaWeek loadingCitas={loadingCitas} errorCitas={errorCitas} citas={citas} viewMode={viewMode} weekDays={weekDays} citasByDay={citasByDay} servicios={servicios} setSelectedCita={setSelectedCita} />

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 3: MENSUAL           */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "mensual" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span>
                  {citas.length}{" "}
                  {citas.length === 1 ? "cita en el mes" : "citas en el mes"}
                </span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Vista mensual con arrastrar y soltar en desarrollo"
                />
              </div>
              <span className="font-mono text-text-muted">
                {formatDisplayMonth(selectedDate)}
              </span>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-xs">
              {/* Encabezado de Días de la Semana */}
              <div className="grid grid-cols-7 border-b border-border bg-surface-alt/70 text-center">
                {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(
                  (dName) => (
                    <div
                      key={dName}
                      className="py-2.5 text-[11px] font-mono font-semibold text-text-secondary"
                    >
                      {dName}
                    </div>
                  ),
                )}
              </div>

              {/* Grilla de Días del Mes */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border">
                {monthDays.map((cell) => {
                  const dayCitas = citasByDay[cell.ymd] ?? [];
                  const isToday = cell.ymd === todayStr;
                  const isSelected = cell.ymd === selectedDate;

                  return (
                    <div
                      key={cell.ymd}
                      onClick={() => {
                        setSelectedDate(cell.ymd);
                        setViewMode("cronograma");
                      }}
                      className={`p-2 min-h-[95px] sm:min-h-[110px] flex flex-col justify-between cursor-pointer transition-colors duration-100 ease-out hover:bg-surface-alt/60 group ${
                        !cell.isCurrentMonth
                          ? "bg-surface-alt/20 opacity-40"
                          : isSelected
                            ? "bg-grape-soft/20"
                            : "bg-surface"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-mono font-bold rounded-[var(--radius-sm)] px-1.5 py-0.5 ${
                            isToday
                              ? "bg-grape text-white"
                              : isSelected
                                ? "text-grape font-bold"
                                : "text-text-primary"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {dayCitas.length > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-text-secondary bg-surface-alt px-1.5 py-0.2 rounded-md border border-border">
                            {dayCitas.length}
                          </span>
                        )}
                      </div>

                      {/* Dots de citas / disponibilidad */}
                      <div className="mt-2 space-y-1">
                        {dayCitas.slice(0, 2).map((c) => {
                          const badgeInfo = getEstadoBadgeProps(c.estado);
                          const hora = c.hora_inicio ?? c.hora ?? "";
                          return (
                            <div
                              key={c.id}
                              className="flex items-center gap-1 text-[10px] font-mono truncate px-1 py-0.5 rounded bg-surface-alt/70 border border-border/50 text-text-secondary group-hover:border-grape/30"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  badgeInfo.variant === "success"
                                    ? "bg-success"
                                    : badgeInfo.variant === "warning"
                                      ? "bg-warning"
                                      : badgeInfo.variant === "grape"
                                        ? "bg-grape"
                                        : "bg-danger"
                                }`}
                              />
                              <span className="tabular-nums font-semibold text-text-primary">
                                {hora}
                              </span>
                              <span className="truncate">
                                {c.cliente_nombre ?? c.clienteNombre ?? ""}
                              </span>
                            </div>
                          );
                        })}
                        {dayCitas.length > 2 && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-text-muted px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
                            <span>+{dayCitas.length - 2} más</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* ======================================================================= */}
      {/* Drawer Lateral de Detalle de Cita (§5.10)                               */}
      {/* ======================================================================= */}
      <CitaDetailDrawer
        isOpen={Boolean(selectedCita)}
        onClose={() => setSelectedCita(null)}
        cita={selectedCita}
        sucursales={sucursales}
        servicios={servicios}
        profesionales={profesionales}
        onCitaUpdated={() => refetchCitas()}
      />

      {/* ======================================================================= */}
      {/* Modal de Nueva Cita Manual de Recepción (§5.10)                         */}
      {/* ======================================================================= */}
      <ModalNuevaCitaManual
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialFecha={selectedDate}
        sucursales={sucursales}
        servicios={servicios}
        onSuccess={() => refetchCitas()}
      />
    </div>
  );
}
