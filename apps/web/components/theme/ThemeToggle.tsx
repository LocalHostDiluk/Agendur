"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={
        theme === "dark"
          ? "Modo oscuro activo (clic para claro)"
          : "Modo claro activo (clic para oscuro)"
      }
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full bg-surface-alt border border-border p-0.5 transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-grape/30 select-none ${className}`}
    >
      {/* Background track icons */}
      <span
        className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none text-text-muted/60"
        aria-hidden="true"
      >
        <Sun className="w-3.5 h-3.5" strokeWidth={1.75} />
        <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
      </span>

      {/* Sliding thumb */}
      <span
        className={`relative z-10 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-surface shadow-xs border border-border/80 transition-transform duration-200 ease-in-out ${
          theme === "dark"
            ? "translate-x-7 text-grape"
            : "translate-x-0 text-text-primary"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3 h-3" strokeWidth={2.2} />
        ) : (
          <Sun className="w-3 h-3" strokeWidth={2.2} />
        )}
      </span>

      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
