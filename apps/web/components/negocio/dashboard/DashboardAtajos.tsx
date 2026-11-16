import { Calendar, Store, Users } from "lucide-react";
import { DashboardAtajo } from "./DashboardAtajo";

interface DashboardAtajosProps {
  sucursalesCount: number;
}

export function DashboardAtajos({ sucursalesCount }: DashboardAtajosProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <DashboardAtajo
        href="/agendas"
        iconContainerClassName="w-9 h-9 rounded-lg bg-grape-soft text-grape flex items-center justify-center shrink-0 mt-0.5"
        icon={<Calendar className="w-4 h-4" />}
        title="Ir al Calendario y Agenda"
        description="Revisa disponibilidad por día o registra una cita manual."
      />
      <DashboardAtajo
        href="/sucursales"
        iconContainerClassName="w-9 h-9 rounded-lg bg-surface-alt text-text-primary flex items-center justify-center shrink-0 mt-0.5"
        icon={<Store className="w-4 h-4 text-grape" />}
        title="Servicios y Sucursales"
        description={
          sucursalesCount > 0
            ? `${sucursalesCount} ${sucursalesCount === 1 ? "sede activa lista" : "sedes activas listas"} para administrar.`
            : "Administra tus ubicaciones, horarios y catálogo."
        }
      />
      <DashboardAtajo
        href="/personal"
        iconContainerClassName="w-9 h-9 rounded-lg bg-surface-alt text-text-primary flex items-center justify-center shrink-0 mt-0.5"
        icon={<Users className="w-4 h-4 text-grape" />}
        title="Equipo y Personal"
        description="Gestiona profesionales, permisos y turnos semanales."
      />
    </div>
  );
}
