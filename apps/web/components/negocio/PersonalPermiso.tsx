import { PendingBadge } from "@/components/ui/PendingBadge";
interface PersonalPermisoProps { perm: { nombre: string; concedido: boolean } }
export function PersonalPermiso({ perm }: PersonalPermisoProps) {
  return (
                    <div
                      className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          disabled
                          checked={perm.concedido}
                          readOnly
                          className="rounded text-grape focus:ring-grape shrink-0 opacity-70"
                        />
                        <span
                          className={`truncate ${
                            perm.concedido
                              ? "text-text-primary font-medium"
                              : "text-text-muted line-through"
                          }`}
                        >
                          {perm.nombre}
                        </span>
                      </div>
                      <PendingBadge
                        label="Pendiente"
                        tooltip="Gestión avanzada de permisos en desarrollo"
                        className="shrink-0"
                      />
                    </div>
  );
}
