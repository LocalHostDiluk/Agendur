import React from "react";
import Link from "next/link";

export interface ErrorAction {
  label: string;
  href?: string;
  onClick?: () => void;
  isExternal?: boolean;
}

export function ErrorShellActionButton({
  action,
  isPrimary,
}: {
  action: ErrorAction;
  isPrimary: boolean;
}) {
  const baseClasses =
    "inline-flex items-center justify-center py-[14px] px-[28px] rounded-[var(--radius-md,10px)] font-[family-name:var(--font-inter)] text-[15px] font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D1720] text-center w-full sm:w-auto";

  const primaryClasses = `${baseClasses} bg-[var(--grape,#6E49A6)] text-white hover:bg-[#5E3E8F] active:scale-[0.98] btn-ticket shadow-sm focus-visible:ring-[var(--grape,#6E49A6)]`;
  const secondaryClasses = `${baseClasses} bg-transparent text-[var(--text-on-ink,#F3EEDF)] border border-[var(--border-ink,rgba(243,238,223,0.15))] hover:bg-white/[0.06] hover:border-[rgba(243,238,223,0.30)] active:scale-[0.98] focus-visible:ring-[var(--border-ink,rgba(243,238,223,0.15))]`;

  const className = isPrimary ? primaryClasses : secondaryClasses;

  if (action.onClick) {
    return (
      <button
        type="button"
        onClick={action.onClick}
        className={className}
      >
        {action.label}
      </button>
    );
  }

  if (action.href) {
    const isExternal =
      action.isExternal ||
      action.href.startsWith("mailto:") ||
      action.href.startsWith("http");

    if (isExternal) {
      return (
        <a
          href={action.href}
          className={className}
          rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
          target={action.href.startsWith("http") ? "_blank" : undefined}
        >
          {action.label}
        </a>
      );
    }

    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return <span className={className}>{action.label}</span>;
}

export function ErrorShellDecorations({
  background,
  isLogoLink = true,
}: {
  background?: React.ReactNode;
  isLogoLink?: boolean;
}) {
  return (
    <>
      {background && (
        <div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          {background}
        </div>
      )}

      <div className="absolute top-6 left-6 z-20">
        {isLogoLink ? (
          <Link
            href="/"
            className="brand-mark text-[22px] text-[var(--text-on-ink,#F3EEDF)] tracking-tight hover:opacity-90 transition-opacity"
            aria-label="Agendur inicio"
          >
            <span>A</span>gendur
          </Link>
        ) : (
          <span
            className="brand-mark text-[22px] text-[var(--text-on-ink,#F3EEDF)] tracking-tight cursor-default"
            aria-label="Agendur"
          >
            <span>A</span>gendur
          </span>
        )}
      </div>
    </>
  );
}
