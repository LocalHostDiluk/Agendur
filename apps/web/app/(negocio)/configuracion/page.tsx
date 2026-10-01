"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  UserCheck,
  Send,
  Smartphone,
  Info,
  CheckCheck,
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Header with Beta Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-grape" />
                    <h2 className="font-bricolage font-bold text-lg text-text-primary">
                      Plantillas de Notificaciones
                    </h2>
                    <PendingBadge
                      label="Beta"
                      tooltip="Envío automatizado en fase de pruebas"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Personaliza los mensajes directos que tus clientes reciben por WhatsApp y SMS para reducir ausencias.
                  </p>
                </div>

                {/* Channel Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCanalPlantilla("whatsapp")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      canalPlantilla === "whatsapp"
                        ? "bg-grape text-white shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanalPlantilla("sms")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      canalPlantilla === "sms"
                        ? "bg-grape text-white shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              {/* Template Selection Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-text-secondary mr-1">
                  Momento de envío:
                </span>
                <button
                  type="button"
                  onClick={() => setTipoPlantilla("recordatorio")}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                    tipoPlantilla === "recordatorio"
                      ? "bg-grape text-white shadow-xs"
                      : "bg-surface-alt border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Recordatorio 24h antes
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPlantilla("confirmacion")}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                    tipoPlantilla === "confirmacion"
                      ? "bg-grape text-white shadow-xs"
                      : "bg-surface-alt border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Confirmación inmediata
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPlantilla("cancelacion")}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                    tipoPlantilla === "cancelacion"
                      ? "bg-grape text-white shadow-xs"
                      : "bg-surface-alt border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Cancelación o Reagendamiento
                </button>
              </div>

              {/* Grid: Editor + Ticket Preview (§5.6) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Template Editor */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="templateText"
                        className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                      >
                        Contenido del Mensaje
                      </label>
                      <span className="font-mono text-xs text-text-secondary">
                        {activeTemplateText.length} caracteres
                      </span>
                    </div>

                    <textarea
                      id="templateText"
                      rows={6}
                      value={canalPlantilla === "whatsapp" ? plantillaWhatsApp : plantillaSMS}
                      onChange={(e) => {
                        if (canalPlantilla === "whatsapp") {
                          setPlantillaWhatsApp(e.target.value);
                        } else {
                          setPlantillaSMS(e.target.value);
                        }
                      }}
                      className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape font-sans leading-relaxed"
                    />
                  </div>

                  {/* Variables pills */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-secondary">
                      Haz clic para insertar variables dinámicas:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { key: "{cliente}", label: "Nombre Cliente" },
                        { key: "{servicio}", label: "Servicio" },
                        { key: "{fecha}", label: "Fecha" },
                        { key: "{hora}", label: "Hora" },
                        { key: "{profesional}", label: "Profesional" },
                        { key: "{sucursal}", label: "Sucursal" },
                        { key: "{negocio}", label: "Negocio" },
                        { key: "{enlace_gestion}", label: "Enlace Gestión" },
                      ].map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertVariable(v.key)}
                          className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-alt border border-border text-[11px] font-mono font-medium text-grape hover:bg-grape-soft transition-colors select-none"
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Perforated Ticket Preview (§5.6) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-grape" />
                      <span>Vista Previa del Cliente</span>
                    </span>
                    <PendingBadge
                      label="Beta"
                      tooltip="Envío automatizado en fase de pruebas"
                    />
                  </div>

                  {/* Perforated ticket card with notch styling */}
                  <div className="relative bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                    {/* Ticket Header */}
                    <div className="p-4 bg-surface-alt/70 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-grape text-white font-mono font-bold text-xs flex items-center justify-center">
                          A
                        </div>
                        <span className="font-bricolage font-bold text-sm text-text-primary">
                          {nombreNegocio || "Agendur"}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-grape bg-grape-soft px-2 py-0.5 rounded-full">
                        #TK-4820
                      </span>
                    </div>

                    {/* Perforation line with circular cutout notches on edges (§5.6) */}
                    <div className="relative py-2 px-4 flex items-center justify-center">
                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />
                      <div className="w-full border-b border-dashed border-border" />
                      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />
                    </div>

                    {/* WhatsApp / SMS Chat Bubble */}
                    <div className="p-4 bg-surface space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-text-muted justify-center">
                        <Clock className="w-3 h-3" />
                        <span>Notificación Automática — 24h antes</span>
                      </div>

                      <div
                        className={`rounded-xl p-3 text-xs leading-relaxed space-y-1.5 shadow-xs ${
                          canalPlantilla === "whatsapp"
                            ? "bg-mint-soft/30 dark:bg-mint-dark/15 border border-mint/25 text-text-primary"
                            : "bg-surface-alt border border-border text-text-primary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{renderedPreview}</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-text-muted">
                          <span className="font-mono">10:00</span>
                          {canalPlantilla === "whatsapp" && (
                            <CheckCheck className="w-3.5 h-3.5 text-mint-dark" />
                          )}
                        </div>
                      </div>

                      {/* Ticket Footer details */}
                      <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <p className="text-text-muted">FECHA & HORA</p>
                          <p className="font-bold text-text-primary">30 SEP · 16:00</p>
                        </div>
                        <div>
                          <p className="text-text-muted">CANAL</p>
                          <p className="font-bold text-grape uppercase">
                            {canalPlantilla}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
