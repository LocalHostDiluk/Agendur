"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Store, Calendar, LogOut, ExternalLink, ArrowLeft } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [negocioSlug, setNegocioSlug] = useState<string>("barber-club");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Obtener datos de negocio activo
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data?.negocio?.slug) {
          setNegocioSlug(json.data.negocio.slug);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const links = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sucursales", href: "/sucursales", icon: Store },
    { name: "Agendas & Citas", href: "/agendas", icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between p-4 shrink-0 min-h-screen transition-colors duration-200">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-3 pt-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-none">
                CitaSync
              </h2>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                Panel Negocio
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <link.icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Link
          href={`/reserva/${negocioSlug}`}
          target="_blank"
          className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <span>Ver Portal Cliente</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Volver a Landing
        </Link>
      </div>
    </aside>
  );
}
