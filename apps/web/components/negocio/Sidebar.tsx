"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Calendar,
  LogOut,
  ExternalLink,
  ArrowLeft,
  X,
} from "lucide-react";
import { notify } from "@/lib/utils/toast";
import { Badge } from "@/components/ui";
import { useAuthMe } from "@/lib/hooks";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { data: profile } = useAuthMe();
  const negocioSlug = profile?.negocio?.slug;

  // Cerrar drawer con tecla Escape cuando esté abierto
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo cerrar la sesión.");
      }
      notify.success("Sesión cerrada", "Has cerrado sesión correctamente.");
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      notify.error(err, "No se pudo cerrar la sesión.");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const links = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sucursales", href: "/sucursales", icon: Store },
    { name: "Agendas & Citas", href: "/agendas", icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-neutral-900/80 backdrop-blur-xs md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 ease-in-out md:static md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegación del panel"
      >
        <div className="space-y-6">
          {/* Brand & Mobile Close Button */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-x-2.5 focus:outline-hidden"
            >
              <div className="size-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Calendar className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-base leading-none">
                  CitaSync
                </h2>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium tracking-wide">
                  Panel Negocio
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 focus:outline-hidden transition-colors"
              aria-label="Cerrar navegación"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-hidden ${
                    isActive
                      ? "bg-gray-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <link.icon
                    className={`size-4.5 shrink-0 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-neutral-400"
                    }`}
                  />
                  <span>{link.name}</span>
                  {isActive && (
                    <Badge
                      variant="info"
                      size="sm"
                      className="ms-auto py-0 px-1.5 text-[10px] font-semibold"
                    >
                      Activo
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-2">
          <Link
            href={negocioSlug ? `/reserva/${negocioSlug}` : "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-750 border border-gray-200 dark:border-neutral-700 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-x-2">
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>Ver Portal Cliente</span>
            </span>
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">
              En vivo
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-x-2.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <LogOut className="size-4 shrink-0" />
            <span>{loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-x-2 px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="size-3 shrink-0" />
            <span>Volver a Landing</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
