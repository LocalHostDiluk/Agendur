import { AgendaLoading } from "./AgendaLoading";
import { AgendaError } from "./AgendaError";
import { AgendaEmpty } from "./AgendaEmpty";
import { AgendaCronograma } from "./AgendaCronograma";
import { AgendaWeek } from "./AgendaWeek";
import { AgendaMonth } from "./AgendaMonth";
import type { Cita, Sucursal, Servicio, Profesional } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";
import type { useAgendaDerived } from "@/lib/hooks/use-agenda-derived";

interface AgendaViewsProps {
  loadingCitas: boolean;
  errorCitas: boolean;
  refetchCitas: () => unknown;
  citas: Cita[];
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  weekDays: ReturnType<typeof useAgendaDerived>["weekDays"];
  monthDays: ReturnType<typeof useAgendaDerived>["monthDays"];
  citasByDay: Record<string, Cita[]>;
  sucursales: Sucursal[];
  servicios: Servicio[];
  profesionales: Profesional[];
  todayStr: string;
  selectedDate: string;
  setSelectedDate: ReturnType<typeof useAgendaUi>["setSelectedDate"];
  setViewMode: ReturnType<typeof useAgendaUi>["setViewMode"];
  setSelectedCita: ReturnType<typeof useAgendaUi>["setSelectedCita"];
  onCreateCita: () => void;
}

export function AgendaViews(props: AgendaViewsProps) {
  const {
    loadingCitas, errorCitas, refetchCitas, citas, viewMode,
    weekDays, monthDays, citasByDay, sucursales, servicios, profesionales,
    todayStr, selectedDate, setSelectedDate, setViewMode,
    setSelectedCita, onCreateCita,
  } = props;

  return (
    <>
      <AgendaLoading
        loadingCitas={loadingCitas}
        viewMode={viewMode}
        weekDays={weekDays}
      />
      <AgendaError
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        refetchCitas={refetchCitas}
      />
      <AgendaEmpty
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        citas={citas}
        onCreateCita={onCreateCita}
      />
      <AgendaCronograma
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        citas={citas}
        viewMode={viewMode}
        sucursales={sucursales}
        servicios={servicios}
        profesionales={profesionales}
        setSelectedCita={setSelectedCita}
      />
      <AgendaWeek
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        citas={citas}
        viewMode={viewMode}
        weekDays={weekDays}
        citasByDay={citasByDay}
        servicios={servicios}
        setSelectedCita={setSelectedCita}
      />
      <AgendaMonth
        loadingCitas={loadingCitas}
        errorCitas={errorCitas}
        citas={citas}
        viewMode={viewMode}
        monthDays={monthDays}
        citasByDay={citasByDay}
        todayStr={todayStr}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setViewMode={setViewMode}
      />
    </>
  );
}
