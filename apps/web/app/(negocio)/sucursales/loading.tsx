import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

export function SucursalesLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Cargando sucursales y servicios"
    >
      {/* Encabezado */}
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

        <SkeletonBlock className="h-[44px] w-40 rounded-xl shrink-0" />
      </div>

      {/* Píldoras de navegación (Tabs) */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="inline-flex items-center p-1 bg-surface-alt/70 border border-border rounded-xl text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface shadow-xs">
            <SkeletonBlock className="w-4 h-4 rounded" />
            <SkeletonText className="w-16 h-4" />
            <SkeletonBlock className="w-5 h-4 rounded-full" />
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg">
            <SkeletonBlock className="w-4 h-4 rounded" />
            <SkeletonText className="w-16 h-4" />
            <SkeletonBlock className="w-5 h-4 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid de tarjetas de sucursales / servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-surface border border-border space-y-4"
          >
            <div className="flex justify-between items-start">
              <SkeletonBlock className="w-10 h-10 rounded-xl" />
              <SkeletonBlock className="w-16 h-5 rounded-full" />
            </div>

            <div className="space-y-2">
              <SkeletonBlock className="w-3/4 h-5 rounded" />
              <SkeletonBlock className="w-full h-4 rounded" />
              <SkeletonBlock className="w-1/2 h-4 rounded" />
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <SkeletonBlock className="w-24 h-4 rounded" />
              <SkeletonBlock className="w-16 h-4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SucursalesLoading;
