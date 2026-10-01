import { SkeletonBlock, SkeletonCircle } from "@/components/ui";
import type { getWeekDays } from "@/lib/utils/agendas-data";

interface AgendasSemanaSkeletonDiaProps {
  item: ReturnType<typeof getWeekDays>[number];
}

export function AgendasSemanaSkeletonDia({ item }: AgendasSemanaSkeletonDiaProps) {
  return (
    <div
      key={item.ymd}
      className="rounded-[var(--radius-lg)] border border-border bg-surface flex flex-col min-h-[320px]"
    >
      <div className="p-3 border-b border-border text-center rounded-t-[var(--radius-lg)] bg-surface-alt/70">
        <span className="text-[11px] font-mono font-semibold text-text-secondary block">
          {item.dayName}
        </span>
        <span className="text-lg font-bricolage font-bold text-text-primary">
          {item.dayNumber}
        </span>
        <div className="flex justify-center items-center h-2 mt-1">
          <SkeletonCircle className="w-1 h-1" />
        </div>
      </div>
      <div className="p-2 space-y-2 flex-1">
        <SkeletonBlock className="h-16 w-full rounded-xl" />
        <SkeletonBlock className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
