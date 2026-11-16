"use client";

import type { Servicio } from "@/lib/types";
import { ServiciosLoadingSkeleton } from "./SucursalesSkeletons";
import { SucursalesError } from "./SucursalesError";
import { SucursalesEmpty } from "./SucursalesEmpty";
import { SucursalesServiceRow } from "./SucursalesServiceRow";
import { SucursalesServiceCard } from "./SucursalesServiceCard";

interface SucursalesServiceCatalogProps {
  servicios: Servicio[];
  isLoading: boolean;
  isError: boolean;
  updatingServiceId: string | null;
  onRetry: () => void;
  onCreateFirst: () => void;
  onToggleActivo: (id: string, isActivo: boolean) => void;
  onDelete: (servicio: Servicio) => void;
}

export function SucursalesServiceCatalog({
  servicios,
  isLoading,
  isError,
  updatingServiceId,
  onRetry,
  onCreateFirst,
  onToggleActivo,
  onDelete,
}: SucursalesServiceCatalogProps) {
  return (
    <section
      id="panel-servicios"
      role="tabpanel"
      aria-labelledby="tab-servicios"
      className="space-y-6"
    >
      {isLoading && <ServiciosLoadingSkeleton />}

      {!isLoading && isError && (
        <SucursalesError
          title="No se pudieron cargar los servicios"
          description="Ocurrió un problema de conexión con el catálogo. Intenta recargar la información."
          onRetry={onRetry}
        />
      )}

      {!isLoading && !isError && servicios.length === 0 && (
        <SucursalesEmpty variant="servicios" onCreateFirst={onCreateFirst} />
      )}

      {!isLoading && !isError && servicios.length > 0 && (
        <div className="space-y-4">
          {/* 2. Tabla Desktop (hidden sm:table) */}
          <div className="hidden sm:block rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="hidden sm:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Servicio
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Duración
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Precio
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Estado
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {servicios.map((s) => (
                    <SucursalesServiceRow
                      key={s.id}
                      servicio={s}
                      isUpdating={updatingServiceId === s.id}
                      onToggleActivo={onToggleActivo}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Transformación Responsive Mobile (block sm:hidden) con pares clave:valor */}
          <div className="block sm:hidden space-y-4">
            {servicios.map((s) => (
              <SucursalesServiceCard
                key={s.id}
                servicio={s}
                isUpdating={updatingServiceId === s.id}
                onToggleActivo={onToggleActivo}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
