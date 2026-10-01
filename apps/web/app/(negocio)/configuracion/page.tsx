"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Save,
  AlertCircle,
  RefreshCw,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notify } from "@/lib/utils/toast";
import { apiFetch } from "@/lib/query/api-client";
import {
  useConfiguracion,
  useUpdateConfiguracion,
  useSuscripcion,
  useAuthMe,
  useProfesionales,
  useSucursales,
} from "@/lib/hooks";
import { ConfiguracionLoading } from "./loading";
import {
  ConfiguracionHeader,
  ConfiguracionTabsNav,
  ConfiguracionPerfilTab,
  ConfiguracionPoliticasTab,
  ConfiguracionUsuariosTab,
  ConfiguracionPlantillasTab,
} from "@/components/negocio";
import { Button, Badge, PendingBadge } from "@/components/ui";
import {
  type ConfigType,
  type ConfigTab,
} from "@/lib/constants/configuracion";
import { previewRenderedText } from "@/lib/utils/format-template";


interface ConfiguracionFormProps {
  configuracion: ConfigType;
  initialTab?: ConfigTab;
}

function ConfiguracionForm({
  configuracion,
  initialTab = "perfil",
}: ConfiguracionFormProps) {
  const normalizedTab: "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion" =
    initialTab === "plan" || initialTab === "facturacion"
      ? "suscripcion"
      : (initialTab as "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion");
  const [activeTab, setActiveTab] = useState<
    "perfil" | "politicas" | "usuarios" | "plantillas" | "suscripcion"
  >(normalizedTab);
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const updateConfiguracion = useUpdateConfiguracion();
  const { data: suscripcionData } = useSuscripcion();
  const { data: authData } = useAuthMe();
  const { data: profesionalesData } = useProfesionales();
  const { data: sucursalesData } = useSucursales();

  // Tab 1: Perfil Form local state
  const [nombreNegocio, setNombreNegocio] = useState(
    configuracion.nombreNegocio || "",
  );
  const [giroComercial, setGiroComercial] = useState(
    configuracion.giroComercial || "",
  );
  const [logoUrl, setLogoUrl] = useState(configuracion.logoUrl || "");
  const [pais, setPais] = useState(configuracion.pais || "MX");
  const [zonaHoraria, setZonaHoraria] = useState(
    configuracion.zonaHoraria || "America/Mexico_City",
  );
  const [monedaPrincipal, setMonedaPrincipal] = useState(
    configuracion.monedaPrincipal || "MXN",
  );

  // Tab 2: Políticas Form local state
  const [cobroAnticipo, setCobroAnticipo] = useState(
    Boolean(
      configuracion.cobroAnticipoObligatorio ||
      configuracion.porcentajeAnticipo > 0,
    ),
  );
  const [porcentajeAnticipo, setPorcentajeAnticipo] = useState(
    configuracion.porcentajeAnticipo > 0
      ? configuracion.porcentajeAnticipo
      : 20,
  );
  const [anticipacionMinima, setAnticipacionMinima] = useState("2h");
  const [anticipacionMaxima, setAnticipacionMaxima] = useState("30d");
  const [telefonoRequerido, setTelefonoRequerido] = useState(
    configuracion.telefonoClienteRequerido ?? true,
  );
  const [emailRequerido, setEmailRequerido] = useState(
    configuracion.emailClienteRequerido ?? true,
  );
  const [notasHabilitadas, setNotasHabilitadas] = useState(
    configuracion.notasClienteHabilitadas ?? true,
  );
  const [politicaCancelacion, setPoliticaCancelacion] = useState(
    configuracion.politicaCancelacion || "",
  );

  // Tab 4: Plantillas local state
  const [canalPlantilla, setCanalPlantilla] = useState<"whatsapp" | "sms">("whatsapp");
  const [tipoPlantilla, setTipoPlantilla] = useState<"recordatorio" | "confirmacion" | "cancelacion">("recordatorio");
  const [plantillaWhatsApp, setPlantillaWhatsApp] = useState(
    "Hola {cliente}, te recordamos tu cita de {servicio} agendada para el {fecha} a las {hora} en {sucursal}. Si necesitas reagendar o tienes dudas, puedes gestionar tu turno aquí: {enlace_gestion}. ¡Te esperamos en {negocio}!"
  );
  const [plantillaSMS, setPlantillaSMS] = useState(
    "Recordatorio Agendur: Hola {cliente}, tu cita de {servicio} es el {fecha} {hora} en {sucursal}. Para cambios ingresa a: {enlace_gestion}"
  );

  // Validation
  const hasContactMethod = telefonoRequerido || emailRequerido;
  const isFormValid = nombreNegocio.trim().length > 0 && hasContactMethod;

  const handleCopyLink = () => {
    if (!configuracion.slug) return;
    const url = `${window.location.origin}/reserva/${configuracion.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      notify.success(
        "Enlace copiado",
        "Se copió la URL del portal al portapapeles.",
      );
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      if (!hasContactMethod) {
        notify.error(
          "Debes mantener al menos un medio de contacto (teléfono o correo).",
        );
      } else {
        notify.error("El nombre del negocio no puede estar vacío.");
      }
      return;
    }

    try {
      await updateConfiguracion.mutateAsync({
        nombreNegocio: nombreNegocio.trim(),
        giroComercial: giroComercial.trim(),
        logoUrl: logoUrl.trim() || null,
        pais,
        zonaHoraria,
        monedaPrincipal,
        porcentajeAnticipo: cobroAnticipo ? porcentajeAnticipo : 0,
        telefonoClienteRequerido: telefonoRequerido,
        emailClienteRequerido: emailRequerido,
        notasClienteHabilitadas: notasHabilitadas,
        politicaCancelacion: politicaCancelacion.trim() || null,
      });
      notify.success(
        "Configuración guardada",
        "Los cambios han sido aplicados con éxito.",
      );
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar la configuración.");
    }
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

  const accountEmail = authData?.user?.email ?? "";
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

  const suscripcion =
    suscripcionData?.data.suscripcion ?? authData?.suscripcion;
  const sucursalesUsadas = suscripcionData?.data.sucursales_usadas ?? 1;
  const sucursalesLimite =
    suscripcionData?.data.sucursales_limite ??
    suscripcion?.limite_sucursales ??
    1;
  const planNombre = suscripcion?.plan_nombre || "Gratuito";

  const usagePercent = useMemo(() => {
    if (sucursalesLimite >= 999) return 10;
    return Math.min(
      100,
      Math.round((sucursalesUsadas / sucursalesLimite) * 100),
    );
  }, [sucursalesUsadas, sucursalesLimite]);

  // Preview text for WhatsApp/SMS ticket
  const activeTemplateText = canalPlantilla === "whatsapp" ? plantillaWhatsApp : plantillaSMS;
  const renderedPreview = useMemo(() => {
    return previewRenderedText(activeTemplateText, {
      cliente: "María González",
      servicio: "Corte & Peinado",
      fecha: "30 Sep 2026",
      hora: "16:00",
      profesional: "Carlos Ruiz",
      sucursal: sucursalesData?.sucursales?.[0]?.nombre || "Sucursal Principal",
      negocio: nombreNegocio || "Agendur",
      enlace_gestion: `agendur.com/r/${configuracion.slug || "mi-negocio"}`,
    });
  }, [activeTemplateText, sucursalesData, nombreNegocio, configuracion.slug]);

  const insertVariable = (varName: string) => {
    if (canalPlantilla === "whatsapp") {
      setPlantillaWhatsApp((prev) => `${prev} ${varName}`);
    } else {
      setPlantillaSMS((prev) => `${prev} ${varName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <ConfiguracionHeader
        onSave={() => handleSave()}
        isSaving={updateConfiguracion.isPending}
        isFormValid={isFormValid}
      />

      {/* Pill Tabs Switcher (5 tabs as per §10) */}
      <ConfiguracionTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* =========================================================================
            TAB 1: PERFIL COMERCIAL
           ========================================================================= */}
        {activeTab === "perfil" && (
          <ConfiguracionPerfilTab
            slug={configuracion.slug}
            copied={copied}
            onCopyLink={handleCopyLink}
            logoUrl={logoUrl}
            onLogoUrlChange={setLogoUrl}
            nombreNegocio={nombreNegocio}
            onNombreNegocioChange={setNombreNegocio}
            giroComercial={giroComercial}
            onGiroComercialChange={setGiroComercial}
            monedaPrincipal={monedaPrincipal}
            onMonedaPrincipalChange={setMonedaPrincipal}
            pais={pais}
            onPaisChange={setPais}
            zonaHoraria={zonaHoraria}
            onZonaHorariaChange={setZonaHoraria}
            accountEmail={accountEmail}
            deletingAccount={deletingAccount}
            onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
          />
        )}

        {/* =========================================================================
            TAB 2: POLÍTICAS Y RESERVAS
           ========================================================================= */}
        {activeTab === "politicas" && (
          <ConfiguracionPoliticasTab
            cobroAnticipo={cobroAnticipo}
            onCobroAnticipoChange={setCobroAnticipo}
            porcentajeAnticipo={porcentajeAnticipo}
            onPorcentajeAnticipoChange={setPorcentajeAnticipo}
            anticipacionMinima={anticipacionMinima}
            onAnticipacionMinimaChange={setAnticipacionMinima}
            anticipacionMaxima={anticipacionMaxima}
            onAnticipacionMaximaChange={setAnticipacionMaxima}
            hasContactMethod={hasContactMethod}
            telefonoRequerido={telefonoRequerido}
            onTelefonoRequeridoChange={setTelefonoRequerido}
            emailRequerido={emailRequerido}
            onEmailRequeridoChange={setEmailRequerido}
            notasHabilitadas={notasHabilitadas}
            onNotasHabilitadasChange={setNotasHabilitadas}
            politicaCancelacion={politicaCancelacion}
            onPoliticaCancelacionChange={setPoliticaCancelacion}
          />
        )}

        {/* =========================================================================
            TAB 3: USUARIOS Y ROLES (§10)
           ========================================================================= */}
        {activeTab === "usuarios" && (
          <ConfiguracionUsuariosTab
            authData={authData}
            profesionalesData={profesionalesData}
            sucursalesData={sucursalesData}
          />
        )}

        {/* =========================================================================
            TAB 4: PLANTILLAS DE RECORDATORIOS (§10 con Preview Ticket Perforado §5.6)
           ========================================================================= */}
        {activeTab === "plantillas" && (
          <ConfiguracionPlantillasTab
            canalPlantilla={canalPlantilla}
            onCanalPlantillaChange={setCanalPlantilla}
            tipoPlantilla={tipoPlantilla}
            onTipoPlantillaChange={setTipoPlantilla}
            plantillaWhatsApp={plantillaWhatsApp}
            onPlantillaWhatsAppChange={setPlantillaWhatsApp}
            plantillaSMS={plantillaSMS}
            onPlantillaSMSChange={setPlantillaSMS}
            onInsertVariable={insertVariable}
            nombreNegocio={nombreNegocio}
            renderedPreview={renderedPreview}
          />
        )}

        {/* =========================================================================
            TAB 5: PLAN Y SUSCRIPCIÓN (con Muesca Semicircular Autorizada §5.6.4)
           ========================================================================= */}
        {activeTab === "suscripcion" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Plan Card with authorized corner ticket notch (§5.6.4) */}
            <div className="relative bg-surface border border-border rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs overflow-hidden">
              {/* Authorized circular corner notch (§5.6.4) */}
              <div
                className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border select-none pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-grape" />
                    <h2 className="font-bricolage font-bold text-2xl text-text-primary">
                      {planNombre}
                    </h2>
                    <Badge variant="success" size="sm" dot>
                      Activo
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Plan comercial activo en la infraestructura de Agendur.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOpenStripePortal}
                  isLoading={portalLoading}
                  className="gap-2 shrink-0"
                >
                  <CreditCard className="w-4 h-4 text-grape" />
                  <span>Gestionar facturación y pagos</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                </Button>
              </div>

              {/* Branch capacity progress */}
              <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">
                    Capacidad de sucursales:
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {sucursalesUsadas} de{" "}
                    {sucursalesLimite >= 999 ? "ilimitadas" : sucursalesLimite}{" "}
                    sedes
                  </span>
                </div>

                <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-grape rounded-full transition-all duration-300"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-text-muted">
                  Para abrir nuevas sucursales o ampliar el límite de tu plan,
                  puedes actualizar tu suscripción a través del portal de Stripe.
                </p>
              </div>

              {/* Plan Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint-soft text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Citas y reservas ilimitadas
                    </p>
                    <p className="text-text-secondary">
                      Sin comisiones ocultas por cita agendada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint-soft text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Recordatorios automáticos
                    </p>
                    <p className="text-text-secondary">
                      Notificaciones directas vía WhatsApp y SMS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint-soft text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Vistas de agenda avanzadas
                    </p>
                    <p className="text-text-secondary">
                      Cronograma diario por horas y cuadrícula de personal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint-soft text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Pasarela de pagos en línea
                    </p>
                    <p className="text-text-secondary">
                      Cobro de depósitos con tarjeta mediante Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateConfiguracion.isPending}
            disabled={!isFormValid}
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        type="eliminar_cuenta"
        targetName={accountEmail}
        isLoading={deletingAccount}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

export default function ConfiguracionPage({
  initialTab = "perfil",
}: {
  initialTab?: ConfigTab;
} = {}) {
  const { data: session, isLoading: sessionLoading } = useAuthMe();
  const permitted = session?.access?.capabilities.includes("config:read") ?? false;
  const {
    data: configData,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = useConfiguracion(permitted);

  const configuracion = configData?.configuracion;
  const showLoading = sessionLoading || (configLoading && !configData && !configError);
  const showError =
    configError || (!configLoading && configData && !configuracion);

  if (session && !permitted) return <p>No tienes permiso para administrar la configuración.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* STATE 1: LOADING */}
      {showLoading && (
        <div className="space-y-4 animate-pulse" data-testid="config-loading">
          <ConfiguracionLoading />
        </div>
      )}

      {/* STATE 2: ERROR */}
      {showError && (
        <div
          role="alert"
          className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="size-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bricolage font-bold text-lg text-text-primary">
            No se pudo cargar la configuración
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Ocurrió un error al consultar los parámetros del negocio. Por favor
            intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={() => refetchConfig()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* STATE 3 & 4: FORM WITH DATA */}
      {!configLoading && !configError && configuracion && (
        <ConfiguracionForm
          key={configuracion.id || "loaded"}
          configuracion={configuracion}
          initialTab={initialTab}
        />
      )}
    </div>
  );
}
