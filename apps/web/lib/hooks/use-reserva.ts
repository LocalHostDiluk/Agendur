import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Cita } from "@/lib/types";

export interface CrearReservaInput {
  sucursalId: string;
  servicioId: string;
  profesionalId: string;
  clienteNombre: string;
  clienteApellido?: string;
  clientePhone: string;
  clienteEmail: string;
  fecha: string;
  hora: string;
  notasCliente?: string;
}

export function useCrearReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reserva: CrearReservaInput) =>
      apiFetch<{ cita: Cita }>("/api/cliente/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva),
      }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cliente", "disponibilidad"] });
    },
  });
}
