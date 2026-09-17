import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";

export function PersonalLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Cargando personal y equipo"
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Personal y equipo
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administra los colaboradores, roles, asignación de servicios y
            turnos de trabajo.
          </p>
        </div>

        <SkeletonBlock className="h-[44px] w-48 rounded-lg shrink-0" />
      </div>

      {/* Barra de Control: Selector de vistas y Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Pills Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-alt min-h-[38px]">
            <SkeletonBlock className="w-4 h-4 rounded" />
            <SkeletonText className="w-28 h-3.5" />
            <SkeletonBlock className="w-5 h-4 rounded-full" />
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg min-h-[38px]">
            <SkeletonBlock className="w-4 h-4 rounded" />
            <SkeletonText className="w-24 h-3.5" />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-md lg:justify-end">
          <SkeletonBlock className="h-[38px] w-full sm:w-48 rounded-lg shrink-0" />
          <SkeletonBlock className="h-[38px] w-full flex-1 rounded-lg" />
        </div>
      </div>

      {/* Directorio de colaboradores con avatares circulares y chips de servicio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-3.5">
              {/* Avatar circular + Info básica */}
              <div className="flex items-start gap-3.5">
                <SkeletonCircle className="w-12 h-12 shrink-0" />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <SkeletonText className="h-4 w-32" />
                    <SkeletonBlock className="h-4 w-12 rounded-full" />
                  </div>
                  <SkeletonText className="h-3 w-20" />
                  <SkeletonText className="h-3 w-28" />
                </div>
              </div>

              {/* Fila de contacto */}
              <div className="pt-2 border-t border-border flex items-center gap-3">
                <SkeletonText className="h-3 w-24" />
                <SkeletonText className="h-3 w-28" />
              </div>

              {/* Chips de servicio */}
              <div className="space-y-2 pt-1">
                <SkeletonText className="h-3 w-24" />
                <div className="flex flex-wrap gap-1.5">
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                  <SkeletonBlock className="h-5 w-20 rounded-full" />
                  <SkeletonBlock className="h-5 w-14 rounded-full" />
                </div>
              </div>
            </div>

            {/* Footer de métricas */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <SkeletonText className="h-3 w-20" />
              <SkeletonBlock className="h-4 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonalLoading;
