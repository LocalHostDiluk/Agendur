"use client";

import type { ComponentProps } from "react";
import { ModalNuevaSucursal } from "@/components/negocio/ModalNuevaSucursal";
import { ModalNuevoServicio } from "@/components/negocio/ModalNuevoServicio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SucursalesModalsProps {
  modalSucursalOpen: boolean;
  onCloseModalSucursal: () => void;
  modalServicioOpen: boolean;
  onCloseModalServicio: () => void;
  dialogProps: ComponentProps<typeof ConfirmDialog>;
}

export function SucursalesModals({
  modalSucursalOpen,
  onCloseModalSucursal,
  modalServicioOpen,
  onCloseModalServicio,
  dialogProps,
}: SucursalesModalsProps) {
  return (
    <>
      <ModalNuevaSucursal
        isOpen={modalSucursalOpen}
        onClose={onCloseModalSucursal}
      />

      <ModalNuevoServicio
        isOpen={modalServicioOpen}
        onClose={onCloseModalServicio}
      />

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
