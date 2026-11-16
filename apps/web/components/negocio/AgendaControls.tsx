import { AgendaDateNavigation } from "./AgendaDateNavigation";
import { AgendaFilters } from "./AgendaFilters";
import { AgendaViewTabs } from "./AgendaViewTabs";
import type { Sucursal, Profesional, EstadoCita } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";

interface AgendaControlsProps {
  selectedDate: string;
  todayStr: string;
  mondayYMD: string;
  sundayYMD: string;
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  setSelectedDate: ReturnType<typeof useAgendaUi>["setSelectedDate"];
  setViewMode: ReturnType<typeof useAgendaUi>["setViewMode"];
  handleToday: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  sucursales: Sucursal[];
  profesionales: Profesional[];
  filterSucursal: string;
  filterProfesional: string;
  filterEstado: EstadoCita | "";
  setFilterSucursal: ReturnType<typeof useAgendaUi>["setFilterSucursal"];
  setFilterProfesional: ReturnType<typeof useAgendaUi>["setFilterProfesional"];
  setFilterEstado: ReturnType<typeof useAgendaUi>["setFilterEstado"];
}

export function AgendaControls(props: AgendaControlsProps) {
  const {
    selectedDate, todayStr, mondayYMD, sundayYMD, viewMode,
    setSelectedDate, setViewMode, handleToday, handlePrev, handleNext,
    sucursales, profesionales, filterSucursal, filterProfesional,
    filterEstado, setFilterSucursal, setFilterProfesional, setFilterEstado,
  } = props;

  return (
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <AgendaDateNavigation
            selectedDate={selectedDate}
            todayStr={todayStr}
            mondayYMD={mondayYMD}
            sundayYMD={sundayYMD}
            viewMode={viewMode}
            setSelectedDate={setSelectedDate}
            handleToday={handleToday}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />

          {/* Alternador Canónico de 3 Vistas (§10) y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            {/* Switcher 3 Pestañas: Día (Cronograma) / Semana / Mes */}
            <AgendaViewTabs viewMode={viewMode} setViewMode={setViewMode} />

            <AgendaFilters
              sucursales={sucursales}
              profesionales={profesionales}
              filterSucursal={filterSucursal}
              filterProfesional={filterProfesional}
              filterEstado={filterEstado}
              setFilterSucursal={setFilterSucursal}
              setFilterProfesional={setFilterProfesional}
              setFilterEstado={setFilterEstado}
            />
          </div>
        </div>
      </div>


  );
}
