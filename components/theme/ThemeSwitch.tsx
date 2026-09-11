"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({ className = "" }: ThemeSwitchProps) {
  const { setTheme } = useTheme();

  return (
    <div
      className={`hidden sm:flex fixed top-4 right-3 sm:right-5 z-50 ${className}`}
    >
      {/* Theme Switch */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className="hs-dark-mode hs-dark-mode-active:hidden flex items-center gap-x-2 py-2 px-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full text-sm font-medium text-gray-800 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-600 focus:outline-hidden focus:text-gray-900 dark:focus:text-white shadow-xs hover:shadow-sm backdrop-blur-xs transition-all cursor-pointer"
        aria-label="Cambiar a modo oscuro"
      >
        <Moon className="shrink-0 size-4.5 text-indigo-600 dark:text-indigo-400" />
        <span className="font-medium">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        className="hs-dark-mode hs-dark-mode-active:inline-flex hidden items-center gap-x-2 py-2 px-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full text-sm font-medium text-gray-800 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-600 focus:outline-hidden focus:text-gray-900 dark:focus:text-white shadow-xs hover:shadow-sm backdrop-blur-xs transition-all cursor-pointer"
        aria-label="Cambiar a modo claro"
      >
        <Sun className="shrink-0 size-4.5 text-amber-500 dark:text-amber-400" />
        <span className="font-medium">Light</span>
      </button>
      {/* End Theme Switch */}
    </div>
  );
}
