import { Search, Filter, X } from "lucide-react";

interface PagosFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  estadoFilter: string;
  onEstadoChange: (val: string) => void;
  metodoFilter: string;
  onMetodoChange: (val: string) => void;
}

export function PagosFilterBar({
  searchTerm,
  onSearchChange,
  estadoFilter,
  onEstadoChange,
  metodoFilter,
  onMetodoChange,
}: PagosFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
      {/* Buscador */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por cliente, correo, servicio o ID..."
          className="w-full pl-9 pr-3.5 py-2 rounded-[var(--radius-sm)] bg-surface-alt border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[40px]"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filtros Dropdown */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Filter className="w-3.5 h-3.5" />
          <span>Estado:</span>
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="select-native px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape focus:ring-2 focus:ring-grape min-h-[40px]"
        >
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="reembolsado">Reembolsado</option>
        </select>

        <select
          value={metodoFilter}
          onChange={(e) => onMetodoChange(e.target.value)}
          className="select-native px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape focus:ring-2 focus:ring-grape min-h-[40px]"
        >
          <option value="todos">Todos los métodos</option>
          <option value="stripe">Stripe (Tarjeta)</option>
          <option value="transferencia">Transferencia SPEI</option>
          <option value="efectivo">Efectivo en Sede</option>
        </select>
      </div>
    </div>
  );
}
