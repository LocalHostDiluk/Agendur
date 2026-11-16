"use client";

import { useState } from "react";
import { useUpdateServicio, useConfirmDialog } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";
import type { Sucursal, Servicio } from "@/lib/types";

interface UseSucursalesMutationsParams {
  refetchSucursales: () => unknown;
  refetchServicios: () => unknown;
}

async function deleteResource(endpoint: string, fallbackError: string) {
  const res = await fetch(endpoint, { method: "DELETE" });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || fallbackError);
  }
}

export function useSucursalesMutations({
  refetchSucursales,
  refetchServicios,
}: UseSucursalesMutationsParams) {
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);
  const confirmDialog = useConfirmDialog();
  const updateServicio = useUpdateServicio();

  const handleToggleServicioActivo = async (id: string, activoActual: boolean) => {
    try {
      setUpdatingServiceId(id);
      await updateServicio.mutateAsync({ id, activo: !activoActual });
      notify.success(
        !activoActual ? "Servicio activado" : "Servicio pausado",
        !activoActual
          ? "El servicio vuelve a estar disponible para reservas."
          : "El servicio ya no aparecerá en el portal de clientes.",
      );
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar el servicio.");
    } finally {
      setUpdatingServiceId(null);
    }
  };

  const handleDeleteSucursal = async (suc: Sucursal) => {
    const confirmado = await confirmDialog.confirm({
      type: "eliminar_sucursal",
      level: 2,
      targetName: suc.nombre,
      verificationText: suc.nombre,
    });
    if (!confirmado) return;
    try {
      const url = `/api/negocio/sucursales?id=${encodeURIComponent(suc.id)}`;
      await deleteResource(url, "Error al eliminar la sucursal.");
      notify.success("Sucursal eliminada", `La sucursal "${suc.nombre}" ha sido eliminada.`);
      refetchSucursales();
    } catch (err: unknown) {
      notify.error(err, "No se pudo eliminar la sucursal.");
    }
  };

  const handleDeleteServicio = async (serv: Servicio) => {
    const confirmado = await confirmDialog.confirm({
      type: "eliminar_servicio",
      level: 2,
      targetName: serv.nombre,
      verificationText: serv.nombre,
    });
    if (!confirmado) return;
    try {
      const url = `/api/negocio/servicios?id=${encodeURIComponent(serv.id)}`;
      await deleteResource(url, "Error al eliminar el servicio.");
      notify.success("Servicio eliminado", `El servicio "${serv.nombre}" ha sido eliminado.`);
      refetchServicios();
    } catch (err: unknown) {
      notify.error(err, "No se pudo eliminar el servicio.");
    }
  };

  return {
    updatingServiceId,
    dialogProps: confirmDialog.dialogProps,
    handleToggleServicioActivo,
    handleDeleteSucursal,
    handleDeleteServicio,
  };
}
