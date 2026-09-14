"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { Sidebar } from "@/components/negocio/Sidebar";
import { Header } from "@/components/negocio/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";

const COLLAPSE_STORAGE_KEY = "agendur_sidebar_collapsed";

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const sidebarStore = {
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

export default function NegocioLayout({ children }: LayoutProps<"/">) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCollapsed = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleCollapse = useCallback(() => {
    sidebarStore.toggle();
  }, []);

  return (
    <QueryProvider>
      <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onMenuToggle={toggleSidebar}
            isSidebarCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />
          <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
