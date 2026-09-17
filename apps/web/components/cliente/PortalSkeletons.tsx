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
  // Cuadrícula fija de días de demostración visual
  const DIAS_MES = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Navegación del Mes */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonText className="w-32 h-5" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
      </div>

      {/* Cabecera de Días de la semana */}
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

      {/* Matriz de Días (sin dots en carga inicial del portal; con dots .skel-circle 4px si showAvailabilityDots=true) */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaciador para alinear el primer día */}
        <div className="h-11 sm:h-12" aria-hidden="true" />
        <div className="h-11 sm:h-12" aria-hidden="true" />

        {DIAS_MES.map((dia) => (
          <div
            key={dia}
            className="h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg text-sm font-medium text-text-primary/70 relative"
          >
            <span>{dia}</span>

            {/* Solo se muestran dots si se solicita explícitamente para recarga de disponibilidad */}
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

/**
 * Skeleton completo del portal de reservas de clientes:
 * - Logo .skel-circle 48px
 * - Nombre .skel-text 140x20px
 * - Zona fija: calendario completo en skeleton sin dots
 * - 3 .skel-block para tarjetas de servicios
 */
export function PortalSkeletons() {
  return (
    <div
      className="min-h-screen bg-[var(--paper,#F3EEDF)] text-text-primary flex flex-col lg:flex-row"
      aria-busy="true"
      aria-label="Cargando portal de reservas"
    >
      {/* Mobile Header Compacto (<1024px) */}
      <header className="lg:hidden h-[72px] bg-[#1D1720] text-[#F3EEDF] px-4 flex items-center justify-between border-b border-[#F3EEDF]/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <SkeletonCircle className="w-8 h-8 shrink-0" />
          <SkeletonText className="w-[140px] h-[20px]" />
        </div>
        <span className="text-xs font-medium text-[#F3EEDF]/65 font-sans">
          Agendur
        </span>
      </header>

      {/* Columna Izquierda Desktop (≥1024px) */}
      <aside className="hidden lg:flex w-[380px] shrink-0 bg-[#1D1720] text-[#F3EEDF] p-8 flex-col justify-between min-h-screen sticky top-0 border-r border-[#F3EEDF]/10">
        <div>
          {/* Logo (.skel-circle 48px) y Nombre (.skel-text 140x20px) */}
          <div className="mb-6 space-y-3">
            <SkeletonCircle className="w-12 h-12" />
            <SkeletonText className="w-[140px] h-[20px]" />
            <SkeletonText className="w-48 h-3.5 mt-1" />
          </div>

          {/* Ticket de Resumen en Skeleton */}
          <div className="ticket-on-ink bg-[#FFFFFF] text-[#211A26] rounded-2xl p-6 shadow-2xl relative my-6">
            <div className="text-center pb-2">
              <SkeletonText className="w-24 h-3 mx-auto" />
            </div>

            <div className="perforacion my-3" />

            <div className="space-y-3.5 py-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1">
                  <SkeletonText className="w-14 h-2.5" />
                  <SkeletonText className="w-32 h-4" />
                </div>
              ))}
            </div>

            <div className="perforacion my-3" />

            <div className="pt-1 flex items-baseline justify-between">
              <SkeletonText className="w-10 h-3" />
              <SkeletonText className="w-20 h-5" />
            </div>
          </div>
        </div>

        <p className="text-xs text-[#A39C8C] text-center font-sans pt-4">
          Reservas con <span className="text-grape font-semibold">Agendur</span>
        </p>
      </aside>

      {/* Columna Principal / Wizard */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-4xl flex flex-col justify-between">
        <div className="space-y-8">
          {/* Barra de Pasos */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <SkeletonCircle className="w-8 h-8" />
                    <SkeletonText className="w-14 h-3 hidden sm:inline" />
                  </div>
                  {idx < 3 && (
                    <div className="flex-1 h-0.5 mx-2 sm:mx-3 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Título de Paso */}
          <div className="space-y-1.5">
            <SkeletonText className="w-48 h-8" />
            <SkeletonText className="w-64 h-3.5" />
          </div>

          {/* Zona Fija: Calendario Completo sin dots */}
          <PortalCalendarSkeleton showAvailabilityDots={false} />

          {/* 3 Bloques para Servicios */}
          <div className="space-y-2 pt-2">
            <SkeletonText className="w-36 h-4" />
            <PortalServicesSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
