"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  useAuthMe,
  useCitasNegocio,
  useSucursales,
  useServicios,
  useCatalogo,
} from "@/lib/hooks";
import { getTodayString, getMondayOfDate, getSundayOfDate } from "@/lib/utils/agendas-date";
import { AgendasManualButton, AgendasViewTab, AgendasDateNavigation, AgendasCronograma, AgendasSemanal, AgendasMensual, AgendasLoading, AgendasError, AgendasEmpty } from "@/components/negocio";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
import {
  PendingBadge,
} from "@/components/ui";
import type { Cita, EstadoCita } from "@/lib/types";
import { getMonthStart, getMonthEnd, getAgendaQueryFilters, getSortedCitas, getWeekDays, groupCitasByDay } from "@/lib/utils/agendas-data";
import { getMonthDaysGrid } from "@/lib/utils/agendas-month-grid";

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

  const todayStr = useMemo(() => getTodayString(negocioTz), [negocioTz]);

  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);
  const [viewMode, setViewMode] = useState<
    "cronograma" | "semanal" | "mensual"
  >("cronograma");
  const [filterSucursal, setFilterSucursal] = useState<string>("");
  const [filterProfesional, setFilterProfesional] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<EstadoCita | "">("");

  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Consultas de datos de apoyo
  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const { data: catalogoData } = useCatalogo(negocioSlug);

  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];
  const profesionales = catalogoData?.data?.profesionales ?? [];

  // Rango de fechas según la vista activa
  const mondayYMD = useMemo(
    () => getMondayOfDate(selectedDate),
    [selectedDate],
  );
  const sundayYMD = useMemo(
    () => getSundayOfDate(selectedDate),
    [selectedDate],
  );

  const [selYear, selMonth] = useMemo(
    () => selectedDate.split("-").map(Number),
    [selectedDate],
  );

  const startOfMonthYMD = useMemo(() => getMonthStart(selYear, selMonth), [selYear, selMonth]);

  const endOfMonthYMD = useMemo(() => getMonthEnd(selYear, selMonth), [selYear, selMonth]);

  const filtrosQuery = useMemo(() => getAgendaQueryFilters(filterSucursal, filterEstado, viewMode, selectedDate, mondayYMD, sundayYMD, startOfMonthYMD, endOfMonthYMD), [
    filterSucursal,
    filterEstado,
    viewMode,
    selectedDate,
    mondayYMD,
    sundayYMD,
    startOfMonthYMD,
    endOfMonthYMD,
  ]);

  // Consulta de citas en Supabase
  const {
    data: citasData,
    isLoading: loadingCitas,
    isError: errorCitas,
    refetch: refetchCitas,
  } = useCitasNegocio(filtrosQuery);

  // Ordenar citas cronológicamente por hora_inicio y filtrar por profesional si aplica
  const citas = useMemo(() => getSortedCitas(citasData?.citas, filterProfesional), [citasData?.citas, filterProfesional]);

  // Navegación temporal adaptativa


  // 7 días de la semana para la vista semanal
  const weekDays = useMemo(() => getWeekDays(mondayYMD, todayStr, selectedDate), [mondayYMD, todayStr, selectedDate]);

  // Días para la cuadrícula mensual
  const monthDays = useMemo(
    () => getMonthDaysGrid(selectedDate, todayStr),
    [selectedDate, todayStr],
  );

  // Resumen de citas agrupadas por fecha
  const citasByDay = useMemo(() => groupCitasByDay(citas), [citas]);

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

        <AgendasManualButton onClick={() => setIsManualModalOpen(true)} className="gap-2 shrink-0 min-h-[44px]" />
      </div>

      {/* ======================================================================= */}
      {/* Barra de Control: Fecha, Alternador de Vista (3 pestañas) y Filtros     */}
      {/* ======================================================================= */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <AgendasDateNavigation selectedDate={selectedDate} todayStr={todayStr} viewMode={viewMode} mondayYMD={mondayYMD} sundayYMD={sundayYMD} setSelectedDate={setSelectedDate} />

          {/* Alternador Canónico de 3 Vistas (§10) y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            {/* Switcher 3 Pestañas: Día (Cronograma) / Semana / Mes */}
            <div
              role="tablist"
              aria-label="Modo de visualización"
              className="inline-flex items-center p-1 bg-surface-alt rounded-xl border border-border text-xs font-medium"
            >
              <AgendasViewTab selected={viewMode === "cronograma"} onClick={() => setViewMode("cronograma")}>
                <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Día (Cronograma)</span>
              </AgendasViewTab>

              <AgendasViewTab selected={viewMode === "semanal"} onClick={() => setViewMode("semanal")} title="Semanal">
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Semana</span>
              </AgendasViewTab>

              <AgendasViewTab selected={viewMode === "mensual"} onClick={() => setViewMode("mensual")} title="Mensual">
                <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Mes</span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Vista mensual con arrastrar y soltar en desarrollo"
                  className="ml-0.5"
                />
              </AgendasViewTab>
            </div>

            {/* Filtro por Sucursal */}
            {sucursales.length > 1 && (
              <select
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por sucursal"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Filtro por Profesional / Colaborador */}
            <div className="flex items-center gap-1">
              <select
                value={filterProfesional}
                onChange={(e) => setFilterProfesional(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por profesional"
              >
                <option value="">Todos los profesionales</option>
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <PendingBadge
                label="Pendiente"
                tooltip="Filtrado por profesional en desarrollo"
                className="ml-1 shrink-0"
              />
            </div>

            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as EstadoCita | "")
              }
              className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Filtrar por estado de cita"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente_pago">Pendientes de pago</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="no_asistio">No asistió</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 1. LOADING CON SKELETONS RISOGRÁFICOS    */}
      {/* ======================================================================= */}
      {loadingCitas && <AgendasLoading viewMode={viewMode} weekDays={weekDays} />}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 2. ERROR CON BANNER Y REINTENTO          */}
      {/* ======================================================================= */}
      {!loadingCitas && errorCitas && (
        <AgendasError refetchCitas={refetchCitas} />
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 3. ESTADO VACÍO (TICKET RISOGRÁFICO)      */}
      {/* ======================================================================= */}
      {!loadingCitas && !errorCitas && citas.length === 0 && (
        <AgendasEmpty setIsManualModalOpen={setIsManualModalOpen} />
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 1: CRONOGRAMA       */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "cronograma" && (
          <AgendasCronograma citas={citas} servicios={servicios} sucursales={sucursales} profesionales={profesionales} setSelectedCita={setSelectedCita} />
        )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 2: SEMANAL           */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "semanal" && (
          <AgendasSemanal citasCount={citas.length} weekDays={weekDays} citasByDay={citasByDay} servicios={servicios} setSelectedCita={setSelectedCita} />
        )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 3: MENSUAL           */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "mensual" && (
          <AgendasMensual citasCount={citas.length} monthDays={monthDays} citasByDay={citasByDay} todayStr={todayStr} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setViewMode={setViewMode} />
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
