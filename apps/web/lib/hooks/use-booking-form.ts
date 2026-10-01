"use client";

import { useState, type FormEvent } from "react";
import { useCrearReserva } from "./use-reserva";
import { ApiClientError } from "@/lib/query/api-client";
import { triggerBookingConfetti } from "@/lib/utils/confetti";
import type { Cita, Negocio, Sucursal, Servicio } from "@/lib/types";

export interface UseBookingFormOptions {
  negocio?: Negocio | null;
  sucursalActiva?: Sucursal;
  servicioActivo?: Servicio;
  profesionalActivo?: { id: string };
  profesionalesDisponibles?: Array<{ id: string }>;
  fecha: string;
  horaDisponible: string;
  onSlotConflict?: () => Promise<void> | void;
}

export function useBookingForm({
  negocio, sucursalActiva, servicioActivo, profesionalActivo,
  profesionalesDisponibles = [], fecha, horaDisponible, onSlotConflict,
}: UseBookingFormOptions) {
  const reserva = useCrearReserva();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [cancelacion, setCancelacion] = useState(false);
  const [error, setError] = useState("");
  const [cita, setCita] = useState<Cita | null>(null);
  const [showCancelInfo, setShowCancelInfo] = useState(false);

  const isDatosValid = Boolean(
    nombre.trim() && apellido.trim() &&
    (!negocio?.email_cliente_requerido || email.trim()) &&
    (!negocio?.telefono_cliente_requerido || telefono.trim()) &&
    privacidad && (!negocio?.politica_cancelacion?.trim() || cancelacion),
  );

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!negocio || !sucursalActiva || !servicioActivo || !fecha || !horaDisponible) {
      setError("Por favor completa todos los pasos de la cita antes de confirmar.");
      return;
    }
    const profIdFinal = profesionalActivo?.id || profesionalesDisponibles[0]?.id;
    if (!profIdFinal) {
      setError("No hay personal disponible para este servicio en esta fecha.");
      return;
    }

    try {
      const result = await reserva.mutateAsync({
        sucursalId: sucursalActiva.id,
        servicioId: servicioActivo.id,
        profesionalId: profIdFinal,
        fecha,
        hora: horaDisponible,
        clienteNombre: nombre.trim(),
        clienteApellido: apellido.trim(),
        clientePhone: telefono.trim() || null,
        clienteEmail: email.trim() || null,
        notasCliente: negocio.notas_cliente_habilitadas ? notas.trim() : undefined,
        aceptaPrivacidad: privacidad,
        aceptaPoliticaCancelacion: cancelacion,
      });

      setCita(result.cita);
      triggerBookingConfetti();
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.status === 409) {
        setError("Ese horario acaba de ocuparse. Elige otro, por favor. ya no está disponible.");
        await onSlotConflict?.();
      } else {
        setError(cause instanceof Error ? cause.message : "No se pudo completar la reserva. Intenta de nuevo.");
      }
    }
  }

  return {
    nombre, setNombre, apellido, setApellido,
    telefono, setTelefono, email, setEmail,
    notas, setNotas, privacidad, setPrivacidad,
    cancelacion, setCancelacion, error, setError,
    cita, setCita, showCancelInfo, setShowCancelInfo,
    isDatosValid, handleBooking, reserva, isPending: reserva.isPending,
  };
}
