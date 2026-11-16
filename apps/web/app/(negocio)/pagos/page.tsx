"use client";

import {
  PagosHeaderBanner,
  PagosKpiGrid,
  PagosFilterBar,
  PagosDesktopTable,
  PagosMobileList,
  PagosReceiptModal,
} from "@/components/negocio/pagos";
import { usePagosFilters } from "@/lib/hooks/use-pagos-filters";

export default function PagosPage() {
  const {
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    metodoFilter,
    setMetodoFilter,
    selectedTx,
    setSelectedTx,
    transaccionesFiltradas,
    totalCount,
    resetFilters,
  } = usePagosFilters();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      <PagosHeaderBanner />

      <PagosKpiGrid />

      <PagosFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        metodoFilter={metodoFilter}
        onMetodoChange={setMetodoFilter}
      />

      {/* Tabla de Transacciones Desktop (§5.5) / Cards Mobile (§8) */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
        <PagosDesktopTable
          transacciones={transaccionesFiltradas}
          onSelectTx={setSelectedTx}
          onResetFilters={resetFilters}
        />

        <PagosMobileList
          transacciones={transaccionesFiltradas}
          totalCount={totalCount}
          onSelectTx={setSelectedTx}
        />
      </div>

      <PagosReceiptModal
        selectedTx={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
