"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Calendar, ArrowLeft } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sucursales", href: "/sucursales", icon: Store },
    { name: "Agendas & Citas", href: "/agendas", icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-none">
                CitaSync
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Panel Negocio
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <link.icon
                  className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          href="/reserva/barber-club"
          target="_blank"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
        >
          Ver Portal Cliente ↗
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Landing Page
        </Link>
      </div>
    </aside>
  );
}
