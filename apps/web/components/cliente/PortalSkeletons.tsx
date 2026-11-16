import { SkeletonText, SkeletonCircle } from "@/components/ui/Skeleton";
import {
  PortalCalendarSkeleton,
  PortalServicesSkeleton,
} from "./PortalStepSkeletons";

export { PortalCalendarSkeleton, PortalServicesSkeleton };

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
      <header className="lg:hidden h-[72px] bg-[#1D1720] text-[#F3EEDF] px-4 flex items-center justify-between border-b border-[#F3EEDF]/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <SkeletonCircle className="w-8 h-8 shrink-0" />
          <SkeletonText className="w-[140px] h-[20px]" />
        </div>
        <span className="text-xs font-medium text-[#F3EEDF]/65 font-sans">
          Agendur
        </span>
      </header>

      <aside className="hidden lg:flex w-[380px] shrink-0 bg-[#1D1720] text-[#F3EEDF] p-8 flex-col justify-between min-h-screen sticky top-0 border-r border-[#F3EEDF]/10">
        <div>
          <div className="mb-6 space-y-3">
            <SkeletonCircle className="w-12 h-12" />
            <SkeletonText className="w-[140px] h-[20px]" />
            <SkeletonText className="w-48 h-3.5 mt-1" />
          </div>

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

      <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-4xl flex flex-col justify-between">
        <div className="space-y-8">
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

          <div className="space-y-1.5">
            <SkeletonText className="w-48 h-8" />
            <SkeletonText className="w-64 h-3.5" />
          </div>

          <PortalCalendarSkeleton showAvailabilityDots={false} />

          <div className="space-y-2 pt-2">
            <SkeletonText className="w-36 h-4" />
            <PortalServicesSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
