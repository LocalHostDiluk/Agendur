"use client";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PendingBadge } from "@/components/ui/PendingBadge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { PersonalRolCard } from "./PersonalRolCard";
import { PersonalRolesHeader } from "./PersonalRolesHeader";
interface PersonalRolesModalProps { isOpen: boolean; onClose: () => void }

const ROLES_PERMISOS_CATALOGO = [
  {
    id: "admin",
    nombre: "Administrador",
    variant: "grape" as BadgeVariant,
    descripcion:
      "Acceso total a la administración, configuración, personal, reportes y facturación.",
    permisos: [
      { id: "p1", nombre: "Gestión completa de citas y reservas", concedido: true },
      { id: "p2", nombre: "Administración de colaboradores y horarios", concedido: true },
      { id: "p3", nombre: "Edición de catálogo de servicios y precios", concedido: true },
      { id: "p4", nombre: "Configuración de sucursales y negocio", concedido: true },
      { id: "p5", nombre: "Visualización de reportes e ingresos", concedido: true },
      { id: "p6", nombre: "Gestión de pasarelas de pago y suscripción", concedido: true },
    ],
  },
  {
    id: "especialista",
    nombre: "Especialista",
    variant: "info" as BadgeVariant,
    descripcion:
      "Profesional operativo que atiende citas y consulta su propia disponibilidad.",
    permisos: [
      { id: "p1", nombre: "Gestión de su propia agenda de citas", concedido: true },
      { id: "p2", nombre: "Visualización de historial de clientes asignados", concedido: true },
      { id: "p3", nombre: "Ajuste de horarios habituales y descansos", concedido: true },
      { id: "p4", nombre: "Edición de datos de otros colaboradores", concedido: false },
      { id: "p5", nombre: "Acceso a reportes financieros y facturación", concedido: false },
    ],
  },
  {
    id: "recepcionista",
    nombre: "Recepcionista",
    variant: "neutral" as BadgeVariant,
    descripcion:
      "Atención al cliente en recepción, asignación de citas y cobros en sucursal.",
    permisos: [
      { id: "p1", nombre: "Creación y reprogramación de citas en sucursal", concedido: true },
      { id: "p2", nombre: "Consulta de disponibilidad de todos los especialistas", concedido: true },
      { id: "p3", nombre: "Registro y actualización de datos de clientes", concedido: true },
      { id: "p4", nombre: "Cobro y registro de anticipos en recepción", concedido: true },
      { id: "p5", nombre: "Baja de personal o cambios en suscripción", concedido: false },
    ],
  },
];

export function PersonalRolesModal({ isOpen, onClose }: PersonalRolesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-roles-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
<PersonalRolesHeader onClose={onClose} />

        {/* Banner de Permisos Granulares Pendientes */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-text-primary">
                Gestión de Permisos Granulares
              </span>
            </div>
            <PendingBadge
              label="Pendiente"
              tooltip="Gestión avanzada de permisos en desarrollo"
            />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Actualmente los permisos se asignan automáticamente según el Rol seleccionado. La personalización granular individual carece de endpoint en backend y se encuentra en desarrollo.
          </p>
        </div>

        {/* Catálogo de Roles */}
        <div className="space-y-5">
          {ROLES_PERMISOS_CATALOGO.map((rolItem) => (
<PersonalRolCard key={rolItem.id} rolItem={rolItem} />
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
