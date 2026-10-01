import { useState } from "react";
import { notify } from "@/lib/utils/toast";
import { apiFetch } from "@/lib/query/api-client";
import { useUpdateConfiguracion } from "./use-negocio-data";

export interface ConfiguracionActionsParams {
  slug?: string | null;
  accountEmail: string;
  isFormValid: boolean;
  hasContactMethod: boolean;
  formData: {
    nombreNegocio: string; giroComercial: string; logoUrl: string; pais: string; zonaHoraria: string;
    monedaPrincipal: string; cobroAnticipo: boolean; porcentajeAnticipo: number;
    telefonoRequerido: boolean; emailRequerido: boolean; notasHabilitadas: boolean; politicaCancelacion: string;
  };
}

export function useConfiguracionFormActions({
  slug, accountEmail, isFormValid, hasContactMethod, formData,
}: ConfiguracionActionsParams) {
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const updateConfiguracion = useUpdateConfiguracion();

  const handleCopyLink = () => {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/reserva/${slug}`).then(() => {
      setCopied(true);
      notify.success("Enlace copiado", "Se copió la URL del portal al portapapeles.");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      const msg = !hasContactMethod ? "Debes mantener al menos un medio de contacto (teléfono o correo)." : "El nombre del negocio no puede estar vacío.";
      notify.error(msg);
      return;
    }
    try {
      await updateConfiguracion.mutateAsync({
        nombreNegocio: formData.nombreNegocio.trim(),
        giroComercial: formData.giroComercial.trim(),
        logoUrl: formData.logoUrl.trim() || null,
        pais: formData.pais, zonaHoraria: formData.zonaHoraria, monedaPrincipal: formData.monedaPrincipal,
        porcentajeAnticipo: formData.cobroAnticipo ? formData.porcentajeAnticipo : 0,
        telefonoClienteRequerido: formData.telefonoRequerido, emailClienteRequerido: formData.emailRequerido,
        notasClienteHabilitadas: formData.notasHabilitadas, politicaCancelacion: formData.politicaCancelacion.trim() || null,
      });
      notify.success("Configuración guardada", "Los cambios han sido aplicados con éxito.");
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar la configuración.");
    }
  };
  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/negocio/suscripcion/portal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.portalUrl) throw new Error(data.error || "No se pudo generar la sesión de facturación.");
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
        method: "DELETE", headers: { "Content-Type": "application/json" },
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
    copied, portalLoading, deleteDialogOpen, setDeleteDialogOpen,
    deletingAccount, isSaving: updateConfiguracion.isPending,
    handleCopyLink, handleSave, handleOpenStripePortal, handleDeleteAccount,
  };
}
