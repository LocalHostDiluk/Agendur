import { PersonalSkeletonCard } from "./PersonalSkeletonCard";
export function PersonalLoading() {
  return (
    <div className="space-y-4 animate-pulse" data-testid="personal-loading">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PersonalSkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
