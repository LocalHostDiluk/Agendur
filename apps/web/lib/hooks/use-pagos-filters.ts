import { useState, useMemo } from "react";
import type { Transaccion } from "@/lib/utils/pagos-types";
import { TRANSACCIONES_MOCK } from "@/lib/utils/pagos-mock";

export function usePagosFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [metodoFilter, setMetodoFilter] = useState<string>("todos");
  const [selectedTx, setSelectedTx] = useState<Transaccion | null>(null);

  const transaccionesFiltradas = useMemo(() => {
    return TRANSACCIONES_MOCK.filter((tx) => {
      const matchSearch =
        tx.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.clienteEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.servicio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        estadoFilter === "todos" ? true : tx.estado === estadoFilter;

      const matchMetodo =
        metodoFilter === "todos" ? true : tx.metodo === metodoFilter;

      return matchSearch && matchEstado && matchMetodo;
    });
  }, [searchTerm, estadoFilter, metodoFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("todos");
    setMetodoFilter("todos");
  };

  return {
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    metodoFilter,
    setMetodoFilter,
    selectedTx,
    setSelectedTx,
    transaccionesFiltradas,
    totalCount: TRANSACCIONES_MOCK.length,
    resetFilters,
  };
}
