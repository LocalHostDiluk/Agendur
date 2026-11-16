"use client";

import Link from "next/link";
import { Store, Check, ExternalLink } from "lucide-react";
import type { ShellSucursal } from "@/lib/utils/shell-navigation";

export interface SidebarBranchDropdownProps {
  sucursales: ShellSucursal[];
  activeSucursal?: ShellSucursal;
  nombreNegocio: string;
  onSelectSucursal: (id: string) => void;
  onCloseDropdown: () => void;
  onCloseSidebar?: () => void;
}

export function SidebarBranchDropdown({
  sucursales,
  activeSucursal,
  nombreNegocio,
  onSelectSucursal,
  onCloseDropdown,
  onCloseSidebar,
}: SidebarBranchDropdownProps) {
  return (
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
                onClick={() => onSelectSucursal(sucursal.id)}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99CE8] ${
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
                    <Store className="w-3.5 h-3.5" strokeWidth={1.75} />
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
            <p className="font-medium text-[#F1ECE2]">{nombreNegocio}</p>
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
          onCloseDropdown();
          if (onCloseSidebar) onCloseSidebar();
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#A79FAE] hover:text-[#F1ECE2] hover:bg-white/[0.06] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99CE8]"
      >
        <div className="size-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[#A79FAE] group-hover:text-[#6E49A6] group-hover:bg-[#6E49A6]/10 transition-colors shrink-0">
          <Store className="size-3.5" strokeWidth={1.75} />
        </div>
        <span className="flex-1 truncate">Gestionar sucursales</span>
        <ExternalLink className="size-3 text-[#A79FAE]/50 group-hover:text-[#F1ECE2] transition-colors shrink-0" />
      </Link>
    </div>
  );
}
