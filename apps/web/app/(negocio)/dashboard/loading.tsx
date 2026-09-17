import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

export function DashboardLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Cargando panel de control"
    >
      {/* Welcome Banner Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <SkeletonBlock className="w-28 h-5 rounded-full" />
          <SkeletonText className="w-64 h-8" />
          <SkeletonText className="w-96 max-w-full h-4" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="w-40 h-[36px] rounded-md" />
          <SkeletonBlock className="w-36 h-[36px] rounded-md" />
        </div>
      </div>

      {/* 4 KPI Cards: label 60x12, valor 120x32, tendencia 50x16 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonText className="w-[60px] h-[12px]" />
              <SkeletonBlock className="w-8 h-8 rounded-lg" />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <SkeletonBlock className="w-[120px] h-[32px]" />
              <SkeletonBlock className="w-[50px] h-[16px] rounded-md" />
            </div>

            <SkeletonText className="w-[110px] h-[11px]" />
          </div>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm min-w-0 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <SkeletonText className="w-32 h-5" />
                <SkeletonText className="w-48 h-3" />
              </div>
              <SkeletonBlock className="w-20 h-6 rounded-md" />
            </div>

            <SkeletonBlock className="h-[260px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Appointments Table Container */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <SkeletonText className="w-48 h-5" />
            <SkeletonText className="w-72 h-3" />
          </div>
          <SkeletonText className="w-36 h-4" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-surface-alt text-text-secondary text-[12px] font-medium uppercase border-b border-border z-10">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Sede / Sucursal</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="h-12">
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <SkeletonText
                        className="h-3.5"
                        style={{ width: "70%" }}
                      />
                      <SkeletonText
                        className="h-2.5"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonText className="h-3" style={{ width: "50%" }} />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonText className="h-3" style={{ width: "70%" }} />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonText className="h-3" style={{ width: "40%" }} />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonText className="h-3" style={{ width: "30%" }} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SkeletonBlock className="h-5 w-20 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardLoading;
