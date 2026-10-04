import { PersonalSkeletonBlock } from "./PersonalSkeletonBlock";
export function PersonalSkeletonCard() {
  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs"
    >
      <div className="space-y-3.5">
        <div className="flex items-start gap-3.5">
          <PersonalSkeletonBlock className="rounded-full w-12 h-12 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <PersonalSkeletonBlock className="h-4 w-32" />
              <PersonalSkeletonBlock className="h-4 w-12 rounded-full" />
            </div>
            <PersonalSkeletonBlock className="h-3 w-20" />
            <PersonalSkeletonBlock className="h-3 w-28" />
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <PersonalSkeletonBlock className="h-3 w-24" />
          <div className="flex flex-wrap gap-1.5">
            <PersonalSkeletonBlock className="h-6 w-20 rounded-md" />
            <PersonalSkeletonBlock className="h-6 w-24 rounded-md" />
            <PersonalSkeletonBlock className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <PersonalSkeletonBlock className="h-3 w-20" />
        <PersonalSkeletonBlock className="h-4 w-14 rounded" />
      </div>
    </div>
  );
}
