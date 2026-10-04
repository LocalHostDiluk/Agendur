"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PersonalColaboradorActions } from "./PersonalColaboradorActions";
import { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";
import type { UnifiedColaborador } from "@/lib/utils/personal-colaboradores";
import type { Sucursal, Servicio, Cita } from "@/lib/types";

interface PersonalColaboradorCardProps {
  colab: UnifiedColaborador;
  sucursal?: Sucursal;
  servicios: Servicio[];
  citas: Cita[];
  canWriteStaff: boolean;
  onViewHorarios: () => void;
  onEdit: () => void;
  onToggleActivo: () => void;
  onDelete: () => void;
}

export function PersonalColaboradorCard({
  colab,
  sucursal,
  servicios,
  citas,
  canWriteStaff,
  onViewHorarios,
  onEdit,
  onToggleActivo,
  onDelete,
}: PersonalColaboradorCardProps) {
  const serviciosDelColab = servicios.filter((s) => (colab.serviciosIds || []).includes(s.id));
  const citasAsignadas = citas.filter((c) => c.profesional_id === colab.id && c.estado !== "cancelada");
  const esActivo = colab.activo !== false;

  return (
    <div
      key={`mob-${colab.id}`}
      className={`bg-surface border rounded-xl p-4 space-y-3 shadow-xs ${
        esActivo ? "border-border" : "border-border/60 opacity-85"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="size-11 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-base shrink-0">
          {colab.nombre[0]}
          {(colab.apellido || "")[0] || ""}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-bricolage font-bold text-sm text-text-primary truncate">
              {colab.nombre} {colab.apellido ?? ""}
            </h3>
            <Badge variant={esActivo ? "success" : "neutral"} size="sm" dot>
              {esActivo ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(colab.rol)} size="sm" dot>
              {formatRoleLabel(colab.rol)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary border-t border-border pt-2.5">
        {sucursal && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="font-medium text-text-primary">{sucursal.nombre}</span>
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

      {serviciosDelColab.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {serviciosDelColab.map((serv) => (
            <span
              key={serv.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-alt border border-border text-text-primary font-medium"
            >
              <span>{serv.nombre}</span>
              <span className="font-mono tabular-nums text-text-muted text-[10px]">({serv.duracion_minutos}m)</span>
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-grape" />
          <span className="font-mono tabular-nums font-bold text-text-primary">{citasAsignadas.length}</span>
          <span>{citasAsignadas.length === 1 ? "cita" : "citas"}</span>
        </div>

        <PersonalColaboradorActions
          nombre={colab.nombre}
          esActivo={esActivo}
          canWriteStaff={canWriteStaff}
          onViewHorarios={onViewHorarios}
          onEdit={onEdit}
          onToggleActivo={onToggleActivo}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
