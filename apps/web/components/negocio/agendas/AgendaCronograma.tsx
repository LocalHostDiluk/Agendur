import { AgendaCronogramaRow } from "./AgendaCronogramaRow";
import type { Cita, Sucursal, Servicio, Profesional } from "@/lib/types";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";

interface AgendaCronogramaProps {
  loadingCitas: boolean;
  errorCitas: boolean;
  citas: Cita[];
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  sucursales: Sucursal[];
  servicios: Servicio[];
  profesionales: Profesional[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendaCronograma({ loadingCitas, errorCitas, citas, viewMode, sucursales, servicios, profesionales, setSelectedCita }: AgendaCronogramaProps) {
  return (
    <>
{!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "cronograma" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <span>
                {citas.length}{" "}
                {citas.length === 1 ? "cita registrada" : "citas registradas"}
              </span>
              <span className="font-mono text-text-muted">
                Orden cronológico
              </span>
            </div>

            <div className="divide-y divide-border rounded-[var(--radius-lg)] bg-surface border border-border overflow-hidden shadow-xs">
              {citas.map((c) => (
                <AgendaCronogramaRow key={c.id} c={c} sucursales={sucursales} servicios={servicios} profesionales={profesionales} setSelectedCita={setSelectedCita} />
              ))}
            </div>
          </div>
        )}
    </>
  );
}
