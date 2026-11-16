"use client";

import { useState, useEffect } from "react";
import { useCrearReserva } from "@/lib/hooks/use-reserva";
import { useAuthMe, useCatalogo } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils/toast";
import type { Sucursal, Servicio } from "@/lib/types";
import {
  getDefaultSucursalId, getDefaultServicioId, getTodayIsoDate, resolveProfesionalId,
} from "@/lib/utils/cita-manual-helpers";

interface UseCitaManualFormArgs {
  isOpen: boolean;
  onClose: () => void;
  initialFecha?: string;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onSuccess?: () => void;
}

export function useCitaManualForm({
  isOpen, onClose, initialFecha, sucursales, servicios, onSuccess,
}: UseCitaManualFormArgs) {
  const queryClient = useQueryClient();
  const crearReserva = useCrearReserva();
  const { data: auth } = useAuthMe();
  const { data: catalogoData } = useCatalogo(auth?.negocio?.slug);

  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("");
  const [selectedServicioId, setSelectedServicioId] = useState<string>("");
  const [selectedFecha, setSelectedFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("09:00");
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteApellido, setClienteApellido] = useState<string>("");
  const [clientePhone, setClientePhone] = useState<string>("");
  const [clienteEmail, setClienteEmail] = useState<string>("");
  const [notasCliente, setNotasCliente] = useState<string>("");

  const sucursalId = selectedSucursalId || getDefaultSucursalId(sucursales);
  const servicioId = selectedServicioId || getDefaultServicioId(servicios);
  const fecha = selectedFecha || initialFecha || getTodayIsoDate();

  const resetForm = () => {
    setClienteNombre(""); setClienteApellido(""); setClientePhone(""); setClienteEmail("");
    setNotasCliente(""); setSelectedSucursalId(""); setSelectedServicioId(""); setSelectedFecha(""); setHora("09:00");
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursalId || !servicioId || !fecha || !hora || !clienteNombre.trim() || !clienteApellido.trim() || !clientePhone.trim()) {
      notify.warning("Campos incompletos", "Por favor completa todos los campos requeridos para agendar.");
      return;
    }

    const profesionalId = resolveProfesionalId(
      catalogoData?.data?.profesionales ?? [], sucursalId, servicioId, auth?.negocio?.id,
    );

    try {
      await crearReserva.mutateAsync({
        sucursalId, servicioId, profesionalId,
        clienteNombre: clienteNombre.trim(), clienteApellido: clienteApellido.trim(),
        clientePhone: clientePhone.trim() || undefined, clienteEmail: clienteEmail.trim() || undefined,
        fecha, hora, notasCliente: notasCliente.trim() || undefined, aceptaPrivacidad: true,
      });
      notify.success("Cita agendada", "La cita se ha registrado en la agenda.");
      queryClient.invalidateQueries({ queryKey: ["negocio", "citas"] });
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo agendar la cita manual.");
    }
  };

  return {
    sucursalId, setSelectedSucursalId, servicioId, setSelectedServicioId, fecha, setSelectedFecha,
    hora, setHora, clienteNombre, setClienteNombre, clienteApellido, setClienteApellido,
    clientePhone, setClientePhone, clienteEmail, setClienteEmail, notasCliente, setNotasCliente,
    isSubmitting: crearReserva.isPending, handleSubmit,
  };
}
