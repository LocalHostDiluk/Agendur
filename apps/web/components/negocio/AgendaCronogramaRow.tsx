"use client";

import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { getEstadoBadgeProps } from "@/lib/utils/agenda-estado";
import type { Cita, Sucursal, Servicio, Profesional } from "@/lib/types";

interface AgendaCronogramaRowProps {
  c: Cita;
  sucursales: Sucursal[];
  servicios: Servicio[];
  profesionales: Profesional[];
  setSelectedCita: (cita: Cita) => void;
}

export function AgendaCronogramaRow({ c, sucursales, servicios, profesionales, setSelectedCita }: AgendaCronogramaRowProps) {
                const folio = c.id
                  ? `#AG-${c.id.slice(0, 6).toUpperCase()}`
                  : "#AG-000000";
                const hora = c.hora_inicio ?? c.hora ?? "—";
                const horaFin = c.hora_fin ? ` – ${c.hora_fin}` : "";
                const cliente =
                  `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"} ${c.cliente_apellido ?? ""}`.trim();
                const serv = servicios.find((s) => s.id === c.servicio_id);
                const suc = sucursales.find((s) => s.id === c.sucursal_id);
                const prof = profesionales.find(
                  (p) => p.id === c.profesional_id,
                );
                const badgeInfo = getEstadoBadgeProps(c.estado);

  return (
<div
                    onClick={() => setSelectedCita(c)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-alt/60 transition-colors duration-100 ease-out cursor-pointer group"
                  >
                    {/* Horario y Folio en Space Mono */}
                    <div className="flex items-start gap-3.5 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-100 ease-out">
                        <Clock className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-mono text-xs sm:text-sm tabular-nums font-bold text-text-primary flex items-center gap-1.5">
                          <span>
                            {hora}
                            {horaFin}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-text-secondary block">
                          {folio}
                        </span>
                      </div>
                    </div>

                    {/* Datos del Cliente y Servicio */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bricolage font-bold text-text-primary text-base">
                          {cliente}
                        </span>
                        {suc && (
                          <span className="text-[10px] font-mono bg-surface-alt text-text-secondary px-2 py-0.5 rounded-[var(--radius-sm)] border border-border">
                            {suc.nombre}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-text-primary">
                          {serv?.nombre ?? "Servicio general"}
                        </span>
                        {prof && (
                          <span className="text-text-muted flex items-center gap-1">
                            · con{" "}
                            <span className="text-text-secondary">
                              {prof.nombre}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Estado con Badge de Sistema (§5.12) y Acción */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <Badge variant={badgeInfo.variant} dot size="sm">
                        {badgeInfo.label}
                      </Badge>

                      <span className="text-xs text-grape font-semibold group-hover:translate-x-0.5 transition-transform duration-100 ease-out flex items-center gap-1">
                        <span>Ver detalle</span>
                        <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                      </span>
                    </div>
                  </div>
  );
}
