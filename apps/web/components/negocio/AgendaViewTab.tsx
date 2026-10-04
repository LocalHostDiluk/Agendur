"use client";

import type { ReactNode } from "react";

interface AgendaViewTabProps {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}

export function AgendaViewTab({ active, onClick, title, children }: AgendaViewTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-100 ease-out cursor-pointer min-h-[32px] ${
        active
          ? "bg-surface text-text-primary shadow-xs font-semibold"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
