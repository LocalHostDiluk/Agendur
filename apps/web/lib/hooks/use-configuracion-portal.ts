"use client";

import { useState } from "react";
import { notify } from "@/lib/utils/toast";
import { apiFetch } from "@/lib/query/api-client";

export function useConfiguracionPortal(slug?: string, accountEmail = "") {
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleCopyLink = () => {
    if (!slug) return;
    const url = `${window.location.origin}/reserva/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      notify.success(
        "Enlace copiado",
        "Se copió la URL del portal al portapapeles.",
      );
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/negocio/suscripcion/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.portalUrl) {
        throw new Error(
          data.error || "No se pudo generar la sesión de facturación.",
        );
      }
      window.location.href = data.portalUrl;
    } catch (err: unknown) {
      notify.error(err, "No se pudo abrir el portal de Stripe.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await apiFetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountEmail }),
      });
      window.location.replace("/login?accountDeleted=1");
    } catch (error) {
      notify.error(error, "No se pudo eliminar la cuenta.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return {
    copied,
    portalLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingAccount,
    handleCopyLink,
    handleOpenStripePortal,
    handleDeleteAccount,
  };
}
