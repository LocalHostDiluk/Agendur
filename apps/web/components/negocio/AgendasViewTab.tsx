"use client";

import type { ReactNode } from "react";

interface AgendasViewTabProps {
  selected: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}

export function AgendasViewTab({ selected, onClick, title, children }: AgendasViewTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-100 ease-out cursor-pointer min-h-[32px] ${
        selected
          ? "bg-surface text-text-primary shadow-xs font-semibold"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
