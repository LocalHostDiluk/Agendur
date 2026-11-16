import { DashboardCitaSkeletonRow } from "./DashboardCitaSkeletonRow";

export function DashboardCitasSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="sticky top-0 bg-surface-alt text-text-secondary text-[12px] font-medium tracking-normal uppercase border-b border-border z-10">
          <tr>
            <th className="py-3 px-4">Folio</th>
            <th className="py-3 px-4">Cliente</th>
            <th className="py-3 px-4">Sede / Sucursal</th>
            <th className="py-3 px-4">Servicio</th>
            <th className="py-3 px-4">Fecha y Hora</th>
            <th className="py-3 px-4">Precio</th>
            <th className="py-3 px-4 text-right">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {[...Array(5)].map((_, i) => (
            <DashboardCitaSkeletonRow key={i} i={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
