"use client";

import {
  useAuthMe, useSucursales, useServicios, useCatalogo, useCitasNegocio,
  useAgendaUi, useAgendaRange, useAgendaDerived,
} from "@/lib/hooks";
import { AgendaHeader } from "@/components/negocio/AgendaHeader";
import { AgendaControls } from "@/components/negocio/AgendaControls";
import { AgendaViews } from "@/components/negocio/AgendaViews";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";

export default function AgendasPage() {
  const { data: auth } = useAuthMe();
  const ui = useAgendaUi(auth?.negocio?.zona_horaria);
  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const { data: catalogoData } = useCatalogo(auth?.negocio?.slug);
  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];
  const profesionales = catalogoData?.data?.profesionales ?? [];
  const range = useAgendaRange({
    selectedDate: ui.selectedDate, viewMode: ui.viewMode,
    filterSucursal: ui.filterSucursal, filterEstado: ui.filterEstado,
  });
  const {
    data: citasData,
    isLoading: loadingCitas,
    isError: errorCitas,
    refetch: refetchCitas,
  } = useCitasNegocio(range.filtrosQuery);
  const derived = useAgendaDerived({
    citasData, filterProfesional: ui.filterProfesional,
    mondayYMD: range.mondayYMD, todayStr: ui.todayStr, selectedDate: ui.selectedDate,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AgendaHeader onCreateCita={() => ui.setIsManualModalOpen(true)} />
      <AgendaControls
        selectedDate={ui.selectedDate}
        todayStr={ui.todayStr}
        mondayYMD={range.mondayYMD}
        sundayYMD={range.sundayYMD}
        viewMode={ui.viewMode}
        setSelectedDate={ui.setSelectedDate}
        setViewMode={ui.setViewMode}
        handleToday={ui.handleToday}
        handlePrev={ui.handlePrev}
        handleNext={ui.handleNext}
        sucursales={sucursales}
        profesionales={profesionales}
        filterSucursal={ui.filterSucursal}
        filterProfesional={ui.filterProfesional}
        filterEstado={ui.filterEstado}
        setFilterSucursal={ui.setFilterSucursal}
        setFilterProfesional={ui.setFilterProfesional}
        setFilterEstado={ui.setFilterEstado}
      />
      <AgendaViews
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        refetchCitas={refetchCitas}
        citas={derived.citas}
        viewMode={ui.viewMode}
        weekDays={derived.weekDays}
        monthDays={derived.monthDays}
        citasByDay={derived.citasByDay}
        sucursales={sucursales}
        servicios={servicios}
        profesionales={profesionales}
        todayStr={ui.todayStr}
        selectedDate={ui.selectedDate}
        setSelectedDate={ui.setSelectedDate}
        setViewMode={ui.setViewMode}
        setSelectedCita={ui.setSelectedCita}
        onCreateCita={() => ui.setIsManualModalOpen(true)}
      />
      <CitaDetailDrawer
        isOpen={Boolean(ui.selectedCita)}
        onClose={() => ui.setSelectedCita(null)}
        cita={ui.selectedCita}
        sucursales={sucursales}
        servicios={servicios}
        profesionales={profesionales}
        onCitaUpdated={() => refetchCitas()}
      />
      <ModalNuevaCitaManual
        isOpen={ui.isManualModalOpen}
        onClose={() => ui.setIsManualModalOpen(false)}
        initialFecha={ui.selectedDate}
        sucursales={sucursales}
        servicios={servicios}
        onSuccess={() => refetchCitas()}
      />
    </div>
  );
}
