import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";

export function ReportesLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-12"
      aria-busy="true"
      aria-label="Cargando módulo de reportes y analítica"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SkeletonText className="w-56 h-8" />
          <SkeletonText className="w-96 h-4" />
        </div>
        <SkeletonBlock className="h-10 w-40 rounded-[var(--radius-md)] shrink-0" />
      </div>

      {/* Barra de Filtros Skeleton */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-9 w-28 rounded-[var(--radius-sm)]" />
          <SkeletonBlock className="h-9 w-28 rounded-[var(--radius-sm)]" />
          <SkeletonBlock className="h-9 w-28 rounded-[var(--radius-sm)]" />
        </div>
        <SkeletonBlock className="h-9 w-48 rounded-[var(--radius-sm)]" />
      </div>

      {/* 3 Métricas Resumen Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonText className="w-36 h-3.5" />
              <SkeletonCircle className="size-8" />
            </div>
            <SkeletonBlock className="w-36 h-9 rounded" />
            <SkeletonText className="w-44 h-3" />
          </div>
        ))}
      </div>

      {/* Grid de 3 Gráficas Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica 1: Ocupación por Sucursal */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-1">
              <SkeletonText className="w-48 h-5" />
              <SkeletonText className="w-64 h-3.5" />
            </div>
            <SkeletonCircle className="size-8" />
          </div>
          <SkeletonBlock className="h-[280px] w-full rounded-xl" />
        </div>

        {/* Gráfica 2: Servicios Más Solicitados */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-1">
              <SkeletonText className="w-48 h-5" />
              <SkeletonText className="w-64 h-3.5" />
            </div>
            <SkeletonCircle className="size-8" />
          </div>
          <SkeletonBlock className="h-[280px] w-full rounded-xl" />
        </div>

        {/* Gráfica 3: Evolución de Citas */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-1">
              <SkeletonText className="w-56 h-5" />
              <SkeletonText className="w-80 h-3.5" />
            </div>
            <SkeletonCircle className="size-8" />
          </div>
          <SkeletonBlock className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default ReportesLoading;
