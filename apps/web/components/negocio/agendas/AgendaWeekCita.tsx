"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { getEstadoBadgeProps } from "@/lib/utils/agenda-estado";
import type { Cita, Servicio } from "@/lib/types";

interface AgendaWeekCitaProps {
  c: Cita;
  servicios: Servicio[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendaWeekCita({ c, servicios, setSelectedCita }: AgendaWeekCitaProps) {
                          const folio = c.id
                            ? `#AG-${c.id.slice(0, 6).toUpperCase()}`
                            : "#AG-000000";
                          const cliente = `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"}`;
                          const serv = servicios.find(
                            (s) => s.id === c.servicio_id,
                          );
                          const hora = c.hora_inicio ?? c.hora ?? "";
                          const badgeInfo = getEstadoBadgeProps(c.estado);

  return (
<div
                              onClick={() => setSelectedCita(c)}
                              className="p-2.5 rounded-xl border border-border bg-surface-alt/40 hover:bg-surface-alt hover:border-grape/40 transition-all duration-100 ease-out cursor-pointer space-y-1.5 group"
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-mono text-xs tabular-nums font-bold text-text-primary flex items-center gap-1">
                                  <Clock
                                    className="w-3 h-3 text-grape shrink-0"
                                    strokeWidth={1.75}
                                  />
                                  {hora}
                                </span>
                                <Badge
                                  variant={badgeInfo.variant}
                                  dot
                                  size="sm"
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {badgeInfo.shortLabel}
                                </Badge>
                              </div>
                              <span className="font-mono text-[11px] text-text-secondary block truncate">
                                {folio}
                              </span>
                              <p className="text-xs font-bold text-text-primary truncate">
                                {cliente}
                              </p>
                              <p className="text-[10px] text-text-secondary truncate">
                                {serv?.nombre ?? "Servicio"}
                              </p>
                            </div>
  );
}
