"use client";

import React from "react";
import Link from "next/link";

export interface ErrorAction {
  label: string;
  href?: string;
  onClick?: () => void;
  isExternal?: boolean;
}

export interface ErrorShellProps {
  title: string;
  description: string;
  code: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
  animation: React.ReactNode;
  background?: React.ReactNode;
  isLogoLink?: boolean;
}

/**
 * Shell compartido oficial de Páginas de Error Risográficas para Agendur (REGLA A.1 - A.6).
 * Fondo permanente --ink (#1D1720) sin toggle de tema ni variaciones de modo claro/oscuro.
 */
export function ErrorShell({
  title,
  description,
  code,
  primaryAction,
  secondaryAction,
  animation,
  background,
  isLogoLink = true,
}: ErrorShellProps) {
  const renderAction = (action: ErrorAction, isPrimary: boolean) => {
    const baseClasses =
      "inline-flex items-center justify-center py-[14px] px-[28px] rounded-[var(--radius-md,10px)] font-[family-name:var(--font-inter)] text-[15px] font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D1720] text-center w-full sm:w-auto";

    const primaryClasses = `${baseClasses} bg-[var(--grape,#6E49A6)] text-white hover:bg-[#5E3E8F] active:scale-[0.98] btn-ticket shadow-sm focus-visible:ring-[var(--grape,#6E49A6)]`;
    const secondaryClasses = `${baseClasses} bg-transparent text-[var(--text-on-ink,#F3EEDF)] border border-[var(--border-ink,rgba(243,238,223,0.15))] hover:bg-white/[0.06] hover:border-[rgba(243,238,223,0.30)] active:scale-[0.98] focus-visible:ring-[var(--border-ink,rgba(243,238,223,0.15))]`;

    const className = isPrimary ? primaryClasses : secondaryClasses;

    if (action.onClick) {
      return (
        <button
          key={action.label}
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
            key={action.label}
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
        <Link key={action.label} href={action.href} className={className}>
          {action.label}
        </Link>
      );
    }

    return (
      <span key={action.label} className={className}>
        {action.label}
      </span>
    );
  };

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center p-6 select-none overflow-hidden"
      style={{
        backgroundColor: "var(--ink, #1D1720)",
        color: "var(--text-on-ink, #F3EEDF)",
      }}
    >
      {/* REGLA A.4: Las 4 páginas llevan <meta name="robots" content="noindex"> */}
      <meta name="robots" content="noindex" />

      {/* Capa de fondo opcional (DotGrid, Squares, Noise) */}
      {background && (
        <div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          {background}
        </div>
      )}

      {/* REGLA A.6: Logo Agendur en la esquina superior izquierda (top 24px, left 24px) */}
      <div className="absolute top-6 left-6 z-20">
        {isLogoLink ? (
          <Link
            href="/"
            className="font-[family-name:var(--font-bricolage)] text-[20px] font-bold text-[var(--text-on-ink,#F3EEDF)] tracking-tight hover:opacity-85 transition-opacity"
            aria-label="Agendur inicio"
          >
            Agendur
          </Link>
        ) : (
          <span className="font-[family-name:var(--font-bricolage)] text-[20px] font-bold text-[var(--text-on-ink,#F3EEDF)] tracking-tight cursor-default">
            Agendur
          </span>
        )}
      </div>

      {/* Contenedor central */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[540px] w-full mx-auto my-auto py-10">
        {/* #2: Animación central (máx 280px desktop / 180px mobile) */}
        <div className="flex items-center justify-center w-full h-[180px] sm:h-[280px] max-h-[180px] sm:max-h-[280px]">
          {animation}
        </div>

        {/* #3: Título Bricolage Grotesque (32px/24px mobile, peso 700, mt 32px, centrado) */}
        <h1 className="mt-8 font-[family-name:var(--font-bricolage)] text-[24px] sm:text-[32px] font-bold text-[var(--text-on-ink,#F3EEDF)] leading-tight tracking-tight">
          {title}
        </h1>

        {/* #4: Descripción Inter 16px en --text-on-ink-soft, max-width: 420px, centrado, mt 12px */}
        <p className="mt-3 font-[family-name:var(--font-inter)] text-[16px] text-[var(--text-on-ink-soft,rgba(243,238,223,0.65))] max-w-[420px] mx-auto leading-relaxed">
          {description}
        </p>

        {/* #5: Fila de botones (gap 12px, mt 32px; en mobile columna 100%) */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          {renderAction(primaryAction, true)}
          {secondaryAction && renderAction(secondaryAction, false)}
        </div>

        {/* #6: Perforación horizontal de 240px con --border-ink, mt 48px */}
        <div
          className="mt-12 w-[240px] perforacion-ink"
          aria-hidden="true"
        />

        {/* #7: Código de pie Space Mono 12px, color --text-on-ink-muted, mt 16px, letter-spacing 0.1em */}
        <p className="mt-4 font-[family-name:var(--font-space-mono)] text-[12px] text-[var(--text-on-ink-muted,rgba(243,238,223,0.40))] tracking-[0.1em] uppercase select-text">
          {code}
        </p>
      </div>
    </main>
  );
}
