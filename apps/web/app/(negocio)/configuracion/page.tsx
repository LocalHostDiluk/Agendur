"use client";

import { useState, useMemo } from "react";
import {
  Store,
  Sliders,
  Users,
  MessageSquare,
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Clock,
  Coins,
  ShieldAlert,
  Sparkles,
  Phone,
  FileText,
  Percent,
  CalendarClock,
  ShieldCheck,
  UserCheck,
  Plus,
  Send,
  Smartphone,
  Info,
  Trash2,
  Image as ImageIcon,
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
import type { NegocioConfig } from "@/lib/types";
import { ConfiguracionLoading } from "./loading";
import { Button, Badge, PendingBadge } from "@/components/ui";
import { ImageUploadButton } from "@/components/negocio/ImageUploadButton";

interface SwitchToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

function SwitchToggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-primary cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-grape focus:ring-offset-2 ${
          checked ? "bg-grape" : "bg-border"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const GIROS_FRECUENTES = [
  "Barbería / Peluquería masculina",
  "Estética / Salón de belleza",
  "Spa / Masajes y bienestar",
  "Consultorio médico / Especialidades",
  "Clínica dental / Odontología",
  "Salón de manicura / Uñas",
  "Estudio de tatuajes y piercings",
  "Fitness / Personal Trainer / Yoga",
  "Nutrición y Dietética",
  "Veterinaria / Cuidado de mascotas",
  "Servicios profesionales / Consultoría",
  "Otro rubro comercial",
];

const PAISES = [
  { code: "MX", name: "México" },
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos" },
  { code: "UY", name: "Uruguay" },
  { code: "EC", name: "Ecuador" },
];

const ZONAS_HORARIAS = [
  { value: "America/Mexico_City", label: "Ciudad de México / Centro (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Cancun", label: "Cancún / Quintana Roo (GMT-5)" },
  { value: "America/Tijuana", label: "Tijuana / Pacífico (GMT-8)" },
  { value: "America/Hermosillo", label: "Hermosillo / Sonora (GMT-7)" },
  { value: "America/Bogota", label: "Bogotá / Colombia (GMT-5)" },
  { value: "America/Lima", label: "Lima / Perú (GMT-5)" },
  { value: "America/Santiago", label: "Santiago / Chile (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires / Argentina (GMT-3)" },
  { value: "Europe/Madrid", label: "Madrid / España (GMT+1)" },
  { value: "America/New_York", label: "Nueva York / Miami (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8)" },
];

const MONEDAS = [
  { code: "MXN", label: "MXN ($) — Peso Mexicano" },
  { code: "USD", label: "USD ($) — Dólar Estadounidense" },
  { code: "EUR", label: "EUR (€) — Euro" },
  { code: "COP", label: "COP ($) — Peso Colombiano" },
  { code: "ARS", label: "ARS ($) — Peso Argentino" },
  { code: "CLP", label: "CLP ($) — Peso Chileno" },
  { code: "PEN", label: "PEN (S/) — Sol Peruano" },
];

const ANTICIPACIONES_MINIMAS = [
  { value: "30m", label: "30 minutos de anticipación" },
  { value: "1h", label: "1 hora de anticipación" },
  { value: "2h", label: "2 horas de anticipación (Recomendado)" },
  { value: "4h", label: "4 horas de anticipación" },
  { value: "12h", label: "12 horas de anticipación" },
  { value: "24h", label: "24 horas de anticipación" },
];

const ANTICIPACIONES_MAXIMAS = [
  { value: "15d", label: "Hasta 15 días en el futuro" },
  { value: "30d", label: "Hasta 30 días en el futuro (Recomendado)" },
  { value: "60d", label: "Hasta 60 días en el futuro" },
  { value: "90d", label: "Hasta 90 días en el futuro" },
];

type ConfigType = Omit<NegocioConfig, "whatsappNotificaciones"> & {
  id?: string;
  monedaPrincipal?: string;
  logoUrl?: string | null;
};

type ConfigTab =
  | "perfil"
  | "politicas"
  | "usuarios"
  | "plantillas"
  | "suscripcion"
  | "plan"
  | "facturacion";

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
  const previewRenderedText = useMemo(() => {
    return activeTemplateText
      .replace(/{cliente}/g, "María González")
      .replace(/{servicio}/g, "Corte & Peinado")
      .replace(/{fecha}/g, "30 Sep 2026")
      .replace(/{hora}/g, "16:00")
      .replace(/{profesional}/g, "Carlos Ruiz")
      .replace(/{sucursal}/g, sucursalesData?.sucursales?.[0]?.nombre || "Sucursal Principal")
      .replace(/{negocio}/g, nombreNegocio || "Agendur")
      .replace(/{enlace_gestion}/g, `agendur.com/r/${configuracion.slug || "mi-negocio"}`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administra los parámetros comerciales, políticas de reserva, usuarios y
            suscripción de tu negocio.
          </p>
        </div>

        {/* Global Save Button */}
        <Button
          variant="primary"
          onClick={() => handleSave()}
          isLoading={updateConfiguracion.isPending}
          disabled={!isFormValid}
          className="shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Guardar cambios</span>
        </Button>
      </div>

      {/* Pill Tabs Switcher (5 tabs as per §10) */}
      <div
        className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-full overflow-x-auto"
        role="tablist"
        aria-label="Pestañas de configuración"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "perfil"}
          onClick={() => setActiveTab("perfil")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
            activeTab === "perfil"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Perfil Comercial</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "politicas"}
          onClick={() => setActiveTab("politicas")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
            activeTab === "politicas"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Políticas y Reservas</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "usuarios"}
          onClick={() => setActiveTab("usuarios")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
            activeTab === "usuarios"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios y roles</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "plantillas"}
          onClick={() => setActiveTab("plantillas")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
            activeTab === "plantillas"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Plantillas de recordatorios</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "suscripcion"}
          onClick={() => setActiveTab("suscripcion")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
            activeTab === "suscripcion"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plan y facturación</span>
          <span className="sr-only"> (Plan y Suscripción)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* =========================================================================
            TAB 1: PERFIL COMERCIAL
           ========================================================================= */}
        {activeTab === "perfil" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Public Portal Link Card */}
            <div className="bg-surface-alt border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-grape" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Portal Público de Clientes
                  </span>
                </div>
                <Badge variant="success" size="sm" dot>
                  En Línea
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-xs text-text-secondary font-mono select-none">
                    agendur.com/reserva/
                  </span>
                  <span className="text-xs font-mono font-bold text-grape truncate">
                    {configuracion.slug || "mi-negocio"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-surface-alt hover:bg-border/60 text-text-primary border border-border transition-colors flex items-center gap-1.5 min-h-[36px]"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Copiado" : "Copiar enlace"}</span>
                  </button>
                  <a
                    href={`/reserva/${configuracion.slug || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-grape-soft hover:bg-grape-soft/80 text-grape transition-colors flex items-center gap-1.5 min-h-[36px]"
                  >
                    <span>Abrir portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                Este es el enlace directo a tu catálogo de citas para compartir
                por WhatsApp, Instagram y redes sociales. El identificador permanente
                garantiza que tus clientes siempre encuentren tu negocio.
              </p>
            </div>

            {/* General Business Information & Logo */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="border-b border-border pb-3">
                <h2 className="font-bricolage font-bold text-lg text-text-primary">
                  Información Comercial
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Datos principales y logotipo que tus clientes verán al ingresar al portal
                  de reservas.
                </p>
              </div>

              {/* Logo Preview & Input */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-surface-alt border border-border">
                <div className="size-16 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo de negocio"
                      className="w-full h-full object-cover"
                      onError={() => {
                        notify.error("No se pudo cargar la vista previa del logotipo.");
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <label
                    htmlFor="logoUrl"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>URL del Logotipo Comercial</span>
                  </label>
                  <input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://tudominio.com/logo.png"
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  />
                  {authData?.negocio?.id && (
                    <ImageUploadButton
                      bucket="logos-negocios"
                      path={`${authData.negocio.id}/logo`}
                      label="Subir logotipo"
                      onUploaded={setLogoUrl}
                    />
                  )}
                  <p className="text-[11px] text-text-muted">
                    Sube una imagen PNG, JPG o WebP de hasta 5 MB, o proporciona un enlace directo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre Comercial */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="nombreNegocio"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Nombre del Negocio *
                  </label>
                  <input
                    id="nombreNegocio"
                    type="text"
                    required
                    value={nombreNegocio}
                    onChange={(e) => setNombreNegocio(e.target.value)}
                    placeholder="Ej. Barbería Clásica & Spa"
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  />
                </div>

                {/* Giro Comercial */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="giroComercial"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Giro o Categoría *
                  </label>
                  <input
                    id="giroComercial"
                    type="text"
                    list="giros-list"
                    required
                    value={giroComercial}
                    onChange={(e) => setGiroComercial(e.target.value)}
                    placeholder="Selecciona o escribe el giro comercial"
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  />
                  <datalist id="giros-list">
                    {GIROS_FRECUENTES.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>

                {/* Moneda Principal */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="monedaPrincipal"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5 text-grape" />
                    <span>Moneda Comercial</span>
                  </label>
                  <select
                    id="monedaPrincipal"
                    value={monedaPrincipal}
                    onChange={(e) => setMonedaPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  >
                    {MONEDAS.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* País */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="pais"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    País
                  </label>
                  <select
                    id="pais"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  >
                    {PAISES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona Horaria */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="zonaHoraria"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-grape" />
                    <span>Zona Horaria Oficial</span>
                  </label>
                  <select
                    id="zonaHoraria"
                    value={zonaHoraria}
                    onChange={(e) => setZonaHoraria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  >
                    {ZONAS_HORARIAS.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-danger/5 border border-danger/25 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="font-bricolage font-bold text-lg text-danger">
                  Zona de peligro
                </h2>
                <p className="text-xs text-text-secondary">
                  Desactivaremos todos tus portales y cancelaremos las
                  suscripciones vinculadas. Por integridad y auditoría,
                  conservaremos el historial de citas y pagos.
                </p>
              </div>
              <button
                type="button"
                disabled={!accountEmail || deletingAccount}
                onClick={() => setDeleteDialogOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-danger text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar mi cuenta</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: POLÍTICAS Y RESERVAS
           ========================================================================= */}
        {activeTab === "politicas" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Advance Deposit Section */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
                  <Percent className="w-5 h-5 text-grape" />
                  <span>Cobro de Anticipo / Depósito</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Reduce el ausentismo exigiendo un porcentaje de pago previo al
                  confirmar la cita.
                </p>
              </div>

              <SwitchToggle
                id="cobroAnticipo"
                checked={cobroAnticipo}
                onChange={setCobroAnticipo}
                label="Exigir anticipo obligatorio en el portal público"
                description="Al activarlo, el cliente deberá pagar el anticipo en línea mediante pasarela bancaria para asegurar el turno."
              />

              {cobroAnticipo && (
                <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="porcentajeAnticipo"
                      className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      Porcentaje de anticipo sobre el total
                    </label>
                    <span className="font-mono font-bold text-lg text-grape">
                      {porcentajeAnticipo}%
                    </span>
                  </div>

                  <input
                    id="porcentajeAnticipo"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={porcentajeAnticipo}
                    onChange={(e) =>
                      setPorcentajeAnticipo(Number(e.target.value))
                    }
                    className="w-full accent-grape cursor-pointer"
                  />

                  {/* Quick Percentage Chips */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-xs text-text-secondary">
                      Preajustes rápidos:
                    </span>
                    {[10, 20, 30, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPorcentajeAnticipo(pct)}
                        className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-mono font-semibold transition-colors ${
                          porcentajeAnticipo === pct
                            ? "bg-grape text-white"
                            : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-border/40"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Windows (Anticipación mínima / máxima §10) */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-grape" />
                  <span>Ventana de Anticipación para Reservas</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Controla con cuánta antelación y hasta qué fecha futura pueden agendar tus clientes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="anticipacionMinima"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Anticipación Mínima
                  </label>
                  <select
                    id="anticipacionMinima"
                    value={anticipacionMinima}
                    onChange={(e) => setAnticipacionMinima(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  >
                    {ANTICIPACIONES_MINIMAS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-muted">
                    Evita que entren citas sorpresa sin tiempo de preparación.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="anticipacionMaxima"
                    className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Anticipación Máxima
                  </label>
                  <select
                    id="anticipacionMaxima"
                    value={anticipacionMaxima}
                    onChange={(e) => setAnticipacionMaxima(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
                  >
                    {ANTICIPACIONES_MAXIMAS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-muted">
                    Limita el horizonte del calendario para mayor predictibilidad.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Contact Requirements */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
                  <Phone className="w-5 h-5 text-grape" />
                  <span>Datos Requeridos al Cliente</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Define qué información es indispensable ingresar durante el
                  proceso de reserva.
                </p>
              </div>

              {!hasContactMethod && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 flex items-center gap-3 text-xs text-danger"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>
                    <strong>Atención:</strong> Se requiere al menos un medio de
                    contacto (teléfono o correo electrónico) para poder
                    notificar y confirmar reservas con tus clientes.
                  </span>
                </div>
              )}

              <div className="divide-y divide-border">
                <SwitchToggle
                  id="telefonoRequerido"
                  checked={telefonoRequerido}
                  onChange={setTelefonoRequerido}
                  label="Teléfono obligatorio"
                  description="Requerido para enviar confirmaciones y recordatorios por WhatsApp y SMS."
                />

                <SwitchToggle
                  id="emailRequerido"
                  checked={emailRequerido}
                  onChange={setEmailRequerido}
                  label="Correo electrónico obligatorio"
                  description="Permite enviar recibos y enlaces directos para cancelar o reagendar."
                />

                <SwitchToggle
                  id="notasHabilitadas"
                  checked={notasHabilitadas}
                  onChange={setNotasHabilitadas}
                  label="Permitir notas y comentarios del cliente"
                  description="Habilita un campo opcional para que los clientes agreguen especificaciones previas a su turno."
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-grape" />
                    <span>Política de Cancelación y Reembolsos</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Condiciones visibles para el cliente antes de confirmar su
                    cita.
                  </p>
                </div>
                <span className="font-mono text-xs text-text-secondary">
                  {politicaCancelacion.length} / 2000
                </span>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={politicaCancelacion}
                  onChange={(e) => setPoliticaCancelacion(e.target.value)}
                  placeholder="Ejemplo: Las cancelaciones deben realizarse con al menos 24 horas de anticipación para solicitar reembolso de anticipo. Con menos de 24 horas, el depósito no será reembolsable..."
                  className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape"
                />
                <p className="text-[11px] text-text-muted">
                  Este texto se desplegará en el paso de confirmación y en los
                  correos electrónicos de reserva.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: USUARIOS Y ROLES (§10)
           ========================================================================= */}
        {activeTab === "usuarios" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header section with pending controls */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-grape" />
                    <h2 className="font-bricolage font-bold text-lg text-text-primary">
                      Equipo y Permisos de Acceso
                    </h2>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Administra quién puede acceder al panel, gestionar citas, servicios y reportes comerciales.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <PendingBadge
                    label="Pendiente"
                    tooltip="Gestión avanzada de permisos en desarrollo"
                  />
                  <Button variant="secondary" size="sm" disabled className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Invitar usuario</span>
                  </Button>
                </div>
              </div>

              {/* Table of Members */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border text-xs font-medium text-text-secondary">
                      <th className="py-3 px-4">Usuario o colaborador</th>
                      <th className="py-3 px-4">Rol asignado</th>
                      <th className="py-3 px-4">Sucursal</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* Owner / Active Auth User */}
                    <tr className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-grape-soft text-grape font-mono font-bold flex items-center justify-center text-xs shrink-0">
                            {authData?.perfil?.nombres?.[0] || "P"}
                            {authData?.perfil?.apellidos?.[0] || "R"}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">
                              {authData?.perfil?.nombres
                                ? `${authData.perfil.nombres} ${authData.perfil.apellidos || ""}`.trim()
                                : "Propietario del Negocio"}
                            </p>
                            <p className="text-xs text-text-secondary font-mono">
                              {authData?.user?.email || "owner@agendur.com"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="grape" size="sm" dot>
                          Propietario
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary">
                        Todas las sedes
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm" dot>
                          Activo
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-text-muted font-medium select-none">
                          Acceso total
                        </span>
                      </td>
                    </tr>

                    {/* Staff members from useProfesionales */}
                    {profesionalesData?.profesionales?.map((profesional) => (
                      <tr key={profesional.id} className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-surface-alt border border-border text-text-secondary font-mono font-bold flex items-center justify-center text-xs shrink-0">
                              {profesional.nombre?.[0] || "C"}
                              {profesional.apellido?.[0] || "L"}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">
                                {profesional.nombre} {profesional.apellido || ""}
                              </p>
                              <p className="text-xs text-text-secondary font-mono">
                                {profesional.email || "colaborador@negocio.com"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral" size="sm" dot>
                            {profesional.cargo || "Profesional"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-text-secondary">
                          {sucursalesData?.sucursales?.find(
                            (s) => s.id === profesional.sucursal_id || s.id === profesional.sucursalId
                          )?.nombre || "Sede asignada"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={profesional.activo !== false ? "success" : "neutral"}
                            size="sm"
                            dot
                          >
                            {profesional.activo !== false ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <PendingBadge
                              label="Pendiente"
                              tooltip="Gestión avanzada de permisos en desarrollo"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Demo manager role for completeness */}
                    {(!profesionalesData?.profesionales || profesionalesData.profesionales.length === 0) && (
                      <tr className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-surface-alt border border-border text-text-secondary font-mono font-bold flex items-center justify-center text-xs shrink-0">
                              GA
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">
                                Gerente de Operaciones
                              </p>
                              <p className="text-xs text-text-secondary font-mono">
                                gerencia@negocio.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="info" size="sm" dot>
                            Administrador
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-text-secondary">
                          Matriz Centro
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="success" size="sm" dot>
                            Activo
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <PendingBadge
                            label="Pendiente"
                            tooltip="Gestión avanzada de permisos en desarrollo"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Roles matrix info (§10) */}
              <div className="p-4 rounded-xl bg-surface-alt border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-grape" />
                  <span className="text-xs font-medium text-text-secondary">
                    Matriz de roles tipificados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
                    <p className="font-bold text-grape">Propietario</p>
                    <p className="text-text-secondary">
                      Control absoluto de pagos, facturación, sucursales y borrado comercial.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
                    <p className="font-bold text-text-primary">Administrador</p>
                    <p className="text-text-secondary">
                      Gestión completa de agendas, clientes, servicios y personal de la sede.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
                    <p className="font-bold text-text-primary">Profesional / Staff</p>
                    <p className="text-text-secondary">
                      Visualización de su propio calendario y confirmación de turnos asignados.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border/70 space-y-1">
                    <p className="font-bold text-text-primary">Recepcionista</p>
                    <p className="text-text-secondary">
                      Creación rápida de citas manuales, cobro presencial y registro de llegada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                        <p className="whitespace-pre-wrap">{previewRenderedText}</p>
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
