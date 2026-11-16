"use client";

import { useCallback, useState, useEffect } from "react";
import {
  Sidebar,
  Header,
  MobileNavigation,
  ModalNuevaCitaManual,
} from "@/components/negocio";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useSucursales, useServicios } from "@/lib/hooks";
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapse";

function NegocioShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const { isCollapsed, toggleCollapse } = useSidebarCollapsed();

  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

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
