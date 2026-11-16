"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getPageTitle } from "@/lib/utils/shell-navigation";
import { useShellHeader } from "@/lib/hooks/use-shell-header";
import { HeaderSearchOverlay } from "./HeaderSearchOverlay";
import { HeaderNotifications } from "./HeaderNotifications";

export interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({
  onMenuToggle,
  isSidebarCollapsed = false,
  onToggleCollapse,
}: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const {
    shortcutBadge,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    closeSearch,
    notificationsOpen,
    hasUnreadNotifications,
    toggleNotifications,
  } = useShellHeader();

  return (
    <header className="h-16 sticky top-0 z-30 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      <HeaderSearchOverlay
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClose={closeSearch}
        inputRef={searchInputRef}
      />

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
          className="xl:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
          aria-label="Buscar"
          title="Buscar"
        >
          <Search className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Theme Toggle (Desktop only) */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Notification Bell with --flame badge (Desktop & Mobile) */}
        <HeaderNotifications
          notificationsOpen={notificationsOpen}
          hasUnreadNotifications={hasUnreadNotifications}
          onToggle={toggleNotifications}
        />
      </div>
    </header>
  );
}
