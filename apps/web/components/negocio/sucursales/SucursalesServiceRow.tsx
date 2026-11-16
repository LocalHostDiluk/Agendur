"use client";

import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getServicioDuracion,
  formatServicioPrecio,
} from "@/lib/utils/sucursales-formatters";
import type { Servicio } from "@/lib/types";

interface SucursalesServiceRowProps {
  servicio: Servicio;
  isUpdating: boolean;
  onToggleActivo: (id: string, isActivo: boolean) => void;
  onDelete: (servicio: Servicio) => void;
}

export function SucursalesServiceRow({
  servicio: s,
  isUpdating,
  onToggleActivo,
  onDelete,
}: SucursalesServiceRowProps) {
  const duracion = getServicioDuracion(s);
  const isActivo = s.activo !== false;

  return (
    <tr className="hover:bg-surface-alt/50 transition-colors">
      <td className="py-3.5 px-4 sm:px-6">
        <div className="space-y-0.5">
          <span className="font-semibold text-text-primary block">
            {s.nombre}
          </span>
          {s.descripcion && (
            <p className="text-xs text-text-secondary line-clamp-1 max-w-xs sm:max-w-md">
              {s.descripcion}
            </p>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 font-mono text-text-primary px-2.5 py-1 rounded-md bg-surface-alt border border-border/70 text-xs">
          <Clock className="w-3 h-3 text-text-muted" />
          <span>{duracion} min</span>
        </span>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <span className="font-mono font-bold text-text-primary">
          ${formatServicioPrecio(s.precio)}{" "}
          <span className="text-[10px] text-text-muted font-normal">MXN</span>
        </span>
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <Badge variant={isActivo ? "success" : "neutral"} size="sm" dot>
          {isActivo ? "ACTIVA" : "PAUSADA"}
        </Badge>
      </td>

      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={isActivo ? "outline" : "secondary"}
            size="sm"
            disabled={isUpdating}
            onClick={() => onToggleActivo(s.id, isActivo)}
            aria-label={
              isActivo
                ? `Pausar servicio ${s.nombre}`
                : `Activar servicio ${s.nombre}`
            }
            className="h-8 px-3 text-xs"
          >
            {isUpdating ? "…" : isActivo ? "Pausar" : "Activar"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(s)}
            aria-label={`Eliminar servicio ${s.nombre}`}
            className="h-8 px-2.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Eliminar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
