"use client";

import { useState } from "react";
import { useAuthMe, useSucursales, useServicios } from "@/lib/hooks";
import { useSucursalesMutations } from "@/lib/hooks/use-sucursales-mutations";
import {
  SucursalesHeader,
  SucursalesTabs,
  SucursalesBranchList,
  SucursalesServiceCatalog,
  SucursalesModals,
  type SucursalesTab,
} from "@/components/negocio/sucursales";
import type { SucursalWithPersonal } from "@/lib/utils/sucursales-formatters";
import type { Servicio } from "@/lib/types";

export default function SucursalesPage() {
  const [activeTab, setActiveTab] = useState<SucursalesTab>("sucursales");
  const [modalSucursalOpen, setModalSucursalOpen] = useState(false);
  const [modalServicioOpen, setModalServicioOpen] = useState(false);

  const { data: auth } = useAuthMe();
  const {
    data: sucursalesData,
    isLoading: loadingSucursales,
    isError: errorSucursales,
    refetch: refetchSucursales,
  } = useSucursales();
  const {
    data: serviciosData,
    isLoading: loadingServicios,
    isError: errorServicios,
    refetch: refetchServicios,
  } = useServicios();

  const {
    updatingServiceId,
    dialogProps,
    handleToggleServicioActivo,
    handleDeleteSucursal,
    handleDeleteServicio,
  } = useSucursalesMutations({ refetchSucursales, refetchServicios });

  const sucursales: SucursalWithPersonal[] = sucursalesData?.sucursales ?? [];
  const servicios: Servicio[] = serviciosData?.servicios ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SucursalesHeader
        activeTab={activeTab}
        onOpenModalSucursal={() => setModalSucursalOpen(true)}
        onOpenModalServicio={() => setModalServicioOpen(true)}
      />
      <SucursalesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sucursalesCount={sucursales.length}
        serviciosCount={servicios.length}
        loadingSucursales={loadingSucursales}
        loadingServicios={loadingServicios}
      />
      {activeTab === "sucursales" ? (
        <SucursalesBranchList
          sucursales={sucursales}
          isLoading={loadingSucursales}
          isError={errorSucursales}
          negocioSlug={auth?.negocio?.slug}
          onRetry={() => refetchSucursales()}
          onCreateFirst={() => setModalSucursalOpen(true)}
          onDelete={handleDeleteSucursal}
        />
      ) : (
        <SucursalesServiceCatalog
          servicios={servicios}
          isLoading={loadingServicios}
          isError={errorServicios}
          updatingServiceId={updatingServiceId}
          onRetry={() => refetchServicios()}
          onCreateFirst={() => setModalServicioOpen(true)}
          onToggleActivo={handleToggleServicioActivo}
          onDelete={handleDeleteServicio}
        />
      )}
      <SucursalesModals
        modalSucursalOpen={modalSucursalOpen}
        onCloseModalSucursal={() => setModalSucursalOpen(false)}
        modalServicioOpen={modalServicioOpen}
        onCloseModalServicio={() => setModalServicioOpen(false)}
        dialogProps={dialogProps}
      />
    </div>
  );
}
