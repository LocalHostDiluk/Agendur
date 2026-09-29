import React, { forwardRef } from "react";

export interface PendingBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  tooltip?: string;
}

export const PendingBadge = forwardRef<HTMLSpanElement, PendingBadgeProps>(
  function PendingBadge(
    {
      label = "Pendiente",
      tooltip = "Lógica pendiente de integración en backend",
      className = "",
      ...props
    },
    ref
  ) {
    const base =
      "inline-flex items-center gap-x-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-dashed border-amber-500/30 cursor-help transition-colors select-none";
    const classes = `${base} ${className}`.trim();

    return (
      <span
        ref={ref}
        title={tooltip}
        className={classes}
        {...props}
      >
        <span
          className="w-1 h-1 rounded-full bg-amber-500 animate-pulse shrink-0"
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
);

PendingBadge.displayName = "PendingBadge";
