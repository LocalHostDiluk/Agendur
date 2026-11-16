"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type SucursalesTab = "sucursales" | "servicios";

interface SucursalesHeaderProps {
  activeTab: SucursalesTab;
  onOpenModalSucursal: () => void;
  onOpenModalServicio: () => void;
}

export function SucursalesHeader({
  activeTab,
  onOpenModalSucursal,
  onOpenModalServicio,
}: SucursalesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
          Servicios y sucursales
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Administra las sedes físicas de tu negocio y el catálogo de
          servicios ofrecidos.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {activeTab === "sucursales" ? (
          <Button
            variant="primary"
            onClick={onOpenModalSucursal}
            className="min-h-[44px]"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Agregar Sucursal</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onOpenModalServicio}
            className="min-h-[44px]"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Agregar Servicio</span>
          </Button>
        )}
      </div>
    </div>
  );
}
