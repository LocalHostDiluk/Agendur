"use client";

import { useEffect, useState } from "react";
import { Store, User, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui";

export interface HeaderProps {
  onMenuToggle?: () => void;
}

interface UserProfile {
  email: string;
  nombreNegocio: string;
  sucursalesActivas: number;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [profile, setProfile] = useState<UserProfile>({
    email: "admin@empresa.com",
    nombreNegocio: "CitaSync Negocio",
    sucursalesActivas: 1,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          setProfile({
            email: json.data.user?.email || "admin@empresa.com",
            nombreNegocio: json.data.negocio?.nombre_comercial || "Mi Negocio",
            sucursalesActivas: 1,
          });
        }
      })
      .catch(() => {});

    // Consultar cantidad de sucursales
    fetch("/api/negocio/sucursales")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.sucursales)) {
          setProfile((prev) => ({
            ...prev,
            sucursalesActivas: json.sucursales.length || 1,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-neutral-900/80 border-b border-gray-200 dark:border-neutral-700 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile Menu Toggle & Business Pill */}
      <div className="flex items-center gap-x-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 focus:outline-hidden transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-x-2.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-800/60 text-xs">
          <Store className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-medium text-gray-800 dark:text-neutral-200 truncate max-w-[120px] sm:max-w-[200px]">
            {profile.nombreNegocio}
          </span>
          <span className="text-gray-300 dark:text-neutral-600">|</span>
          <Badge variant="neutral" size="sm" className="font-normal text-[11px]">
            {profile.sucursalesActivas} {profile.sucursalesActivas === 1 ? "Sede" : "Sedes"}
          </Badge>
        </div>
      </div>

      {/* Right: Theme Toggle & Profile */}
      <div className="flex items-center gap-x-3">
        <ThemeToggle />

        <div className="h-6 w-px bg-gray-200 dark:bg-neutral-700" />

        <div className="flex items-center gap-x-2.5">
          <div className="size-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center font-semibold text-xs shrink-0">
            <User className="size-4" />
          </div>
          <div className="hidden sm:block text-start">
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none truncate max-w-[150px]">
              {profile.nombreNegocio}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate max-w-[150px] mt-0.5">
              {profile.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
