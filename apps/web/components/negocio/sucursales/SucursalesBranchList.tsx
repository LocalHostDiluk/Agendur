"use client";

import type { SucursalWithPersonal } from "@/lib/utils/sucursales-formatters";
import { SucursalesLoadingSkeleton } from "./SucursalesSkeletons";
import { SucursalesError } from "./SucursalesError";
import { SucursalesEmpty } from "./SucursalesEmpty";
import { SucursalesBranchRow } from "./SucursalesBranchRow";
import { SucursalesBranchCard } from "./SucursalesBranchCard";

interface SucursalesBranchListProps {
  sucursales: SucursalWithPersonal[];
  isLoading: boolean;
  isError: boolean;
  negocioSlug?: string;
  onRetry: () => void;
  onCreateFirst: () => void;
  onDelete: (sucursal: SucursalWithPersonal) => void;
}

export function SucursalesBranchList({
  sucursales,
  isLoading,
  isError,
  negocioSlug,
  onRetry,
  onCreateFirst,
  onDelete,
}: SucursalesBranchListProps) {
  return (
    <section
      id="panel-sucursales"
      role="tabpanel"
      aria-labelledby="tab-sucursales"
      className="space-y-6"
    >
      {isLoading && <SucursalesLoadingSkeleton />}

      {!isLoading && isError && (
        <SucursalesError
          title="No se pudieron cargar las sucursales"
          description="Ocurrió un problema de conexión con el servidor. Intenta recargar la información."
          onRetry={onRetry}
        />
      )}

      {!isLoading && !isError && sucursales.length === 0 && (
        <SucursalesEmpty variant="sucursales" onCreateFirst={onCreateFirst} />
      )}

      {!isLoading && !isError && sucursales.length > 0 && (
        <div className="space-y-4">
          {/* 2. Tabla Desktop (hidden sm:table) */}
          <div className="hidden sm:block rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="hidden sm:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Sucursal
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Dirección
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Teléfono
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Equipo
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
                  {sucursales.map((suc) => (
                    <SucursalesBranchRow
                      key={suc.id}
                      sucursal={suc}
                      negocioSlug={negocioSlug}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Transformación Responsive Mobile (block sm:hidden) con pares clave:valor */}
          <div className="block sm:hidden space-y-4">
            {sucursales.map((suc) => (
              <SucursalesBranchCard
                key={suc.id}
                sucursal={suc}
                negocioSlug={negocioSlug}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
