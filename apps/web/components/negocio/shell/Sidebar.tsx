"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuthMe, useSucursales } from "@/lib/hooks";
import { useShellActions } from "@/lib/hooks/use-shell-actions";
import { useShellBranch } from "@/lib/hooks/use-shell-branch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarBranchSelector } from "./SidebarBranchSelector";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((prev) => !prev);
  };

  const { data: profile } = useAuthMe();
  const { data: sucursalesData } = useSucursales();
  const sucursales = sucursalesData?.sucursales ?? [];

  const pendingOnboarding = profile?.onboardingStatus === "required";
  const nombreNegocio = profile?.negocio?.nombre_comercial || "Mi Negocio";
  const email = profile?.user?.email ?? "";
  const nombrePersona =
    [profile?.perfil?.nombres, profile?.perfil?.apellidos].filter(Boolean).join(" ") ||
    email ||
    "Usuario";

  const {
    branchDropdownOpen,
    setBranchDropdownOpen,
    handleSelectSucursal,
    activeSucursal,
    activeSucursalName,
  } = useShellBranch(sucursales, nombreNegocio);

  const { loggingOut, handleLogoutClick, handleSwitchBusiness, confirmDialogProps } =
    useShellActions();

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
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

      <aside
        className={`fixed inset-y-0 start-0 z-50 bg-sidebar-bg text-[#A79FAE] flex flex-col justify-between p-3.5 shrink-0 transform-gpu will-change-transform transition-[transform,width] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:duration-200 md:ease-in-out md:static md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-[264px] md:w-[72px]" : "w-[264px]"}`}
        aria-label="Navegación del panel"
      >
        <div className="space-y-4">
          <SidebarHeader
            isCollapsed={isCollapsed}
            onClose={onClose}
            availableBusinesses={profile?.availableBusinesses}
            activeBusinessId={profile?.negocio?.id}
            onSwitchBusiness={handleSwitchBusiness}
          />
          <SidebarBranchSelector
            sucursales={sucursales}
            activeSucursal={activeSucursal}
            activeSucursalName={activeSucursalName}
            nombreNegocio={nombreNegocio}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            branchDropdownOpen={branchDropdownOpen}
            setBranchDropdownOpen={setBranchDropdownOpen}
            onSelectSucursal={handleSelectSucursal}
            onCloseSidebar={onClose}
          />
          <SidebarNav pathname={pathname} isCollapsed={isCollapsed} onClose={onClose} />
        </div>

        <SidebarFooter
          pendingOnboarding={pendingOnboarding}
          isCollapsed={isCollapsed}
          onClose={onClose}
          email={email}
          nombrePersona={nombrePersona}
          nombreNegocio={nombreNegocio}
          loggingOut={loggingOut}
          onLogoutClick={handleLogoutClick}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
