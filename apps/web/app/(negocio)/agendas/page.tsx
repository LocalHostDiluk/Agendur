"use client";

import { useState, useMemo } from "react";
import {
  useAuthMe,
  useCitasNegocio,
  useSucursales,
  useServicios,
  useCatalogo,
} from "@/lib/hooks";
import { getTodayString, getMondayOfDate, getSundayOfDate } from "@/lib/utils/agendas-date";
import { AgendasHeader, AgendasControls, AgendasCronograma, AgendasSemanal, AgendasMensual, AgendasLoading, AgendasError, AgendasEmpty } from "@/components/negocio";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
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
      <AgendasHeader setIsManualModalOpen={setIsManualModalOpen} />

      {/* ======================================================================= */}
      {/* Barra de Control: Fecha, Alternador de Vista (3 pestañas) y Filtros     */}
      {/* ======================================================================= */}
      <AgendasControls selectedDate={selectedDate} todayStr={todayStr} viewMode={viewMode} mondayYMD={mondayYMD} sundayYMD={sundayYMD} setSelectedDate={setSelectedDate} setViewMode={setViewMode} sucursales={sucursales} profesionales={profesionales} filterSucursal={filterSucursal} filterProfesional={filterProfesional} filterEstado={filterEstado} setFilterSucursal={setFilterSucursal} setFilterProfesional={setFilterProfesional} setFilterEstado={setFilterEstado} />

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
