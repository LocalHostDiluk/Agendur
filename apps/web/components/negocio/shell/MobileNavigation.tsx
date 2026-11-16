"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  BarChart3,
  Menu,
  Plus,
} from "lucide-react";

export interface MobileNavigationProps {
  onMenuToggle?: () => void;
  onNewAppointment?: () => void;
}

export function MobileNavigation({
  onMenuToggle,
  onNewAppointment,
}: MobileNavigationProps) {
  const pathname = usePathname();

  const handleNewAppointment = () => {
    if (onNewAppointment) {
      onNewAppointment();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agendur:open-new-appointment"));
    }
  };

  const navItems = [
    {
      name: "Inicio",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      name: "Calendario",
      href: "/agendas",
      icon: Calendar,
      isActive: pathname.startsWith("/agendas"),
    },
    {
      name: "Pagos",
      href: "/pagos",
      icon: CreditCard,
      isActive: pathname.startsWith("/pagos"),
    },
    {
      name: "Reportes",
      href: "/reportes",
      icon: BarChart3,
      isActive: pathname.startsWith("/reportes"),
    },
  ];

  return (
    <div className="block sm:hidden">
      {/* Botón flotante FAB para 'Nueva cita' (situado sobre la barra de pestañas fija) */}
      <button
        type="button"
        onClick={handleNewAppointment}
        className="fixed bottom-20 right-4 z-40 bg-grape text-white rounded-full p-3.5 shadow-lg active:scale-95 transition-all hover:bg-grape/90 focus:outline-hidden flex items-center justify-center cursor-pointer"
        aria-label="Nueva cita"
        title="Nueva cita"
      >
        <Plus className="w-6 h-6" strokeWidth={2.25} />
      </button>

      {/* Barra de navegación inferior fija (Bottom tab bar) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex items-center justify-around h-16 px-1 safe-area-bottom shadow-lg"
        aria-label="Navegación móvil inferior"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-inset ${
                item.isActive
                  ? "text-grape font-semibold"
                  : "text-text-muted hover:text-text-secondary font-medium"
              }`}
              aria-label={item.name}
              aria-current={item.isActive ? "page" : undefined}
            >
              <Icon
                className="w-5 h-5 shrink-0"
                strokeWidth={item.isActive ? 2.25 : 1.75}
              />
              <span className="text-[11px] leading-tight mt-1 truncate">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* 5. Menú / Más */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center flex-1 py-1 h-full text-text-muted hover:text-text-secondary font-medium transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Más opciones"
        >
          <Menu className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          <span className="text-[11px] leading-tight mt-1 truncate">Más</span>
        </button>
      </nav>
    </div>
  );
}
