"use client";

import { Save } from "lucide-react";
import { useAuthMe, useProfesionales, useSucursales, useSuscripcion } from "@/lib/hooks";
import { useConfiguracionForm } from "@/lib/hooks/use-configuracion-form";
import { useConfiguracionPortal } from "@/lib/hooks/use-configuracion-portal";
import type { ConfigTab, ConfigType } from "@/lib/utils/configuracion-constants";
import { Button } from "@/components/ui";
import { ConfiguracionDeleteAccountModal } from "./ConfiguracionDeleteAccountModal";
import { ConfiguracionHeader } from "./ConfiguracionHeader";
import { ConfiguracionTabNegocio } from "./ConfiguracionTabNegocio";
import { ConfiguracionTabPoliticas } from "./ConfiguracionTabPoliticas";
import { ConfiguracionTabPortal } from "./ConfiguracionTabPortal";
import { ConfiguracionTabRecordatorios } from "./ConfiguracionTabRecordatorios";
import { ConfiguracionTabs } from "./ConfiguracionTabs";
import { ConfiguracionTabSeguridad } from "./ConfiguracionTabSeguridad";
import { ConfiguracionTabSuscripcion } from "./ConfiguracionTabSuscripcion";
import { ConfiguracionTabUsuarios } from "./ConfiguracionTabUsuarios";

export interface ConfiguracionFormProps {
  configuracion: ConfigType;
  initialTab?: ConfigTab;
}

export function ConfiguracionForm({
  configuracion,
  initialTab = "perfil",
}: ConfiguracionFormProps) {
  const { data: suscripcionData } = useSuscripcion();
  const { data: authData } = useAuthMe();
  const { data: profesionalesData } = useProfesionales();
  const { data: sucursalesData } = useSucursales();

  const accountEmail = authData?.user?.email ?? "";
  const form = useConfiguracionForm(configuracion, initialTab);
  const portal = useConfiguracionPortal(configuracion.slug, accountEmail);

  const suscripcion = suscripcionData?.data.suscripcion ?? authData?.suscripcion;
  const sucursalesUsadas = suscripcionData?.data.sucursales_usadas ?? 1;
  const sucursalesLimite =
    suscripcionData?.data.sucursales_limite ?? suscripcion?.limite_sucursales ?? 1;
  const planNombre = suscripcion?.plan_nombre || "Gratuito";

  return (
    <div className="space-y-6">
      <ConfiguracionHeader
        onSave={() => form.handleSave()}
        isSaving={form.isSaving}
        isFormValid={form.isFormValid}
      />

      <ConfiguracionTabs activeTab={form.activeTab} onChangeTab={form.setActiveTab} />

      <form onSubmit={form.handleSave} className="space-y-6">
        {form.activeTab === "perfil" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ConfiguracionTabPortal
              slug={configuracion.slug}
              copied={portal.copied}
              onCopyLink={portal.handleCopyLink}
            />
            <ConfiguracionTabNegocio negocioId={authData?.negocio?.id} {...form} />
            <ConfiguracionTabSeguridad
              accountEmail={accountEmail}
              deletingAccount={portal.deletingAccount}
              onRequestDelete={() => portal.setDeleteDialogOpen(true)}
            />
          </div>
        )}

        {form.activeTab === "politicas" && <ConfiguracionTabPoliticas {...form} />}

        {form.activeTab === "usuarios" && (
          <ConfiguracionTabUsuarios
            ownerNombres={authData?.perfil?.nombres}
            ownerApellidos={authData?.perfil?.apellidos}
            ownerEmail={authData?.user?.email}
            profesionales={profesionalesData?.profesionales}
            sucursales={sucursalesData?.sucursales}
          />
        )}

        {form.activeTab === "plantillas" && (
          <ConfiguracionTabRecordatorios
            {...form}
            sucursalNombre={sucursalesData?.sucursales?.[0]?.nombre || "Sucursal Principal"}
            slug={configuracion.slug}
          />
        )}

        {form.activeTab === "suscripcion" && (
          <ConfiguracionTabSuscripcion
            planNombre={planNombre}
            sucursalesUsadas={sucursalesUsadas}
            sucursalesLimite={sucursalesLimite}
            portalLoading={portal.portalLoading}
            onOpenStripePortal={portal.handleOpenStripePortal}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="submit" variant="primary" isLoading={form.isSaving} disabled={!form.isFormValid}>
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </Button>
        </div>
      </form>
      <ConfiguracionDeleteAccountModal
        isOpen={portal.deleteDialogOpen}
        accountEmail={accountEmail}
        isLoading={portal.deletingAccount}
        onCancel={() => portal.setDeleteDialogOpen(false)}
        onConfirm={portal.handleDeleteAccount}
      />
    </div>
  );
}
