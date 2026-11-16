"use client";

import { Store, ChevronsUpDown } from "lucide-react";
import type { ShellSucursal } from "@/lib/utils/shell-navigation";
import { SidebarBranchDropdown } from "./SidebarBranchDropdown";

export interface SidebarBranchSelectorProps {
  sucursales: ShellSucursal[];
  activeSucursal?: ShellSucursal;
  activeSucursalName: string;
  nombreNegocio: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  branchDropdownOpen: boolean;
  setBranchDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectSucursal: (id: string) => void;
  onCloseSidebar?: () => void;
}

export function SidebarBranchSelector({
  sucursales,
  activeSucursal,
  activeSucursalName,
  nombreNegocio,
  isCollapsed,
  onToggleCollapse,
  branchDropdownOpen,
  setBranchDropdownOpen,
  onSelectSucursal,
  onCloseSidebar,
}: SidebarBranchSelectorProps) {
  return (
    <div data-branch-selector className="relative">
      {sucursales.length <= 1 ? (
        <div
          className={`group relative flex items-center gap-2.5 p-2 rounded-xl border border-white/10 bg-white/[0.03] ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-[#6E49A6]/25 to-[#6E49A6]/10 border border-[#6E49A6]/30 flex items-center justify-center text-[#D1BEE8] shrink-0 shadow-inner">
            <Store className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className={`min-w-0 flex-1 ${isCollapsed ? "max-w-0 overflow-hidden md:max-w-0" : ""}`}>
            {activeSucursal && (
              <span className="block text-[10px] font-semibold text-[#A79FAE]/80 uppercase tracking-wider truncate">
                {nombreNegocio}
              </span>
            )}
            <span className="block font-semibold text-xs text-[#F1ECE2] truncate leading-tight">
              {activeSucursalName}
            </span>
          </div>
          {isCollapsed && (
            <>
              <span className="sr-only">Sucursal: {activeSucursalName}</span>
              <div className="hidden md:block absolute left-full ml-3 top-0 px-3 py-2 bg-[#17121B] border border-white/15 text-xs text-[#F1ECE2] rounded-xl shadow-2xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans min-w-[140px]">
                <p className="font-semibold text-xs text-[#F1ECE2] truncate">{activeSucursalName}</p>
              </div>
            </>
          )}
        </div>
      ) : isCollapsed ? (
        <div className="relative group flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="size-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#6E49A6]/40 text-[#D1BEE8] transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#B99CE8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#110D15] relative group/btn"
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
            <p className="font-semibold text-xs text-[#F1ECE2] truncate">{activeSucursalName}</p>
            <p className="text-[10px] text-[#A79FAE] truncate mt-0.5">
              {activeSucursal?.ciudad || (activeSucursal?.es_matriz ? "Sede Matriz" : nombreNegocio)}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setBranchDropdownOpen((prev) => !prev)}
            className={`group w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#B99CE8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#110D15] ${
              branchDropdownOpen
                ? "bg-white/[0.06] border-[#6E49A6]/50 ring-1 ring-[#6E49A6]/30 shadow-md"
                : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20"
            }`}
            aria-expanded={branchDropdownOpen}
            aria-haspopup="listbox"
            aria-label="Seleccionar sucursal"
          >
            <div className="relative size-8 rounded-lg bg-gradient-to-br from-[#6E49A6]/25 to-[#6E49A6]/10 border border-[#6E49A6]/30 flex items-center justify-center text-[#D1BEE8] shrink-0 shadow-inner">
              <Store className="w-4 h-4" strokeWidth={1.75} />
              <span
                className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#46B88A] ring-2 ring-[#110D15]"
                title="Sucursal activa"
              />
            </div>

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

            <ChevronsUpDown
              className={`w-3.5 h-3.5 text-[#A79FAE]/70 shrink-0 transition-colors ${
                branchDropdownOpen ? "text-[#F1ECE2]" : "group-hover:text-[#F1ECE2]"
              }`}
              strokeWidth={1.75}
            />
          </button>

          {branchDropdownOpen && (
            <SidebarBranchDropdown
              sucursales={sucursales}
              activeSucursal={activeSucursal}
              nombreNegocio={nombreNegocio}
              onSelectSucursal={onSelectSucursal}
              onCloseDropdown={() => setBranchDropdownOpen(false)}
              onCloseSidebar={onCloseSidebar}
            />
          )}
        </div>
      )}
    </div>
  );
}
