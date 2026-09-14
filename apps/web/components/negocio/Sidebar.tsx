"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  Store,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Check,
  X,
} from "lucide-react";
import { notify } from "@/lib/utils/toast";
import { useAuthMe, useSucursales } from "@/lib/hooks";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navModules = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    disabled: false,
  },
  {
    name: "Calendario",
    href: "/agendas",
    icon: Calendar,
    disabled: false,
  },
  {
    name: "Servicios y sucursales",
    href: "/sucursales",
    icon: Store,
    disabled: false,
  },
  {
    name: "Personal",
    href: "#",
    icon: Users,
    disabled: true,
    badge: "Pronto",
  },
  {
    name: "Pagos y facturación",
    href: "#",
    icon: CreditCard,
    disabled: true,
    badge: "Pronto",
  },
  {
    name: "Reportes",
    href: "#",
    icon: BarChart3,
    disabled: true,
    badge: "Pronto",
  },
  {
    name: "Configuración",
    href: "#",
    icon: Settings,
    disabled: true,
    badge: "Pronto",
  },
];

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("agendur_selected_sucursal_id") || "";
    } catch {
      return "";
    }
  });

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const { data: profile } = useAuthMe();
  const { data: sucursalesData } = useSucursales();
  const sucursales = sucursalesData?.sucursales ?? [];

  // Sincronizar sucursal activa con eventos del sistema
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("agendur_selected_sucursal_id");
        if (saved) setSelectedSucursalId(saved);
      } catch {}
    };

    window.addEventListener("agendur:branch-change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("agendur:branch-change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleSelectSucursal = (id: string) => {
    setSelectedSucursalId(id);
    setBranchDropdownOpen(false);
    try {
      localStorage.setItem("agendur_selected_sucursal_id", id);
      window.dispatchEvent(new Event("agendur:branch-change"));
    } catch {}
  };

  const pendingOnboarding = profile?.onboardingStatus === "required";
  const nombreNegocio = profile?.negocio?.nombre_comercial || "Mi Negocio";

  const activeSucursal =
    sucursales.find((s) => s.id === selectedSucursalId) || sucursales[0];
  const activeSucursalName =
    activeSucursal?.nombre ||
    (sucursales.length === 0 ? nombreNegocio : "Sucursal Principal");

  // Cerrar drawer con tecla Escape cuando esté abierto en móvil
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

  // Cerrar dropdown de sucursal al hacer click fuera
  useEffect(() => {
    if (!branchDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-branch-selector]")) {
        setBranchDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [branchDropdownOpen]);

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
    <>
      {/* Mobile Backdrop Overlay with AnimatePresence: Clean 60fps fade in and fade out */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container: 60fps GPU accelerated, smooth 320ms ease-out on mobile drawer, 200ms ease-in-out on desktop collapse */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 bg-[#110D15] text-[#A79FAE] flex flex-col justify-between p-3.5 shrink-0 transform-gpu will-change-transform transition-[transform,width] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:duration-200 md:ease-in-out md:static md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-[264px] md:w-[72px]" : "w-[264px]"}`}
        aria-label="Navegación del panel"
      >
        <div className="space-y-4">
          {/* Top Logo */}
          <div className="h-8 flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="group relative flex items-center px-3 py-1 focus:outline-hidden"
              aria-label="Agendur Inicio"
            >
              <span className="font-bricolage font-bold text-[22px] text-[#F1ECE2] leading-none tracking-tight flex items-center">
                <span>A</span>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
                    isCollapsed
                      ? "max-w-[120px] md:max-w-0 md:opacity-0 md:-translate-x-1"
                      : "max-w-[120px] opacity-100 translate-x-0"
                  }`}
                >
                  gendur
                </span>
              </span>
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                  Agendur
                </div>
              )}
            </Link>

            {/* Close button for mobile drawer */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-[#A79FAE] hover:text-[#F1ECE2] hover:bg-white/[0.04] focus:outline-hidden transition-colors"
              aria-label="Cerrar navegación"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          {/* Branch Selector: Sleek workspace/branch switcher */}
          <div data-branch-selector className="relative">
            {isCollapsed ? (
              <div className="relative group flex justify-center">
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="size-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#6E49A6]/40 text-[#D1BEE8] transition-all focus:outline-hidden relative group/btn"
                  aria-label={activeSucursalName}
                >
                  <div className="size-7 rounded-lg bg-[#6E49A6]/20 flex items-center justify-center text-[#D1BEE8]">
                    <Store className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#46B88A] ring-2 ring-[#110D15]"
                    aria-hidden="true"
                  />
                </button>
                <div className="hidden md:block absolute left-full ml-3 top-0 px-3 py-2 bg-[#17121B] border border-white/15 text-xs text-[#F1ECE2] rounded-xl shadow-2xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans min-w-[140px]">
                  <p className="font-semibold text-xs text-[#F1ECE2] truncate">
                    {activeSucursalName}
                  </p>
                  <p className="text-[10px] text-[#A79FAE] truncate mt-0.5">
                    {activeSucursal?.ciudad ||
                      (activeSucursal?.es_matriz
                        ? "Sede Matriz"
                        : nombreNegocio)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen((prev) => !prev)}
                  className={`group w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left transition-all duration-150 focus:outline-hidden ${
                    branchDropdownOpen
                      ? "bg-white/[0.06] border-[#6E49A6]/50 ring-1 ring-[#6E49A6]/30 shadow-md"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20"
                  }`}
                  aria-expanded={branchDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Seleccionar sucursal"
                >
                  {/* Left: Avatar + Indicator */}
                  <div className="relative size-8 rounded-lg bg-gradient-to-br from-[#6E49A6]/25 to-[#6E49A6]/10 border border-[#6E49A6]/30 flex items-center justify-center text-[#D1BEE8] shrink-0 shadow-inner">
                    <Store className="w-4 h-4" strokeWidth={1.75} />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#46B88A] ring-2 ring-[#110D15]"
                      title="Sucursal activa"
                    />
                  </div>

                  {/* Middle: Business & Branch name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 leading-none mb-0.5">
                      <span className="text-[10px] font-semibold text-[#A79FAE]/80 uppercase tracking-wider truncate">
                        {nombreNegocio}
                      </span>
                      {activeSucursal?.es_matriz && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 leading-none shrink-0">
                          Matriz
                        </span>
                      )}
                    </div>
                    <span className="block font-semibold text-xs text-[#F1ECE2] truncate leading-tight group-hover:text-white transition-colors">
                      {activeSucursalName}
                    </span>
                  </div>

                  {/* Right: Chevrons */}
                  <ChevronsUpDown
                    className={`w-3.5 h-3.5 text-[#A79FAE]/70 shrink-0 transition-colors ${
                      branchDropdownOpen
                        ? "text-[#F1ECE2]"
                        : "group-hover:text-[#F1ECE2]"
                    }`}
                    strokeWidth={1.75}
                  />
                </button>

                {/* Dropdown Popover */}
                {branchDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1.5 z-50 p-1.5 bg-[#17121B] border border-white/15 rounded-xl shadow-2xl backdrop-blur-md text-xs"
                    role="listbox"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 mb-1">
                      <span className="text-[10px] font-semibold text-[#A79FAE]/70 uppercase tracking-wider">
                        Sucursales
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-[#A79FAE]">
                        {sucursales.length > 0
                          ? `${sucursales.length} ${sucursales.length === 1 ? "sede" : "sedes"}`
                          : "1 sede"}
                      </span>
                    </div>

                    {/* List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 py-0.5">
                      {sucursales.length > 0 ? (
                        sucursales.map((sucursal) => {
                          const isSelected = sucursal.id === activeSucursal?.id;
                          return (
                            <button
                              key={sucursal.id}
                              type="button"
                              onClick={() => handleSelectSucursal(sucursal.id)}
                              className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2.5 transition-colors ${
                                isSelected
                                  ? "bg-[#6E49A6]/15 text-[#F1ECE2]"
                                  : "text-[#A79FAE] hover:bg-white/[0.06] hover:text-[#F1ECE2]"
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`size-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                                    isSelected
                                      ? "bg-[#6E49A6]/25 border border-[#6E49A6]/40 text-[#D1BEE8]"
                                      : "bg-white/[0.04] border border-white/5 text-[#A79FAE]"
                                  }`}
                                >
                                  <Store
                                    className="w-3.5 h-3.5"
                                    strokeWidth={1.75}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`truncate text-xs ${
                                        isSelected
                                          ? "font-semibold text-[#F1ECE2]"
                                          : "font-medium"
                                      }`}
                                    >
                                      {sucursal.nombre}
                                    </span>
                                    {sucursal.es_matriz && (
                                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 leading-none shrink-0">
                                        Matriz
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#A79FAE]/70 truncate block mt-0.5">
                                    {sucursal.direccion ||
                                      sucursal.ciudad ||
                                      "Ubicación activa"}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check
                                  className="w-3.5 h-3.5 text-[#6E49A6] shrink-0"
                                  strokeWidth={2}
                                />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-2.5 text-center text-[#A79FAE] text-xs">
                          <p className="font-medium text-[#F1ECE2]">
                            {nombreNegocio}
                          </p>
                          <p className="text-[10px] text-[#A79FAE]/70 mt-0.5">
                            Sucursal principal
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer action to manage branches */}
                    <div className="my-1 border-t border-white/10" />
                    <Link
                      href="/sucursales"
                      onClick={() => {
                        setBranchDropdownOpen(false);
                        if (onClose) onClose();
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#A79FAE] hover:text-[#F1ECE2] hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="size-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[#A79FAE] group-hover:text-[#6E49A6] group-hover:bg-[#6E49A6]/10 transition-colors shrink-0">
                        <Store className="size-3.5" strokeWidth={1.75} />
                      </div>
                      <span className="flex-1 truncate">
                        Gestionar sucursales
                      </span>
                      <ExternalLink className="size-3 text-[#A79FAE]/50 group-hover:text-[#F1ECE2] transition-colors shrink-0" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7 Navigation Modules */}
          <nav className="space-y-1" aria-label="Módulos de navegación">
            {navModules.map((item) => {
              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-3 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed select-none px-3 py-2.5 h-10 w-full text-[#A79FAE]"
                    aria-disabled="true"
                  >
                    <item.icon
                      className="w-5 h-5 shrink-0 text-[#A79FAE]"
                      strokeWidth={1.75}
                    />
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out flex items-center gap-2 ${
                        isCollapsed
                          ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                          : "max-w-[160px] opacity-100 translate-x-0"
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-[#A79FAE]">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {isCollapsed && (
                      <div className="hidden md:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 items-center gap-1.5 font-sans font-normal">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-[#A79FAE]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-x-3 rounded-lg text-sm font-medium transition-colors focus:outline-hidden px-3 py-2.5 h-10 w-full ${
                    isActive
                      ? "bg-[rgba(110,73,166,0.12)] text-[#A79FAE]"
                      : "text-[#A79FAE] hover:bg-white/[0.04]"
                  }`}
                  aria-label={item.name}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6E49A6] rounded-r"
                      aria-hidden="true"
                    />
                  )}
                  <item.icon
                    className="w-5 h-5 shrink-0 text-[#A79FAE]"
                    strokeWidth={1.75}
                  />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
                      isCollapsed
                        ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                        : "max-w-[160px] opacity-100 translate-x-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isCollapsed && (
                    <div className="hidden md:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 items-center gap-1.5 font-sans font-normal">
                      <span>{item.name}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Onboarding status + User + Logout + Collapse Toggle */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          {pendingOnboarding && (
            <Link
              href="/onboarding"
              onClick={onClose}
              className="group relative flex items-center gap-x-3 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-[#A79FAE] hover:bg-white/[0.08] hover:text-[#F1ECE2] border border-white/10 transition-colors w-full"
              aria-label="Completar configuración del negocio"
            >
              <ExternalLink
                className="w-5 h-5 shrink-0 text-[#6E49A6]"
                strokeWidth={1.75}
              />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out flex items-center justify-between gap-2 flex-1 ${
                  isCollapsed
                    ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                    : "max-w-[160px] opacity-100 translate-x-0"
                }`}
              >
                <span>Completar negocio</span>
                <span className="text-[10px] text-[#A79FAE]/70 uppercase tracking-wider font-semibold">
                  Pendiente
                </span>
              </span>
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                  Completar negocio (Pendiente)
                </div>
              )}
            </Link>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full group relative flex items-center gap-x-3 px-3 py-2 text-xs font-medium text-[#A79FAE] hover:text-[#D14343] hover:bg-white/[0.04] rounded-lg transition-colors disabled:opacity-50 focus:outline-hidden"
            aria-label="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
                isCollapsed
                  ? "max-w-[140px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                  : "max-w-[140px] opacity-100 translate-x-0"
              }`}
            >
              {loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            </span>
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                Cerrar Sesión
              </div>
            )}
          </button>

          {/* Collapse / Expand Toggle Button (Desktop only) */}
          <div className="hidden md:flex pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="w-full group relative flex items-center gap-x-3 px-3 py-2 text-xs font-medium text-[#A79FAE] hover:text-[#F1ECE2] hover:bg-white/[0.04] rounded-lg transition-colors focus:outline-hidden"
              aria-label={
                isCollapsed
                  ? "Expandir barra lateral"
                  : "Colapsar barra lateral"
              }
            >
              {isCollapsed ? (
                <>
                  <PanelLeftOpen
                    className="w-5 h-5 shrink-0"
                    strokeWidth={1.75}
                  />
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                    Expandir menú
                  </div>
                </>
              ) : (
                <>
                  <PanelLeftClose
                    className="w-5 h-5 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out max-w-[140px] opacity-100">
                    Colapsar menú
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
