"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  emptySubscribe,
  getIsMacSnapshot,
  getServerIsMacSnapshot,
} from "@/lib/utils/shell-navigation";

export function useShellHeader() {
  const isMac = useSyncExternalStore(
    emptySubscribe,
    getIsMacSnapshot,
    getServerIsMacSnapshot,
  );
  const shortcutBadge = isMac ? "⌘K" : "Ctrl K";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-header-notifs]")) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    if (hasUnreadNotifications) {
      setHasUnreadNotifications(false);
    }
  };

  return {
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
  };
}
