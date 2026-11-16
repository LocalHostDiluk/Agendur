"use client";

import { useCallback, useSyncExternalStore } from "react";

const COLLAPSE_STORAGE_KEY = "agendur_sidebar_collapsed";

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const sidebarStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    const handleStorage = (event: StorageEvent) => {
      if (event.key === COLLAPSE_STORAGE_KEY) {
        listener();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      window.removeEventListener("storage", handleStorage);
    };
  },
  getSnapshot(): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  },
  getServerSnapshot(): boolean {
    return false;
  },
  toggle() {
    try {
      const next = !sidebarStore.getSnapshot();
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      emitChange();
    } catch {
      // Ignorar en entornos restringidos
    }
  },
};

export function useSidebarCollapsed() {
  const isCollapsed = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );

  const toggleCollapse = useCallback(() => {
    sidebarStore.toggle();
  }, []);

  return { isCollapsed, toggleCollapse };
}
