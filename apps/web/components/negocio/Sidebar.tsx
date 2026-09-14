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
  ChevronDown,
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
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("");

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

  const pendingOnboarding = profile?.onboardingStatus === "required";
  const nombreNegocio = profile?.negocio?.nombre_comercial || "Mi Negocio";

  const activeSucursal =
    sucursales.find((s) => s.id === selectedSucursalId) || sucursales[0];
  const activeSucursalName = activeSucursal?.nombre || "Sucursal Principal";

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

          {/* Branch Selector: Fixed icon coordinate at X=26px */}
          <div data-branch-selector className="relative">
            {isCollapsed ? (
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="w-full h-10 flex items-center px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A79FAE] hover:text-[#F1ECE2] transition-colors focus:outline-hidden"
                  aria-label={activeSucursalName}
                >
                  <Store
                    className="w-5 h-5 shrink-0 text-[#A79FAE]"
                    strokeWidth={1.75}
                  />
                </button>
                <div className="hidden md:block absolute left-full ml-3 top-1.5 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                  {activeSucursalName}
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen((prev) => !prev)}
                  className="w-full h-10 flex items-center justify-between gap-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#F1ECE2] transition-colors focus:outline-hidden"
                  aria-expanded={branchDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Seleccionar sucursal"
                >
                  <div className="flex items-center gap-3 truncate min-w-0">
                    <Store
                      className="w-5 h-5 text-[#A79FAE] shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="truncate font-medium text-xs">
                      {activeSucursalName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#A79FAE] shrink-0 transition-transform duration-200 ${
                      branchDropdownOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.75}
                  />
                </button>

                {branchDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 z-30 py-1 bg-[#1A1420] border border-white/10 rounded-lg shadow-xl text-xs"
                    role="listbox"
                  >
                    {sucursales.length > 0 ? (
                      sucursales.map((sucursal) => (
                        <button
                          key={sucursal.id}
                          type="button"
                          onClick={() => {
                            setSelectedSucursalId(sucursal.id);
                            setBranchDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                            sucursal.id === activeSucursal?.id
                              ? "text-[#F1ECE2] font-semibold bg-white/[0.04]"
                              : "text-[#A79FAE]"
                          }`}
                          role="option"
                          aria-selected={sucursal.id === activeSucursal?.id}
                        >
                          <span className="truncate">{sucursal.nombre}</span>
                          {sucursal.id === activeSucursal?.id && (
                            <Check
                              className="w-3.5 h-3.5 text-[#6E49A6]"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-[#A79FAE] text-xs">
                        {nombreNegocio}
                      </div>
                    )}
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
