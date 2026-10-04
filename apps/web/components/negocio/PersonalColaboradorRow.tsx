"use client";

import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PersonalColaboradorActions } from "./PersonalColaboradorActions";
import { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";
import type { UnifiedColaborador } from "@/lib/utils/personal-colaboradores";
import type { Sucursal, Servicio, Cita } from "@/lib/types";

interface PersonalColaboradorRowProps {
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

export function PersonalColaboradorRow({
  colab,
  sucursal,
  servicios,
  citas,
  canWriteStaff,
  onViewHorarios,
  onEdit,
  onToggleActivo,
  onDelete,
}: PersonalColaboradorRowProps) {
  const serviciosDelColab = servicios.filter((s) => (colab.serviciosIds || []).includes(s.id));
  const citasAsignadas = citas.filter((c) => c.profesional_id === colab.id && c.estado !== "cancelada");
  const esActivo = colab.activo !== false;

  return (
    <tr key={`desk-${colab.id}`} className="hover:bg-surface-alt transition-colors min-h-[48px]">
      <td className="p-3.5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-sm shrink-0">
            {colab.nombre[0]}
            {(colab.apellido || "")[0] || ""}
          </div>
          <div className="min-w-0">
            <p className="font-bricolage font-bold text-sm text-text-primary truncate">
              {colab.nombre} {colab.apellido ?? ""}
            </p>
            {colab.email && <p className="text-xs text-text-muted truncate">{colab.email}</p>}
            {colab.telefono && <p className="text-[11px] font-mono tabular-nums text-text-muted truncate">{colab.telefono}</p>}
          </div>
        </div>
      </td>

      <td className="p-3.5">
        <Badge variant={getRoleBadgeVariant(colab.rol)} size="sm" dot>
          {formatRoleLabel(colab.rol)}
        </Badge>
      </td>

      <td className="p-3.5">
        {sucursal ? (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{sucursal.nombre}</span>
          </div>
        ) : (
          <span className="text-xs text-text-muted italic">Sin sucursal</span>
        )}
      </td>

      <td className="p-3.5">
        {serviciosDelColab.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {serviciosDelColab.map((serv) => (
              <span key={serv.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-alt border border-border text-text-primary font-medium">
                <span>{serv.nombre}</span>
                <span className="font-mono tabular-nums text-text-muted text-[10px]">({serv.duracion_minutos}m)</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-text-muted italic">Sin servicios asignados</span>
        )}
      </td>

      <td className="p-3.5 text-center">
        <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
          {citasAsignadas.length}
        </span>
      </td>

      <td className="p-3.5">
        <Badge variant={esActivo ? "success" : "neutral"} size="sm" dot>
          {esActivo ? "Activo" : "Inactivo"}
        </Badge>
      </td>

      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end">
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
      </td>
    </tr>
  );
}
