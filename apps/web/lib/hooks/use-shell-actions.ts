"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils/toast";
import { useConfirmDialog } from "@/lib/hooks";

export function useShellActions() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { confirm: confirmAction, dialogProps: confirmDialogProps } =
    useConfirmDialog();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo cerrar la sesión.");
      }
      notify.success("Sesión cerrada", "Has cerrado sesión correctamente.");
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      notify.error(err, "No se pudo cerrar la sesión.");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutClick = async () => {
    const confirmed = await confirmAction("logout");
    if (!confirmed) return;
    await handleLogout();
  };

  const handleSwitchBusiness = async (negocioId: string) => {
    const res = await fetch("/api/auth/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ negocioId }),
    });
    if (res.ok) {
      localStorage.removeItem("agendur_selected_sucursal_id");
      window.location.assign("/dashboard");
    } else {
      notify.error("No se pudo cambiar el negocio");
    }
  };

  return {
    loggingOut,
    handleLogoutClick,
    handleSwitchBusiness,
    confirmDialogProps,
  };
}
