"use client";

import Link from "next/link";
import { X } from "lucide-react";

export interface SidebarHeaderProps {
  isCollapsed: boolean;
  onClose?: () => void;
  availableBusinesses?: Array<{ id: string; nombre: string }>;
  activeBusinessId?: string;
  onSwitchBusiness: (negocioId: string) => Promise<void>;
}

export function SidebarHeader({
  isCollapsed,
  onClose,
  availableBusinesses,
  activeBusinessId,
  onSwitchBusiness,
}: SidebarHeaderProps) {
  return (
    <>
      {/* Top Logo */}
      <div className="h-9 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="brand-mark font-bricolage text-[#F1ECE2] group relative px-1.5 py-0.5 text-[22px] leading-none tracking-tight focus:outline-hidden"
          aria-label="Agendur Inicio"
        >
          <span className="transition-transform duration-150 group-hover:scale-[1.03]">A</span>
          <span
            className={`text-[#F1ECE2] overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
              isCollapsed
                ? "max-w-[120px] md:max-w-0 md:opacity-0 md:-translate-x-1"
                : "max-w-[120px] opacity-100 translate-x-0"
            }`}
          >
            gendur
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

      {/* Business Switcher */}
      {(availableBusinesses?.length ?? 0) > 1 && (
        <label className="block text-xs">
          Negocio activo
          <select
            aria-label="Negocio activo"
            value={activeBusinessId ?? ""}
            className="mt-1 w-full rounded bg-[#17121B] p-2 text-white"
            onChange={(event) => onSwitchBusiness(event.target.value)}
          >
            {availableBusinesses?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}
