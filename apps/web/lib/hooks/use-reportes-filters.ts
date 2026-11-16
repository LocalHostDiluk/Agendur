import { useState } from "react";
import { useSucursales } from "@/lib/hooks";
import type { RangoRapido } from "@/lib/utils/reportes-data";

export function useReportesFilters() {
  const [rangoRapido, setRangoRapido] = useState<RangoRapido>("30d");
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>("todas");

  const { data: sucursalesData } = useSucursales();

  return {
    rangoRapido,
    setRangoRapido,
    sucursalSeleccionada,
    setSucursalSeleccionada,
    sucursales: sucursalesData?.sucursales ?? [],
  };
}
