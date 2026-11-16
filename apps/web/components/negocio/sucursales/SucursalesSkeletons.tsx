"use client";

import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

export function SucursalesLoadingSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse"
      data-testid="sucursales-loading"
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-surface border border-border space-y-4"
        >
          <div className="flex justify-between items-start">
            <SkeletonBlock className="w-10 h-10 rounded-xl" />
            <SkeletonBlock className="w-16 h-5 rounded-full" />
          </div>
          <div className="space-y-2">
            <SkeletonText className="w-3/4 h-5" />
            <SkeletonText className="w-full h-4" />
            <SkeletonText className="w-1/2 h-4" />
          </div>
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <SkeletonText className="w-24 h-4" />
            <SkeletonText className="w-16 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServiciosLoadingSkeleton() {
  return (
    <div
      className="rounded-2xl bg-surface border border-border p-6 space-y-4 animate-pulse"
      data-testid="servicios-loading"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex justify-between items-center py-3 border-b border-border last:border-0"
        >
          <div className="space-y-1.5 w-1/3">
            <SkeletonText className="h-4 w-3/4" />
            <SkeletonText className="h-3 w-1/2" />
          </div>
          <SkeletonText className="h-4 w-16" />
          <SkeletonText className="h-4 w-20" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
