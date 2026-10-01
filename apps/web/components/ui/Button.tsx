import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-grape text-white hover:opacity-90 active:scale-[0.98] transition-all",
  secondary:
    "bg-surface border border-border text-text-primary hover:bg-surface-alt active:scale-[0.98] transition-all",
  outline:
    "bg-transparent border border-border text-text-primary hover:bg-surface-alt active:scale-[0.98] transition-all",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary active:scale-[0.98] transition-all",
  danger: "bg-danger text-white hover:opacity-90 active:scale-[0.98] transition-all",
  destructive:
    "bg-danger text-white hover:opacity-90 active:scale-[0.98] transition-all",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
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
    "inline-flex items-center justify-center gap-x-2 font-medium rounded-[var(--radius-md)] duration-100 ease-out focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none select-none";
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

Button.displayName = "Button";
