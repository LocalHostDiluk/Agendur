import React, { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 dark:focus:bg-neutral-600",
  outline:
    "border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-100 focus:bg-gray-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:focus:bg-neutral-800",
  ghost:
    "text-gray-800 hover:bg-gray-100 focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-xs",
  md: "py-2.5 px-4 text-sm",
  lg: "py-3 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-x-2 font-medium rounded-lg transition-colors focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none";
  const classes = `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={classes}
      {...props}
    >
      {isLoading && (
        <span
          className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-current rounded-full"
          role="status"
          aria-label="cargando"
        />
      )}
      {children}
    </button>
  );
});
