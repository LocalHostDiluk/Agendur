"use client";

import { useEffect, useState } from "react";
import type { ShellSucursal } from "@/lib/utils/shell-navigation";

export function useShellBranch(
  sucursales: ShellSucursal[],
  nombreNegocio: string,
) {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>(() => {
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

  const handleSelectSucursal = (id: string) => {
    setSelectedSucursalId(id);
    setBranchDropdownOpen(false);
    try {
      localStorage.setItem("agendur_selected_sucursal_id", id);
      window.dispatchEvent(new Event("agendur:branch-change"));
    } catch {}
  };

  const activeSucursal =
    sucursales.find((s) => s.id === selectedSucursalId) || sucursales[0];
  const activeSucursalName =
    activeSucursal?.nombre ||
    (sucursales.length === 0 ? nombreNegocio : "Sucursal Principal");

  return {
    branchDropdownOpen,
    setBranchDropdownOpen,
    handleSelectSucursal,
    activeSucursal,
    activeSucursalName,
  };
}
