import React, { forwardRef } from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
  neutral: "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "py-0.5 px-2 text-xs",
  md: "py-1 px-2.5 text-xs",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "neutral",
    size = "md",
    className = "",
    children,
    ...props
  },
  ref
) {
  const base = "inline-flex items-center gap-x-1.5 font-medium rounded-full";
  const classes = `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  return (
    <span ref={ref} className={classes} {...props}>
      {children}
    </span>
  );
});
Badge.displayName = "Badge";
