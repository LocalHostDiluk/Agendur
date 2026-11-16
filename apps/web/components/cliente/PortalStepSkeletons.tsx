import { SkeletonBlock, SkeletonText, SkeletonCircle } from "@/components/ui/Skeleton";

/**
 * Skeleton para las 3 tarjetas de servicios cuando se está consultando el catálogo.
 * Exacta forma, padding y altura que la tarjeta de servicio real.
 */
export function PortalServicesSkeleton() {
  return (
    <div className="space-y-3" aria-label="Cargando servicios">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-full min-h-[72px] p-4 rounded-xl border border-border bg-surface flex items-start justify-between gap-4 skel-block"
        >
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-4 w-40" />
            <SkeletonText className="h-3 w-56 max-w-full" />
            <div className="flex items-center gap-2 pt-1">
              <SkeletonBlock className="w-3.5 h-3.5 rounded-full" />
              <SkeletonText className="h-3 w-16" />
            </div>
          </div>
          <div className="shrink-0">
            <SkeletonText className="h-5 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton del calendario del portal de reservas.
 * Si showAvailabilityDots es false: Números visibles normales y SIN puntos (primer instante de carga del negocio).
 * Si showAvailabilityDots es true: Números visibles y puntos de disponibilidad en .skel-circle de 4px (cargando mes).
 */
export function PortalCalendarSkeleton({
  showAvailabilityDots = false,
}: {
  showAvailabilityDots?: boolean;
}) {
  const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const DIAS_MES = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonText className="w-32 h-5" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DIAS_SEMANA.map((dia) => (
          <span
            key={dia}
            className="text-[11px] font-mono font-medium text-text-secondary py-1"
          >
            {dia}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        <div className="h-11 sm:h-12" aria-hidden="true" />
        <div className="h-11 sm:h-12" aria-hidden="true" />

        {DIAS_MES.map((dia) => (
          <div
            key={dia}
            className="h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg text-sm font-medium text-text-primary/70 relative"
          >
            <span>{dia}</span>
            {showAvailabilityDots && (
              <div className="absolute bottom-1.5 flex justify-center">
                <SkeletonCircle className="w-1 h-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
