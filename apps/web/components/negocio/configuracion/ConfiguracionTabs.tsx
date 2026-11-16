import {
  Store,
  Sliders,
  Users,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import type { ActiveConfigTab } from "@/lib/utils/configuracion-constants";

export interface ConfiguracionTabsProps {
  activeTab: ActiveConfigTab;
  onChangeTab: (tab: ActiveConfigTab) => void;
}

export function ConfiguracionTabs({
  activeTab,
  onChangeTab,
}: ConfiguracionTabsProps) {
  return (
    <div
      className="scroll-fade-x flex items-center gap-1.5 p-1.5 bg-surface border border-border rounded-xl max-w-full overflow-x-auto"
      role="tablist"
      aria-label="Pestañas de configuración"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "perfil"}
        onClick={() => onChangeTab("perfil")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
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
        onClick={() => onChangeTab("politicas")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
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
        onClick={() => onChangeTab("usuarios")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
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
        onClick={() => onChangeTab("plantillas")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
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
        onClick={() => onChangeTab("suscripcion")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
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
