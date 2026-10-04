import { useMemo } from "react";
import {
  useAuthMe,
  useCatalogo,
  useSucursales,
  useServicios,
  useCitasNegocio,
  useProfesionales,
} from "@/lib/hooks";
import {
  combinarColaboradores,
  filtrarColaboradores,
  type UnifiedColaborador,
} from "@/lib/utils/personal-colaboradores";

interface UsePersonalDataParams {
  colaboradoresLocales: UnifiedColaborador[];
  selectedSucursalId: string;
  searchQuery: string;
}

export function usePersonalData({
  colaboradoresLocales,
  selectedSucursalId,
  searchQuery,
}: UsePersonalDataParams) {
  const { data: auth, isLoading: authLoading, isError: authError } = useAuthMe();

  const canReadStaff = Boolean(auth?.access?.capabilities.includes("staff:read"));
  const canWriteStaff = Boolean(auth?.access?.capabilities.includes("staff:write"));
  const canWriteBranches = Boolean(auth?.access?.capabilities.includes("branches:write"));

  const { data: profesionalesData, isLoading: profLoading, isError: profError, refetch: refetchProfesionales } = useProfesionales();
  const { data: catalogoData, isLoading: catLoading, isError: catError, refetch: refetchCatalogo } = useCatalogo(auth?.negocio?.slug);
  const { data: sucursalesData, isLoading: sucLoading, isError: sucError, refetch: refetchSucursales } = useSucursales();
  const { data: serviciosData } = useServicios();
  const { data: citasData } = useCitasNegocio();

  const sucursales = useMemo(() => sucursalesData?.sucursales ?? [], [sucursalesData?.sucursales]);
  const servicios = useMemo(() => serviciosData?.servicios ?? [], [serviciosData?.servicios]);
  const citas = useMemo(() => citasData?.citas ?? [], [citasData?.citas]);

  const todos = useMemo(
    () => combinarColaboradores(profesionalesData?.profesionales, catalogoData?.data?.profesionales, colaboradoresLocales),
    [profesionalesData, catalogoData, colaboradoresLocales],
  );

  const filtrados = useMemo(
    () => filtrarColaboradores(todos, selectedSucursalId, searchQuery, servicios),
    [todos, selectedSucursalId, searchQuery, servicios],
  );

  const isLoading = (authLoading || profLoading || catLoading || sucLoading) && !profesionalesData && !catalogoData;
  const isError = (authError || profError || catError || sucError) && !profesionalesData && !catalogoData;

  const handleRetryAll = () => {
    refetchProfesionales();
    refetchCatalogo();
    refetchSucursales();
  };

  return {
    auth, authLoading, canReadStaff, canWriteStaff, canWriteBranches,
    sucursales, servicios, citas, todos, filtrados,
    isLoading, isError, handleRetryAll,
  };
}
