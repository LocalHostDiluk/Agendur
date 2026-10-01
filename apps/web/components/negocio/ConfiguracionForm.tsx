"use client";

import { useState, useMemo } from "react";
import { Save } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui";
import {
  useConfiguracionFormState, useConfiguracionFormActions,
  useSuscripcion, useAuthMe, useProfesionales, useSucursales,
} from "@/lib/hooks";
import {
  ConfiguracionHeader, ConfiguracionTabsNav, ConfiguracionPerfilTab,
  ConfiguracionPoliticasTab, ConfiguracionUsuariosTab,
  ConfiguracionPlantillasTab, ConfiguracionSuscripcionTab,
} from "@/components/negocio";
import { type ConfigType, type ConfigTab } from "@/lib/constants/configuracion";
import { previewRenderedText } from "@/lib/utils/format-template";

export interface ConfiguracionFormProps {
  configuracion: ConfigType;
  initialTab?: ConfigTab;
}

export function ConfiguracionForm({ configuracion, initialTab = "perfil" }: ConfiguracionFormProps) {
  const normalizedTab = initialTab === "plan" || initialTab === "facturacion" ? "suscripcion" : initialTab;
  const [activeTab, setActiveTab] = useState<"perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion">(
    normalizedTab as "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion"
  );

  const { data: suscripcionData } = useSuscripcion();
  const { data: authData } = useAuthMe();
  const { data: profesionalesData } = useProfesionales();
  const { data: sucursalesData } = useSucursales();

  const state = useConfiguracionFormState(configuracion);
  const accountEmail = authData?.user?.email ?? "";
  const actions = useConfiguracionFormActions({
    slug: configuracion.slug, accountEmail,
    isFormValid: state.isFormValid, hasContactMethod: state.hasContactMethod, formData: state,
  });

  const suscripcion = suscripcionData?.data.suscripcion ?? authData?.suscripcion;
  const sucursalesUsadas = suscripcionData?.data.sucursales_usadas ?? 1;
  const sucursalesLimite = suscripcionData?.data.sucursales_limite ?? suscripcion?.limite_sucursales ?? 1;
  const planNombre = suscripcion?.plan_nombre || "Gratuito";

  const usagePercent = useMemo(() => {
    if (sucursalesLimite >= 999) return 10;
    return Math.min(100, Math.round((sucursalesUsadas / sucursalesLimite) * 100));
  }, [sucursalesUsadas, sucursalesLimite]);

  const activeTemplateText = state.canalPlantilla === "whatsapp" ? state.plantillaWhatsApp : state.plantillaSMS;
  const renderedPreview = useMemo(() => {
    return previewRenderedText(activeTemplateText, {
      cliente: "María González", servicio: "Corte & Peinado", fecha: "30 Sep 2026",
      hora: "16:00", profesional: "Carlos Ruiz",
      sucursal: sucursalesData?.sucursales?.[0]?.nombre || "Sucursal Principal",
      negocio: state.nombreNegocio || "Agendur",
      enlace_gestion: `agendur.com/r/${configuracion.slug || "mi-negocio"}`,
    });
  }, [activeTemplateText, sucursalesData, state.nombreNegocio, configuracion.slug]);

  return (
    <div className="space-y-6">
      <ConfiguracionHeader
        onSave={() => actions.handleSave()}
        isSaving={actions.isSaving}
        isFormValid={state.isFormValid}
      />
      <ConfiguracionTabsNav activeTab={activeTab} onTabChange={setActiveTab} />
      <form onSubmit={actions.handleSave} className="space-y-6">
        {activeTab === "perfil" && (
          <ConfiguracionPerfilTab
            slug={configuracion.slug} copied={actions.copied} onCopyLink={actions.handleCopyLink}
            logoUrl={state.logoUrl} onLogoUrlChange={state.setLogoUrl}
            nombreNegocio={state.nombreNegocio} onNombreNegocioChange={state.setNombreNegocio}
            giroComercial={state.giroComercial} onGiroComercialChange={state.setGiroComercial}
            monedaPrincipal={state.monedaPrincipal} onMonedaPrincipalChange={state.setMonedaPrincipal}
            pais={state.pais} onPaisChange={state.setPais}
            zonaHoraria={state.zonaHoraria} onZonaHorariaChange={state.setZonaHoraria}
            accountEmail={accountEmail} deletingAccount={actions.deletingAccount}
            onOpenDeleteDialog={() => actions.setDeleteDialogOpen(true)}
          />
        )}
        {activeTab === "politicas" && (
          <ConfiguracionPoliticasTab
            cobroAnticipo={state.cobroAnticipo} onCobroAnticipoChange={state.setCobroAnticipo}
            porcentajeAnticipo={state.porcentajeAnticipo} onPorcentajeAnticipoChange={state.setPorcentajeAnticipo}
            anticipacionMinima={state.anticipacionMinima} onAnticipacionMinimaChange={state.setAnticipacionMinima}
            anticipacionMaxima={state.anticipacionMaxima} onAnticipacionMaximaChange={state.setAnticipacionMaxima}
            hasContactMethod={state.hasContactMethod}
            telefonoRequerido={state.telefonoRequerido} onTelefonoRequeridoChange={state.setTelefonoRequerido}
            emailRequerido={state.emailRequerido} onEmailRequeridoChange={state.setEmailRequerido}
            notasHabilitadas={state.notasHabilitadas} onNotasHabilitadasChange={state.setNotasHabilitadas}
            politicaCancelacion={state.politicaCancelacion} onPoliticaCancelacionChange={state.setPoliticaCancelacion}
          />
        )}
        {activeTab === "usuarios" && (
          <ConfiguracionUsuariosTab
            authData={authData} profesionalesData={profesionalesData} sucursalesData={sucursalesData}
          />
        )}
        {activeTab === "plantillas" && (
          <ConfiguracionPlantillasTab
            canalPlantilla={state.canalPlantilla} onCanalPlantillaChange={state.setCanalPlantilla}
            tipoPlantilla={state.tipoPlantilla} onTipoPlantillaChange={state.setTipoPlantilla}
            plantillaWhatsApp={state.plantillaWhatsApp} onPlantillaWhatsAppChange={state.setPlantillaWhatsApp}
            plantillaSMS={state.plantillaSMS} onPlantillaSMSChange={state.setPlantillaSMS}
            onInsertVariable={state.insertVariable} nombreNegocio={state.nombreNegocio}
            renderedPreview={renderedPreview}
          />
        )}
        {activeTab === "suscripcion" && (
          <ConfiguracionSuscripcionTab
            planNombre={planNombre} onOpenStripePortal={actions.handleOpenStripePortal}
            portalLoading={actions.portalLoading} sucursalesUsadas={sucursalesUsadas}
            sucursalesLimite={sucursalesLimite} usagePercent={usagePercent}
          />
        )}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit" variant="primary"
            isLoading={actions.isSaving} disabled={!state.isFormValid}
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={actions.deleteDialogOpen} type="eliminar_cuenta"
        targetName={accountEmail} isLoading={actions.deletingAccount}
        onCancel={() => actions.setDeleteDialogOpen(false)} onConfirm={actions.handleDeleteAccount}
      />
    </div>
  );
}
