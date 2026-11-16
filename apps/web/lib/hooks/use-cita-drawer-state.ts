"use client";

import { useState, useEffect } from "react";
import type { Cita, EstadoCita } from "@/lib/types";
import { useUpdateCitaEstado, useConfirmDialog } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

interface UseCitaDrawerStateArgs {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  onCitaUpdated?: () => void;
}

export function useCitaDrawerState({ isOpen, onClose, cita, onCitaUpdated }: UseCitaDrawerStateArgs) {
  const updateCitaMutation = useUpdateCitaEstado();
  const [activeCita, setActiveCita] = useState<Cita | null>(cita);
  const [prevCitaId, setPrevCitaId] = useState<string | null>(null);
  const [notas, setNotas] = useState<string>("");
  const [isSavingNotas, setIsSavingNotas] = useState(false);
  const [pendingEstado, setPendingEstado] = useState<EstadoCita | null>(null);
  const { confirm: confirmAction, dialogProps: confirmDialogProps } = useConfirmDialog();

  if (cita && cita.id !== prevCitaId) {
    setPrevCitaId(cita.id);
    setActiveCita(cita);
    setNotas(cita.notas_cliente ?? "");
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const currentCita = cita ?? activeCita;

  const handleGuardarNotas = async () => {
    if (!currentCita) return;
    setIsSavingNotas(true);
    try {
      await updateCitaMutation.mutateAsync({ citaId: currentCita.id, notas: notas.trim() });
      notify.success("Notas guardadas", "Las notas internas de la cita se guardaron correctamente.");
      onCitaUpdated?.();
    } catch (err: unknown) {
      notify.error(err, "No se pudieron guardar las notas.");
    } finally {
      setIsSavingNotas(false);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: EstadoCita, folio: string) => {
    if (!currentCita) return;
    if (nuevoEstado === "cancelada") {
      const confirmed = await confirmAction({
        type: "cancelar_cita",
        level: 1,
        targetName: folio,
        consequences: [
          "Se notificará al cliente por WhatsApp de la cancelación.",
          "El horario quedará liberado inmediatamente en la agenda.",
        ],
      });
      if (!confirmed) return;
    }

    setPendingEstado(nuevoEstado);
    try {
      await updateCitaMutation.mutateAsync({ citaId: currentCita.id, nuevoEstado });
      const estadoLabels: Record<string, string> = {
        confirmada: "confirmada",
        completada: "marcada como completada",
        cancelada: "cancelada",
      };
      notify.success("Cita actualizada", `La cita ha sido ${estadoLabels[nuevoEstado] ?? nuevoEstado} exitosamente.`);
      onCitaUpdated?.();
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar el estado de la cita.");
    } finally {
      setPendingEstado(null);
    }
  };

  return {
    activeCita, currentCita, notas, setNotas, isSavingNotas, pendingEstado,
    isMutating: updateCitaMutation.isPending, confirmDialogProps, handleGuardarNotas, handleUpdateEstado,
  };
}
