import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { ReactNode } from "react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { getPersonalColaboradorDetails } from "@/lib/utils/personal-colaboradores";
import { PersonalAvatar } from "./PersonalAvatar";
import { PersonalRolBadge } from "./PersonalRolBadge";
import { PersonalEstadoBadge } from "./PersonalEstadoBadge";
import { PersonalServicioBadge } from "./PersonalServicioBadge";
interface PersonalColaboradorCardProps extends ReturnType<typeof getPersonalColaboradorDetails> {
  colab: UnifiedColaborador; canWriteStaff: boolean; acciones: ReactNode;
}
export function PersonalColaboradorCard({ colab, sucursal, serviciosDelColab, citasAsignadas, esActivo,
  canWriteStaff, acciones }: PersonalColaboradorCardProps) {
  return (
    <div
      className={`bg-surface border rounded-xl p-4 space-y-3 shadow-xs ${
        esActivo
          ? "border-border"
          : "border-border/60 opacity-85"
      }`}
    >
      {/* Avatar + Nombre + Badges */}
      <div className="flex items-start gap-3">
        <PersonalAvatar nombre={colab.nombre} apellido={colab.apellido} className="size-11 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-base shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-bricolage font-bold text-sm text-text-primary truncate">
              {colab.nombre} {colab.apellido ?? ""}
            </h3>
        <PersonalEstadoBadge esActivo={esActivo} />
          </div>

          <div className="mt-1 flex items-center gap-2">
        <PersonalRolBadge rol={colab.rol} />
          </div>
        </div>
      </div>

      {/* Sucursal y Contacto */}
      <div className="space-y-1.5 text-xs text-text-secondary border-t border-border pt-2.5">
        {sucursal && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="font-medium text-text-primary">
              {sucursal.nombre}
            </span>
          </div>
        )}
        {colab.telefono && (
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{colab.telefono}</span>
          </div>
        )}
        {colab.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{colab.email}</span>
          </div>
        )}
      </div>

      {/* Especialidades */}
      {serviciosDelColab.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {serviciosDelColab.map((serv) => (
        <PersonalServicioBadge key={serv.id} serv={serv} />
          ))}
        </div>
      )}

      {/* Footer: Métricas y Botones de acción */}
      <div className="border-t border-border pt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-grape" />
          <span className="font-mono tabular-nums font-bold text-text-primary">
            {citasAsignadas.length}
          </span>
          <span>
            {citasAsignadas.length === 1 ? "cita" : "citas"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {canWriteStaff && <>
        {acciones}
          </>}
        </div>
      </div>
    </div>
  );
}
