"use client";

import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  Users,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  formatSucursalLocation,
  getSucursalPersonalCount,
  type SucursalWithPersonal,
} from "@/lib/utils/sucursales-formatters";

interface SucursalesBranchRowProps {
  sucursal: SucursalWithPersonal;
  negocioSlug?: string;
  onDelete: (sucursal: SucursalWithPersonal) => void;
}

export function SucursalesBranchRow({
  sucursal: suc,
  negocioSlug,
  onDelete,
}: SucursalesBranchRowProps) {
  return (
    <tr className="hover:bg-surface-alt/50 transition-colors">
      <td className="py-3.5 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-text-primary block">
              {suc.nombre}
            </span>
            {suc.es_matriz && (
              <Badge variant="neutral" size="sm" dot={false}>
                MATRIZ
              </Badge>
            )}
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <span className="font-mono text-xs text-text-secondary flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-grape shrink-0" />
          <span>{formatSucursalLocation(suc)}</span>
        </span>
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="font-mono text-xs text-text-primary flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span>{suc.telefono}</span>
        </span>
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-xs text-text-secondary font-medium">
          <Users className="w-3.5 h-3.5 text-text-muted" />
          <span>{getSucursalPersonalCount(suc)} Profesionales</span>
        </span>
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <Badge variant={suc.activa ? "success" : "neutral"} size="sm" dot>
          {suc.activa ? "ACTIVA" : "INACTIVA"}
        </Badge>
      </td>

      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {negocioSlug && (
            <Link
              href={`/reserva/${negocioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-grape hover:underline font-semibold text-xs p-1"
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
            <span className="hidden lg:inline">Eliminar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
