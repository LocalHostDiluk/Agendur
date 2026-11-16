"use client";

import { Search, X } from "lucide-react";

export interface HeaderSearchOverlayProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function HeaderSearchOverlay({
  isOpen,
  searchQuery,
  onSearchQueryChange,
  onClose,
  inputRef,
}: HeaderSearchOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 inset-y-0 bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-3 z-40 animate-in fade-in duration-150">
      <Search className="w-4 h-4 text-grape shrink-0" strokeWidth={2} />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        placeholder="Buscar citas, clientes, servicios o sedes..."
        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchQueryChange("")}
          className="text-xs text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded bg-surface-alt"
        >
          Limpiar
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
        aria-label="Cerrar búsqueda"
      >
        <X className="w-5 h-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
