import { SkeletonBlock, SkeletonText } from "@/components/ui";

interface AgendasCitaSkeletonRowProps {
  i: number;
}

export function AgendasCitaSkeletonRow({ i }: AgendasCitaSkeletonRowProps) {
  return (
    <div
      key={i}
      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3.5 min-w-[200px]">
        <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <SkeletonText className="h-4 w-28" />
          <SkeletonText className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        <SkeletonText className="h-4 w-40" />
        <SkeletonText className="h-3 w-28" />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonText className="h-4 w-16" />
      </div>
    </div>
  );
}
