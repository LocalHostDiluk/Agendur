"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const emptySubscribe = () => () => {};

function getIsMacSnapshot(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)
  );
}

function getServerIsMacSnapshot(): boolean {
  return false;
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Inicio";
  if (pathname.startsWith("/agendas")) return "Calendario";
  if (pathname.startsWith("/sucursales")) return "Servicios y sucursales";
  if (pathname.startsWith("/personal")) return "Personal";
  if (pathname.startsWith("/pagos")) return "Pagos y facturación";
  if (pathname.startsWith("/reportes")) return "Reportes";
  if (pathname.startsWith("/configuracion")) return "Configuración";
  return "Inicio";
}

export function Header({
  onMenuToggle,
  isSidebarCollapsed = false,
  onToggleCollapse,
}: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  // Client OS detection for shortcut badge (Ctrl K on Windows/Linux, ⌘K on macOS)
  const isMac = useSyncExternalStore(
    emptySubscribe,
    getIsMacSnapshot,
    getServerIsMacSnapshot,
  );
  const shortcutBadge = isMac ? "⌘K" : "Ctrl K";

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-header-notifs]")) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <header className="h-16 sticky top-0 z-30 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Search Bar Fullscreen Overlay when active on Mobile */}
      {isSearchOpen ? (
        <div className="absolute inset-x-0 inset-y-0 bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-3 z-40 animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-grape shrink-0" strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar citas, clientes, servicios o sedes..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsSearchOpen(false);
                setSearchQuery("");
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded bg-surface-alt"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      ) : null}

      {/* Left: Mobile Menu Toggle / Desktop Collapse Toggle + Page Title */}
      <div className="flex items-center gap-x-2.5 sm:gap-x-3.5">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
            title={
              isSidebarCollapsed
                ? "Expandir barra lateral"
                : "Colapsar barra lateral"
            }
            aria-label={
              isSidebarCollapsed
                ? "Expandir barra lateral"
                : "Colapsar barra lateral"
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="w-5 h-5" strokeWidth={1.75} />
            )}
          </button>
        )}

        <h1 className="font-bricolage text-lg sm:text-xl font-semibold text-text-primary leading-none tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Streamlined controls (Desktop full / Mobile uncluttered) */}
      <div className="flex items-center gap-x-2.5 sm:gap-x-3">
        {/* Desktop Visible Search Trigger with dynamic Ctrl K / ⌘K */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center justify-between gap-3 px-3 py-1.5 w-48 lg:w-60 rounded-lg bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs text-text-muted hover:text-text-secondary transition-all cursor-text focus:outline-hidden focus:border-grape/60"
          aria-label="Buscar citas, clientes o servicios (Ctrl+K o ⌘K)"
          title="Buscar (Ctrl+K o ⌘K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search
              className="w-4 h-4 text-text-muted shrink-0"
              strokeWidth={1.75}
            />
            <span className="truncate">Buscar...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border rounded font-medium shadow-2xs">
            {shortcutBadge}
          </kbd>
        </button>

        {/* Mobile Search Button (Icon only) */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
          aria-label="Buscar"
          title="Buscar"
        >
          <Search className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Theme Toggle (Desktop only) */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Notification Bell with --flame badge (Desktop & Mobile) */}
        <div data-header-notifs className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              if (hasUnreadNotifications) {
                setHasUnreadNotifications(false);
              }
            }}
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} />
            {hasUnreadNotifications && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame ring-2 ring-surface"
                aria-label="Notificaciones sin leer"
              />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 p-3 bg-surface border border-border rounded-lg shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border font-semibold text-text-primary">
                <span>Notificaciones</span>
                <span className="text-[10px] text-text-muted">
                  Centro de avisos
                </span>
              </div>
              <div className="py-3 text-center text-text-secondary">
                <p className="font-medium text-text-primary">Todo al día</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  No tienes avisos urgentes en este momento.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
