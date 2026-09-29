import React, { forwardRef } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "grape"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "text-success bg-success-soft border border-success/20",
  warning: "text-warning bg-warning-soft border border-warning/20",
  danger: "text-danger bg-danger-soft border border-danger/20",
  info: "text-grape bg-grape-soft border border-grape/20",
  grape: "text-grape bg-grape-soft border border-grape/20",
  neutral: "text-text-secondary bg-surface-alt border border-border",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-grape",
  grape: "bg-grape",
  neutral: "bg-text-secondary",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "py-0.5 px-2 text-xs",
  md: "py-1 px-2.5 text-xs",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "neutral",
    size = "md",
    dot = true,
    className = "",
    children,
    ...props
  },
  ref
) {
  const base = "inline-flex items-center gap-x-1.5 font-medium rounded-full select-none";
  const classes = `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  return (
    <span ref={ref} className={classes} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
