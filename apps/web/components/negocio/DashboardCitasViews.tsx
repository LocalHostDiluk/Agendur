import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { Cita } from "@/lib/types";
import { DashboardCitaCard } from "./DashboardCitaCard";
import { DashboardCitaRow } from "./DashboardCitaRow";

interface DashboardCitasViewsProps {
  citas: Cita[];
}

export function DashboardCitasViews({ citas }: DashboardCitasViewsProps) {
  return (
    <>
      {/* Desktop Table view */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Sede / Sucursal</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citas.map((cita) => (
              <DashboardCitaRow key={cita.id} cita={cita} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards view (Section 8) */}
      <div className="sm:hidden space-y-3">
        {citas.map((cita) => (
          <DashboardCitaCard key={cita.id} cita={cita} />
        ))}
      </div>
    </>
  );
}
