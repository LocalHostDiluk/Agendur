"use client";

import { Building2, Scissors, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SucursalesEmptyProps {
  variant: "sucursales" | "servicios";
  onCreateFirst: () => void;
}

export function SucursalesEmpty({
  variant,
  onCreateFirst,
}: SucursalesEmptyProps) {
  const isSucursales = variant === "sucursales";

  return (
    <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-grape-soft text-grape flex items-center justify-center mx-auto">
        {isSucursales ? (
          <Building2 className="w-7 h-7" strokeWidth={1.75} />
        ) : (
          <Scissors className="w-7 h-7" strokeWidth={1.75} />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bricolage font-bold text-text-primary">
          {isSucursales
            ? "Aún no tienes sucursales registradas"
            : "Tu catálogo de servicios está vacío"}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
          {isSucursales
            ? "Agrega tu primera sede física con su dirección y horario para comenzar a recibir reservas."
            : "Agrega los servicios que ofreces (ej. cortes, tratamientos, consultas) con su duración estimada y precio."}
        </p>
      </div>
      <Button
        variant="primary"
        onClick={onCreateFirst}
        className="min-h-[44px]"
      >
        <Plus className="w-4 h-4" />
        <span>
          {isSucursales ? "Crear primera sucursal" : "Crear primer servicio"}
        </span>
      </Button>
    </div>
  );
}
