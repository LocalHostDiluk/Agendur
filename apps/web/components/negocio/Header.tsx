"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Store,
  Bell,
  X,
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { Blobatar } from "@blobatar/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui";
import { notify } from "@/lib/utils/toast";
import { useAuthMe, useSucursales } from "@/lib/hooks";

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
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);

  const { data: profile } = useAuthMe();
  const { data: sucursalesData } = useSucursales();

  const sucursales = sucursalesData?.sucursales ?? [];
  const sucursalesActivas = sucursales.length;

  const nombreNegocio = profile?.negocio?.nombre_comercial ?? "Mi Negocio";
  const email = profile?.user?.email ?? "";
  const nombrePersona =
    [profile?.perfil?.nombres, profile?.perfil?.apellidos]
      .filter(Boolean)
      .join(" ") ||
    email ||
    "Usuario";

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

  // Branch selector state
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("agendur_selected_sucursal_id") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("agendur_selected_sucursal_id");
        if (saved) setSelectedBranchId(saved);
      } catch {}
    };

    window.addEventListener("agendur:branch-change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("agendur:branch-change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const activeBranch =
    sucursales.find((s) => s.id === selectedBranchId) || sucursales[0];
  const activeBranchName = activeBranch?.nombre || nombreNegocio;

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // User menu & logout state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-header-branch]")) {
        setBranchDropdownOpen(false);
      }
      if (!target?.closest("[data-header-notifs]")) {
        setNotificationsOpen(false);
      }
      if (!target?.closest("[data-header-user]")) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

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

  return (
    <header className="h-16 sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
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
          className="hidden md:flex items-center justify-between gap-3 px-3 py-1.5 w-48 lg:w-60 rounded-lg bg-surface-alt/70 hover:bg-surface-alt border border-border/80 text-xs text-text-muted hover:text-text-secondary transition-all cursor-text focus:outline-hidden focus:border-grape/60"
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
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border/80 rounded font-medium shadow-2xs">
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

        {/* Branch / Sucursal selector (Desktop only) */}
        <div data-header-branch className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              if (sucursales.length > 1) {
                setBranchDropdownOpen((prev) => !prev);
              }
            }}
            className="flex items-center gap-x-2 px-2.5 py-1.5 rounded-lg border border-border/80 bg-surface-alt/70 text-xs hover:bg-surface-alt transition-colors focus:outline-hidden"
            aria-label="Sucursal actual"
            aria-haspopup={sucursales.length > 1 ? "listbox" : undefined}
            aria-expanded={branchDropdownOpen}
          >
            <Store className="w-4 h-4 text-grape shrink-0" strokeWidth={1.75} />
            <span className="font-medium text-text-primary truncate max-w-[120px] lg:max-w-[160px]">
              {activeBranchName}
            </span>
            <span className="text-border">|</span>
            <Badge
              variant="neutral"
              size="sm"
              className="font-normal text-[11px] bg-surface border border-border/60 text-text-secondary"
            >
              {sucursalesActivas} {sucursalesActivas === 1 ? "Sede" : "Sedes"}
            </Badge>
            {sucursales.length > 1 && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                  branchDropdownOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.75}
              />
            )}
          </button>

          {branchDropdownOpen && sucursales.length > 1 && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 py-1 bg-surface border border-border rounded-lg shadow-lg z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
              role="listbox"
            >
              {sucursales.map((sucursal) => (
                <button
                  key={sucursal.id}
                  type="button"
                  onClick={() => {
                    setSelectedBranchId(sucursal.id);
                    setBranchDropdownOpen(false);
                    try {
                      localStorage.setItem(
                        "agendur_selected_sucursal_id",
                        sucursal.id,
                      );
                      window.dispatchEvent(new Event("agendur:branch-change"));
                    } catch {}
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-alt transition-colors ${
                    sucursal.id === activeBranch?.id
                      ? "text-grape font-semibold bg-grape-soft/40"
                      : "text-text-primary"
                  }`}
                  role="option"
                  aria-selected={sucursal.id === activeBranch?.id}
                >
                  <span className="truncate">{sucursal.nombre}</span>
                  {sucursal.id === activeBranch?.id && (
                    <Check className="w-3.5 h-3.5 text-grape" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

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

        {/* User Account Menu with Blobatar Avatar (Desktop & Mobile) */}
        <div data-header-user className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-grape/30 transition-all focus:outline-hidden flex items-center justify-center"
            aria-label="Menú de usuario"
            aria-expanded={userMenuOpen}
            title={nombrePersona}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-grape-soft border border-grape/30 flex items-center justify-center shrink-0 shadow-2xs">
              <Blobatar name={email || nombrePersona || "Agendur"} size={32} />
            </div>
            <span className="sr-only">{nombrePersona}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 py-1.5 bg-surface border border-border rounded-xl shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Account Profile Header with Blobatar + Business + Name + Email */}
              <div className="px-3 py-2.5 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-grape-soft border border-grape/30 shrink-0 flex items-center justify-center shadow-2xs">
                  <Blobatar
                    name={email || nombrePersona || "Agendur"}
                    size={36}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary text-xs leading-tight truncate">
                    {nombrePersona}
                  </p>
                  <p className="text-[11px] text-grape leading-tight truncate mt-0.5 font-medium">
                    {nombreNegocio}
                  </p>
                  <p className="text-[10px] text-text-muted leading-tight truncate mt-0.5 font-mono">
                    {email}
                  </p>
                </div>
              </div>

              {/* Mobile Quick Settings: Sucursal switcher & Theme toggle */}
              <div className="md:hidden border-b border-border py-1">
                {sucursales.length > 1 && (
                  <div className="px-3 py-1.5">
                    <p className="text-[10px] uppercase font-semibold text-text-muted tracking-wider mb-1">
                      Sucursal activa
                    </p>
                    <div className="space-y-0.5">
                      {sucursales.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(s.id);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                            s.id === activeBranch?.id
                              ? "text-grape font-medium bg-grape-soft/50"
                              : "text-text-secondary hover:bg-surface-alt"
                          }`}
                        >
                          <span className="truncate">{s.nombre}</span>
                          {s.id === activeBranch?.id && (
                            <Check className="w-3 h-3 text-grape shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    Modo visual
                  </span>
                  <ThemeToggle />
                </div>
              </div>

              {/* Navigation links */}
              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/agendas"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
                >
                  Calendario
                </Link>
                <Link
                  href="/sucursales"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
                >
                  Servicios y sucursales
                </Link>
              </div>

              {/* Logout Action in Account Menu */}
              <div className="border-t border-border pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs text-[#D14343] hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>
                    {loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
