"use client";

import { Store, Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Store className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Barber Club & Spa</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">
            3 Sucursales Activas
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors relative"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-pulse" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-none">
              Administrador
            </p>
            <p className="text-[10px] text-slate-400">admin@barberclub.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
