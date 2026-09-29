"use client";

import { useCallback, useSyncExternalStore, useState, useEffect } from "react";
import { Sidebar } from "@/components/negocio/Sidebar";
import { Header } from "@/components/negocio/Header";
import { MobileNavigation } from "@/components/negocio/MobileNavigation";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useSucursales, useServicios } from "@/lib/hooks";

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

function NegocioShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const isCollapsed = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );

  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleCollapse = useCallback(() => {
    sidebarStore.toggle();
  }, []);

  // Manejar el evento personalizado agendur:open-new-appointment desde el FAB o cualquier origen
  useEffect(() => {
    const handleOpenAppointment = () => {
      setIsAppointmentModalOpen(true);
    };

    window.addEventListener("agendur:open-new-appointment", handleOpenAppointment);
    return () => {
      window.removeEventListener("agendur:open-new-appointment", handleOpenAppointment);
    };
  }, []);

  return (
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
        <main className="p-4 sm:p-6 lg:p-8 flex-1 pb-24 sm:pb-6">{children}</main>
      </div>

      {/* Navegación móvil inferior fija con los 5 accesos y FAB flotante */}
      <MobileNavigation
        onMenuToggle={toggleSidebar}
        onNewAppointment={() => setIsAppointmentModalOpen(true)}
      />

      {/* Modal de nueva cita manual activable desde el FAB o el evento global */}
      <ModalNuevaCitaManual
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        sucursales={sucursales}
        servicios={servicios}
      />
    </div>
  );
}

export default function NegocioLayout({ children }: LayoutProps<"/">) {
  return (
    <QueryProvider>
      <NegocioShell>{children}</NegocioShell>
    </QueryProvider>
  );
}
