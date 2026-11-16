import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { PendingBadge } from "@/components/ui/PendingBadge";
import { PersonalPermiso } from "./PersonalPermiso";
interface PersonalRolCardProps {
  rolItem: { nombre: string; variant: BadgeVariant; descripcion: string;
    permisos: { id: string; nombre: string; concedido: boolean }[] };
}
export function PersonalRolCard({ rolItem }: PersonalRolCardProps) {
  return (
            <div
              className="bg-surface-alt/40 border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Badge variant={rolItem.variant} size="md" dot>
                    {rolItem.nombre}
                  </Badge>
                </div>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Gestión avanzada de permisos en desarrollo"
                />
              </div>

              <p className="text-xs text-text-secondary">
                {rolItem.descripcion}
              </p>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Permisos del perfil
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rolItem.permisos.map((perm) => (
<PersonalPermiso key={perm.id} perm={perm} />
                  ))}
                </div>
              </div>
            </div>
  );
}
