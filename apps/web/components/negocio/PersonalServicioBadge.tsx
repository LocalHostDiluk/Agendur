import type { Servicio } from "@/lib/types";
interface PersonalServicioBadgeProps { serv: Servicio }
export function PersonalServicioBadge({ serv }: PersonalServicioBadgeProps) {
  return (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-alt border border-border text-text-primary font-medium"
                            >
                              <span>{serv.nombre}</span>
                              <span className="font-mono tabular-nums text-text-muted text-[10px]">
                                ({serv.duracion_minutos}m)
                              </span>
                            </span>
  );
}
