import { Store, Sliders, Users, MessageSquare, CreditCard } from "lucide-react";
import type { ConfigTab } from "@/lib/constants/configuracion";

export interface ConfiguracionTabsNavProps {
  activeTab: "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion";
  onTabChange: (
    tab: "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion"
  ) => void;
}

export function ConfiguracionTabsNav({
  activeTab,
  onTabChange,
}: ConfiguracionTabsNavProps) {
  return (
    <div
      className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-full overflow-x-auto"
      role="tablist"
      aria-label="Pestañas de configuración"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "perfil"}
        onClick={() => onTabChange("perfil")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
          activeTab === "perfil"
            ? "bg-grape text-white shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
        }`}
      >
        <Store className="w-4 h-4" />
        <span>Perfil Comercial</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "politicas"}
        onClick={() => onTabChange("politicas")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
          activeTab === "politicas"
            ? "bg-grape text-white shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
        }`}
      >
        <Sliders className="w-4 h-4" />
        <span>Políticas y Reservas</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "usuarios"}
        onClick={() => onTabChange("usuarios")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
          activeTab === "usuarios"
            ? "bg-grape text-white shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Usuarios y roles</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "plantillas"}
        onClick={() => onTabChange("plantillas")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
          activeTab === "plantillas"
            ? "bg-grape text-white shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span>Plantillas de recordatorios</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "suscripcion"}
        onClick={() => onTabChange("suscripcion")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
          activeTab === "suscripcion"
            ? "bg-grape text-white shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
        }`}
      >
        <CreditCard className="w-4 h-4" />
        <span>Plan y facturación</span>
        <span className="sr-only"> (Plan y Suscripción)</span>
      </button>
    </div>
  );
}
