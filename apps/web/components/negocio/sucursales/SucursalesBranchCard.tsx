"use client";

import Link from "next/link";
import { Store, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  formatSucursalLocation,
  getSucursalPersonalCount,
  type SucursalWithPersonal,
} from "@/lib/utils/sucursales-formatters";

interface SucursalesBranchCardProps {
  sucursal: SucursalWithPersonal;
  negocioSlug?: string;
  onDelete: (sucursal: SucursalWithPersonal) => void;
}

export function SucursalesBranchCard({
  sucursal: suc,
  negocioSlug,
  onDelete,
}: SucursalesBranchCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <h3 className="font-bricolage font-bold text-base text-text-primary leading-tight">
            {suc.nombre}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {suc.es_matriz && (
            <Badge variant="neutral" size="sm" dot={false}>
              MATRIZ
            </Badge>
          )}
          <Badge variant={suc.activa ? "success" : "neutral"} size="sm" dot>
            {suc.activa ? "ACTIVA" : "INACTIVA"}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-text-muted font-medium">Dirección:</span>
          <span className="font-mono text-text-secondary text-right">
            {formatSucursalLocation(suc)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted font-medium">Teléfono:</span>
          <span className="font-mono text-text-primary font-semibold">
            {suc.telefono}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted font-medium">Equipo:</span>
          <span className="text-text-secondary">
            {getSucursalPersonalCount(suc)} Profesionales
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        {negocioSlug && (
          <Link
            href={`/reserva/${negocioSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-grape hover:underline font-semibold text-xs"
            aria-label={`Ver portal público de reservas para ${suc.nombre}`}
          >
            <span>Portal público</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(suc)}
          aria-label={`Eliminar sucursal ${suc.nombre}`}
          className="h-8 px-2.5 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Eliminar</span>
        </Button>
      </div>
    </div>
  );
}
