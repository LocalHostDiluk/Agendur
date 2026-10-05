"use client";


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



import { AgendaEmpty } from "@/components/negocio/AgendaEmpty";
import { AgendaError } from "@/components/negocio/AgendaError";
import { AgendaMonth } from "@/components/negocio/AgendaMonth";
import { AgendaWeek } from "@/components/negocio/AgendaWeek";
import { AgendaCronograma } from "@/components/negocio/AgendaCronograma";
import { AgendaLoading } from "@/components/negocio/AgendaLoading";
import { AgendaDateNavigation } from "@/components/negocio/AgendaDateNavigation";
import { AgendaFilters } from "@/components/negocio/AgendaFilters";
import { AgendaViewTabs } from "@/components/negocio/AgendaViewTabs";
import { AgendaHeader } from "@/components/negocio/AgendaHeader";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";






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
      <AgendaHeader onCreateCita={() => setIsManualModalOpen(true)} />


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
      <AgendaError loadingCitas={loadingCitas} errorCitas={errorCitas} refetchCitas={refetchCitas} />

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 3. ESTADO VACÍO (TICKET RISOGRÁFICO)      */}
      {/* ======================================================================= */}
      <AgendaEmpty loadingCitas={loadingCitas} errorCitas={errorCitas} citas={citas} onCreateCita={() => setIsManualModalOpen(true)} />

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
      <AgendaMonth loadingCitas={loadingCitas} errorCitas={errorCitas} citas={citas} viewMode={viewMode} monthDays={monthDays} citasByDay={citasByDay} todayStr={todayStr} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setViewMode={setViewMode} />

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
