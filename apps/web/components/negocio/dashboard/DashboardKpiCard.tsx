"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface DashboardKpiCardProps {
  title: string;
  icon: ReactNode;
  delay: number;
  highlighted?: boolean;
  truncate?: boolean;
  metric: ReactNode;
  status: ReactNode;
  footer: ReactNode;
}

export function DashboardKpiCard({
  title, icon, delay,
  highlighted, truncate,
  metric, status, footer,
}: DashboardKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay, ease: [0.16, 1, 0.3, 1] }}
      className={highlighted
        ? "bg-grape-soft/60 border border-grape/30 rounded-xl p-5 shadow-xs space-y-3 transition-colors relative"
        : "bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3 transition-colors"}
    >
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-[13px] font-medium tracking-normal text-text-secondary">
          {title}
        </span>
        <div className={highlighted
          ? "w-8 h-8 rounded-lg bg-grape/10 text-grape flex items-center justify-center shrink-0"
          : "w-8 h-8 rounded-lg bg-surface-alt text-text-secondary flex items-center justify-center shrink-0"}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={truncate
          ? "font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none truncate"
          : "font-mono text-[32px] font-bold tabular-nums text-text-primary leading-none"}>
          {metric}
        </span>
        {status}
      </div>
      {footer}
    </motion.div>
  );
}
