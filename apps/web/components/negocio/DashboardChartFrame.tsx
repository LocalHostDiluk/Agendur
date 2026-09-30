import { CartesianGrid } from "recharts";
import type { ReactNode } from "react";

interface DashboardChartFrameProps {
  ariaLabel: string;
  descriptionId: string;
  title: string;
  summary: ReactNode;
  subtitle: ReactNode;
  controls: ReactNode;
  description: ReactNode;
  children: ReactNode;
}

export function DashboardChartFrame({ ariaLabel, descriptionId, title, summary, subtitle, controls, description, children }: DashboardChartFrameProps) {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs min-w-0 space-y-4"
      role="region"
      aria-label={ariaLabel}
      aria-describedby={descriptionId}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bricolage font-semibold text-base text-text-primary">
              {title}
            </h2>
            <span className="text-xs font-mono font-bold text-grape bg-grape-soft px-2 py-0.5 rounded-md tabular-nums">
              {summary}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {subtitle}
          </p>
        </div>
        {controls}
      </div>
      <p id={descriptionId} className="sr-only">
        {description}
      </p>
      {children}
    </div>
  );
}

export function getDashboardChartGrid() {
  return (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
  );
}
