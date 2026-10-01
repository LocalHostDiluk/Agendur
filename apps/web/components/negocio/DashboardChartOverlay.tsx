import type { ReactNode } from "react";

interface DashboardChartOverlayProps {
  children: ReactNode;
}

export function DashboardChartOverlay({ children }: DashboardChartOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto backdrop-blur-[2px] bg-surface/92 border border-border rounded-xl px-4 py-3 shadow-xs max-w-xs text-center space-y-2">
        {children}
      </div>
    </div>
  );
}
