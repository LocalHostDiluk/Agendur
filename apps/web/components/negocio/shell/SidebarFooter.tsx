"use client";

import Link from "next/link";
import { LogOut, ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Blobatar } from "@blobatar/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export interface SidebarFooterProps {
  pendingOnboarding: boolean;
  isCollapsed: boolean;
  onClose?: () => void;
  email: string;
  nombrePersona: string;
  nombreNegocio: string;
  loggingOut: boolean;
  onLogoutClick: () => void;
  onToggleCollapse: () => void;
}

export function SidebarFooter({
  pendingOnboarding,
  isCollapsed,
  onClose,
  email,
  nombrePersona,
  nombreNegocio,
  loggingOut,
  onLogoutClick,
  onToggleCollapse,
}: SidebarFooterProps) {
  return (
    <div className="pt-3 border-t border-border-ink border-white/10 space-y-2">
      <div className="flex md:hidden items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-[#A79FAE]">
        <span>Cambiar tema</span>
        <ThemeToggle />
      </div>
      {pendingOnboarding && (
        <Link
          href="/onboarding"
          onClick={onClose}
          className="group relative flex items-center gap-x-3 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-[#A79FAE] hover:bg-white/[0.08] hover:text-[#F1ECE2] border border-white/10 transition-colors w-full"
          aria-label="Completar configuración del negocio"
        >
          <ExternalLink className="w-5 h-5 shrink-0 text-[#6E49A6]" strokeWidth={1.75} />
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

      {/* User Profile Info */}
      <div className={`group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg ${isCollapsed ? "justify-center" : ""}`}>
        <div className="size-8 rounded-full overflow-hidden bg-grape-soft border border-grape/30 flex items-center justify-center shrink-0 shadow-2xs">
          <Blobatar name={email || nombrePersona || "Agendur"} size={32} />
        </div>
        <div
          className={`min-w-0 flex-1 overflow-hidden transition-all duration-200 ease-in-out ${
            isCollapsed
              ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
              : "max-w-[160px] opacity-100 translate-x-0"
          }`}
        >
          <p className="text-xs font-semibold text-sidebar-text truncate leading-tight">{nombrePersona}</p>
          <p className="text-[10px] text-sidebar-text-muted truncate leading-tight mt-0.5">{email || nombreNegocio}</p>
        </div>
        {isCollapsed && (
          <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1.5 bg-[#17121B] border border-white/10 text-xs text-sidebar-text rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
            <p className="font-semibold text-xs text-[#F1ECE2]">{nombrePersona}</p>
            {email && <p className="text-[10px] text-sidebar-text-muted">{email}</p>}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogoutClick}
        disabled={loggingOut}
        className="w-full group relative flex items-center gap-x-3 px-3 py-2 text-xs font-medium text-sidebar-text-muted hover:text-[#D14343] hover:bg-white/[0.04] rounded-lg transition-colors disabled:opacity-50 focus:outline-hidden cursor-pointer"
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

      {/* Collapse / Expand Toggle Button */}
      <div className="hidden md:flex pt-1 border-t border-border-ink border-white/10">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full group relative flex items-center gap-x-3 px-3 py-2 text-xs font-medium text-[#A79FAE] hover:text-[#F1ECE2] hover:bg-white/[0.04] rounded-lg transition-colors focus:outline-hidden"
          aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {isCollapsed ? (
            <>
              <PanelLeftOpen className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans">
                Expandir menú
              </div>
            </>
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span className="overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out max-w-[140px] opacity-100">
                Colapsar menú
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
