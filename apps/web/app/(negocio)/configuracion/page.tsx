"use client";

import { useState, useMemo } from "react";
import {
  Store,
  Sliders,
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
} from "lucide-react";
import { notify } from "@/lib/utils/toast";
import {
  useConfiguracion,
  useUpdateConfiguracion,
  useSuscripcion,
  useAuthMe,
} from "@/lib/hooks";
import type { NegocioConfig } from "@/lib/types";
import { ConfiguracionLoading } from "./loading";

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

type ConfigType = Omit<NegocioConfig, "whatsappNotificaciones"> & {
  id?: string;
  monedaPrincipal?: string;
  logoUrl?: string | null;
};

interface ConfiguracionFormProps {
  configuracion: ConfigType;
  initialTab?: "perfil" | "politicas" | "suscripcion";
}

function ConfiguracionForm({
  configuracion,
  initialTab = "perfil",
}: ConfiguracionFormProps) {
  const [activeTab, setActiveTab] = useState<
    "perfil" | "politicas" | "suscripcion"
  >(initialTab);
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const updateConfiguracion = useUpdateConfiguracion();
  const { data: suscripcionData } = useSuscripcion();
  const { data: authData } = useAuthMe();

  // Form local state initialized directly from props
  const [nombreNegocio, setNombreNegocio] = useState(
    configuracion.nombreNegocio || "",
  );
  const [giroComercial, setGiroComercial] = useState(
    configuracion.giroComercial || "",
  );
  const [pais, setPais] = useState(configuracion.pais || "MX");
  const [zonaHoraria, setZonaHoraria] = useState(
    configuracion.zonaHoraria || "America/Mexico_City",
  );
  const [monedaPrincipal, setMonedaPrincipal] = useState(
    configuracion.monedaPrincipal || "MXN",
  );

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administra los parámetros comerciales, políticas de reserva y
            suscripción de tu negocio.
          </p>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={updateConfiguracion.isPending || !isFormValid}
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-grape hover:bg-grape/90 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus:outline-hidden focus:ring-2 focus:ring-grape focus:ring-offset-2"
        >
          {updateConfiguracion.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Pill Tabs Switcher */}
      <div
        className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit"
        role="tablist"
        aria-label="Pestañas de configuración"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "perfil"}
          onClick={() => setActiveTab("perfil")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
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
          aria-selected={activeTab === "suscripcion"}
          onClick={() => setActiveTab("suscripcion")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
            activeTab === "suscripcion"
              ? "bg-grape text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plan y Suscripción</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: PERFIL COMERCIAL */}
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
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-mint/15 text-mint-dark border border-mint/20">
                  En Línea
                </span>
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-alt hover:bg-border/60 text-text-primary border border-border transition-colors flex items-center gap-1.5 min-h-[36px]"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-mint" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Copiado" : "Copiar enlace"}</span>
                  </button>
                  <a
                    href={`/reserva/${configuracion.slug || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-grape/10 hover:bg-grape/20 text-grape transition-colors flex items-center gap-1.5 min-h-[36px]"
                  >
                    <span>Abrir portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                Este es el enlace directo a tu catálogo de citas para compartir
                por WhatsApp, Instagram y redes sociales. El identificador no es
                modificable para asegurar la vigencia permanente de tus enlaces.
              </p>
            </div>

            {/* General Business Information */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="border-b border-border pb-3">
                <h2 className="font-bricolage font-bold text-lg text-text-primary">
                  Información Comercial
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Datos principales que tus clientes verán al ingresar al portal
                  de reservas.
                </p>
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
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
          </div>
        )}

        {/* TAB 2: POLÍTICAS Y RESERVAS */}
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
                description="Al activarlo, el cliente deberá pagar el anticipo en línea mediante tarjeta bancaria para asegurar el turno."
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
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-text-secondary">
                      Preajustes rápidos:
                    </span>
                    {[10, 20, 30, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPorcentajeAnticipo(pct)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
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
                  className="w-full p-3.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape"
                />
                <p className="text-[11px] text-text-muted">
                  Este texto se desplegará en el paso de confirmación y en los
                  correos electrónicos de reserva.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLAN Y SUSCRIPCIÓN */}
        {activeTab === "suscripcion" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Plan Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-grape" />
                    <h2 className="font-bricolage font-bold text-xl text-text-primary">
                      {planNombre}
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mint/15 text-mint-dark border border-mint/20">
                      Activo
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Suscripción comercial en la plataforma Agendur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenStripePortal}
                  disabled={portalLoading}
                  className="px-4 py-2 rounded-lg bg-surface-alt hover:bg-border/60 text-text-primary border border-border text-xs font-medium transition-colors inline-flex items-center gap-2 min-h-[40px] disabled:opacity-50"
                >
                  {portalLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-grape" />
                  )}
                  <span>Gestionar facturación y pagos</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                </button>
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
                  puedes actualizar tu suscripción a través del portal de
                  Stripe.
                </p>
              </div>

              {/* Plan Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint/15 text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
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
                  <div className="size-5 rounded-full bg-mint/15 text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Recordatorios automáticos
                    </p>
                    <p className="text-text-secondary">
                      Notificaciones directas vía WhatsApp y correo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint/15 text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Vistas de agenda avanzadas
                    </p>
                    <p className="text-text-secondary">
                      Cronograma diario por horas y cuadrícula semanal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                  <div className="size-5 rounded-full bg-mint/15 text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      Soporte prioritario
                    </p>
                    <p className="text-text-secondary">
                      Atención personalizada y respaldos diarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={updateConfiguracion.isPending || !isFormValid}
            className="min-h-[44px] px-6 py-2.5 rounded-lg bg-grape hover:bg-grape/90 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-grape focus:ring-offset-2"
          >
            {updateConfiguracion.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ConfiguracionPage({
  initialTab = "perfil",
}: {
  initialTab?: "perfil" | "politicas" | "suscripcion";
} = {}) {
  const {
    data: configData,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = useConfiguracion();

  const configuracion = configData?.configuracion;
  const showLoading = configLoading && !configData && !configError;
  const showError =
    configError || (!configLoading && configData && !configuracion);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* STATE 1: LOADING (REGLA S.4: Estructura réplica con skeletons) */}
      {showLoading && (
        <div className="space-y-4 animate-pulse" data-testid="config-loading">
          <ConfiguracionLoading />
        </div>
      )}

      {/* STATE 2: ERROR O NO ENCONTRADO */}
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
