import { SkeletonBlock, SkeletonText } from "@/components/ui";
import type { getWeekDays } from "@/lib/utils/agendas-data";
import { AgendasCitaSkeletonRow } from "./AgendasCitaSkeletonRow";
import { AgendasSemanaSkeletonDia } from "./AgendasSemanaSkeletonDia";

interface AgendasLoadingProps {
  viewMode: "cronograma" | "semanal" | "mensual";
  weekDays: ReturnType<typeof getWeekDays>;
}

export function AgendasLoading({ viewMode, weekDays }: AgendasLoadingProps) {
  return (
    <>
      {viewMode === "cronograma" && (
        <div
          className="divide-y divide-border rounded-[var(--radius-lg)] bg-surface border border-border overflow-hidden shadow-xs animate-pulse"
          data-testid="agenda-loading"
        >
          {[1, 2, 3, 4, 5].map((i) => (<AgendasCitaSkeletonRow key={i} i={i} />))}
        </div>
      )}

      {viewMode === "semanal" && (
        <div
          className="grid grid-cols-1 md:grid-cols-7 gap-3 animate-pulse"
          data-testid="agenda-loading"
        >
          {weekDays.map((item) => (<AgendasSemanaSkeletonDia key={item.ymd} item={item} />))}
        </div>
      )}

      {viewMode === "mensual" && (
        <div
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 space-y-4 animate-pulse shadow-xs"
          data-testid="agenda-loading"
        >
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-border text-center">
            {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((dayName) => (
              <SkeletonText key={dayName} className="h-3 w-8 mx-auto" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-md)] border border-border p-2 min-h-[90px] flex flex-col justify-between"
              >
                <SkeletonText className="h-4 w-6" />
                <div className="space-y-1 mt-auto">
                  <SkeletonBlock className="h-3 w-full rounded" />
                  <SkeletonBlock className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
