"use client";

import { useEffect, useState } from "react";
import { Store, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface UserProfile {
  email: string;
  nombreNegocio: string;
  sucursalesActivas: number;
}

export function Header() {
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
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors duration-200">
      {/* Left: Business Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
            {profile.nombreNegocio}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-[11px] whitespace-nowrap">
            {profile.sucursalesActivas} {profile.sucursalesActivas === 1 ? "Sede" : "Sedes"}
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle & Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none truncate max-w-[160px]">
              {profile.nombreNegocio}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
              {profile.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
