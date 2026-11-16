"use client";

import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getServicioDuracion,
  formatServicioPrecio,
} from "@/lib/utils/sucursales-formatters";
import type { Servicio } from "@/lib/types";

interface SucursalesServiceCardProps {
  servicio: Servicio;
  isUpdating: boolean;
  onToggleActivo: (id: string, isActivo: boolean) => void;
  onDelete: (servicio: Servicio) => void;
}

export function SucursalesServiceCard({
  servicio: s,
  isUpdating,
  onToggleActivo,
  onDelete,
}: SucursalesServiceCardProps) {
  const duracion = getServicioDuracion(s);
  const isActivo = s.activo !== false;

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="font-bricolage font-bold text-base text-text-primary">
            {s.nombre}
          </h3>
          {s.descripcion && (
            <p className="text-xs text-text-secondary line-clamp-2">
              {s.descripcion}
            </p>
          )}
        </div>
        <Badge variant={isActivo ? "success" : "neutral"} size="sm" dot>
          {isActivo ? "ACTIVA" : "PAUSADA"}
        </Badge>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted font-medium">Duración:</span>
          <span className="font-mono font-semibold text-text-primary inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>{duracion} min</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted font-medium">Precio:</span>
          <span className="font-mono font-bold text-text-primary text-sm">
            ${formatServicioPrecio(s.precio)}{" "}
            <span className="text-[10px] text-text-muted font-normal">MXN</span>
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
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
          <span>Eliminar</span>
        </Button>
      </div>
    </div>
  );
}
