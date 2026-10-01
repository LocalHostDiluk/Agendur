import { ShieldCheck } from "lucide-react";

export function ConfiguracionRolesCard() {
  return (
    <div className="p-4 rounded-xl bg-surface-alt border border-border space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-grape" />
        <span className="text-xs font-medium text-text-secondary">
          Matriz de roles tipificados
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
          <p className="font-bold text-grape">Propietario</p>
          <p className="text-text-secondary">
            Control absoluto de pagos, facturación, sucursales y borrado comercial.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
          <p className="font-bold text-text-primary">Administrador</p>
          <p className="text-text-secondary">
            Gestión completa de agendas, clientes, servicios y personal de la sede.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
          <p className="font-bold text-text-primary">Profesional / Staff</p>
          <p className="text-text-secondary">
            Visualización de su propio calendario y confirmación de turnos asignados.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
          <p className="font-bold text-text-primary">Recepcionista</p>
          <p className="text-text-secondary">
            Creación rápida de citas manuales, cobro presencial y registro de llegada.
          </p>
        </div>
      </div>
    </div>
  );
}
