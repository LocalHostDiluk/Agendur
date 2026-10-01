"use client";

import type { Cita, Servicio, Sucursal, Profesional } from "@/lib/types";
import { AgendasCitaRow } from "./AgendasCitaRow";

interface AgendasCronogramaProps {
  citas: Cita[];
  servicios: Servicio[];
  sucursales: Sucursal[];
  profesionales: Pick<Profesional, "id" | "nombre">[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendasCronograma({ citas, servicios, sucursales, profesionales, setSelectedCita }: AgendasCronogramaProps) {
  return (
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
        {citas.map((c) => (<AgendasCitaRow key={c.id} c={c} servicios={servicios} sucursales={sucursales} profesionales={profesionales} setSelectedCita={setSelectedCita} />))}
      </div>
    </div>
  );
}
