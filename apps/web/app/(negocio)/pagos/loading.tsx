import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";

export function PagosLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-12"
      aria-busy="true"
      aria-label="Cargando módulo de pagos y facturación"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SkeletonText className="w-56 h-8" />
          <SkeletonText className="w-96 h-4" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-[var(--radius-md)] shrink-0" />
      </div>

      {/* Banner Informativo Skeleton */}
      <div className="rounded-2xl border border-dashed border-border p-4 sm:p-5 bg-surface-alt/40 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-24 h-5 rounded-full" />
          <SkeletonText className="w-48 h-4" />
        </div>
        <SkeletonText className="w-full max-w-2xl h-3.5" />
      </div>

      {/* 3 KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonText className="w-32 h-3.5" />
              <SkeletonCircle className="size-8" />
            </div>
            <SkeletonBlock className="w-44 h-9 rounded" />
            <SkeletonText className="w-36 h-3" />
          </div>
        ))}
      </div>

      {/* Filtros Skeleton */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <SkeletonBlock className="h-10 w-full sm:w-80 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SkeletonBlock className="h-10 w-32 rounded-[var(--radius-sm)]" />
          <SkeletonBlock className="h-10 w-32 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Tabla Skeleton */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden space-y-2 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <SkeletonText className="w-36 h-4" />
          <SkeletonText className="w-24 h-4" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-2 border-b border-border/40 gap-4"
            >
              <div className="flex items-center gap-3">
                <SkeletonCircle className="size-8" />
                <div className="space-y-1">
                  <SkeletonText className="w-28 h-3.5" />
                  <SkeletonText className="w-40 h-3" />
                </div>
              </div>
              <SkeletonText className="w-28 h-4 hidden sm:block" />
              <SkeletonBlock className="w-20 h-6 rounded-full" />
              <SkeletonText className="w-24 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PagosLoading;
