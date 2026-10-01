"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useAuthMe, useConfiguracion, useSucursales } from "@/lib/hooks";
import { apiFetch, ApiClientError } from "@/lib/query/api-client";
import { notify } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { PendingBadge } from "@/components/ui/PendingBadge";

const fieldClass =
  "w-full bg-surface-alt/50 border border-border focus:border-grape focus:ring-1 focus:ring-grape rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-hidden";
const labelClass = "space-y-1.5 text-xs font-medium text-text-secondary";

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: auth, isLoading: authLoading, error: authError } = useAuthMe();
  const { data: config, isLoading: configLoading, error: configError } = useConfiguracion();
  const { data: sucursales, isLoading: branchesLoading, error: branchesError } = useSucursales();
  const [nombres, setNombres] = useState<string>();
  const [apellidos, setApellidos] = useState<string>();
  const [telefonoPerfil, setTelefonoPerfil] = useState<string>();
  const [nombreNegocio, setNombreNegocio] = useState<string>();
  const [giroComercial, setGiroComercial] = useState<string>();
  const [pais, setPais] = useState<string>();
  const [zonaHoraria, setZonaHoraria] = useState("");
  const [nombreSucursal, setNombreSucursal] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estadoProvincia, setEstadoProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [telefonoSucursal, setTelefonoSucursal] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (authError instanceof ApiClientError && authError.status === 401) router.replace("/login");
  }, [authError, router]);

  const nombresValue = nombres ?? auth?.perfil?.nombres ?? "";
  const apellidosValue = apellidos ?? auth?.perfil?.apellidos ?? "";
  const telefonoPerfilValue = telefonoPerfil ?? auth?.perfil?.telefono ?? "";
  const nombreNegocioValue = nombreNegocio ?? config?.configuracion.nombreNegocio ?? auth?.negocio?.nombre_comercial ?? "";
  const giroComercialValue = giroComercial ?? config?.configuracion.giroComercial ?? auth?.negocio?.giro_comercial ?? "";
  const paisValue = pais ?? config?.configuracion.pais ?? auth?.negocio?.pais ?? "MX";

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !auth?.negocio || !sucursales || sucursales.sucursales.length > 0) return;
    setFormError("");
    setSaving(true);
    try {
      await apiFetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombres: nombresValue, apellidos: apellidosValue, telefono: telefonoPerfilValue }),
      });
      await apiFetch("/api/negocio/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreNegocio: nombreNegocioValue, giroComercial: giroComercialValue, pais: paisValue, zonaHoraria }),
      });
      await apiFetch("/api/negocio/sucursales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primeraSucursal: true,
          nombre: nombreSucursal,
          direccion,
          ciudad,
          estado_provincia: estadoProvincia,
          codigo_postal: codigoPostal,
          telefono: telefonoSucursal,
          zona_horaria: zonaHoraria,
        }),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales"] }),
        queryClient.invalidateQueries({ queryKey: ["negocio", "configuracion"] }),
        queryClient.invalidateQueries({ queryKey: ["negocio", "suscripcion"] }),
      ]);
      notify.success("Negocio listo", "Tu primera sucursal ya está registrada.");
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "FIRST_BRANCH_EXISTS") {
        await queryClient.invalidateQueries({ queryKey: ["negocio", "sucursales"] });
      }
      setFormError(error instanceof Error ? error.message : "No se pudo completar el negocio.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || configLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p role="status" className="text-sm text-text-secondary">Cargando tus datos…</p>
      </div>
    );
  }
  if (auth && !auth.negocio) {
    return (
      <div className="mx-auto max-w-xl p-6 bg-surface border border-danger/30 rounded-[var(--radius-md)]">
        <p role="alert" className="text-sm text-danger">Esta cuenta no tiene un negocio asociado. Contacta a soporte antes de crear una sucursal.</p>
      </div>
    );
  }
  if (authError || configError || branchesError) {
    return (
      <div className="mx-auto max-w-xl p-6 bg-surface border border-danger/30 rounded-[var(--radius-md)]">
        <p role="alert" className="text-sm text-danger">No pudimos cargar los datos de tu negocio. Recarga la página o vuelve a iniciar sesión.</p>
      </div>
    );
  }
  if ((sucursales?.sucursales.length ?? 0) > 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8 bg-surface border border-border rounded-[var(--radius-md)] shadow-2xs text-center">
        <h1 className="font-bricolage font-bold text-2xl text-text-primary">Tu primera sucursal ya está registrada</h1>
        <p className="text-sm text-text-secondary">El onboarding está completo.</p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-grape px-4 h-10 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Tarjeta de bienvenida con borde perforado y sello circular de progreso (§5.6.1) */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="h-1 w-full bg-gradient-to-r from-grape via-flame to-mint" />
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-8 p-6 sm:p-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configuración inicial del negocio</span>
            </div>
            <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Completa tu negocio
            </h1>
            <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
              Confirma tus datos y registra una ubicación real antes de compartir el portal de reservas.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-grape-soft text-grape border border-grape/30 text-xs font-semibold">
                1. Registrar primera sucursal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
                2. Configurar servicios
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
                3. Recibir reservas
              </span>
            </div>
          </div>

          {/* Talón derecho del Ticket con perforación y sello circular */}
          <div className="md:col-span-4 relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-3">
            <span
              aria-hidden="true"
              className="hidden md:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
            />
            <span
              aria-hidden="true"
              className="hidden md:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              PASO INICIAL
            </span>
            <div
              aria-hidden="true"
              className="sello text-grape border-grape/40 shrink-0"
              style={{ width: "72px", height: "72px", fontSize: "10px" }}
            >
              <span>
                1 / 3
                <br />
                PASOS
              </span>
            </div>
            <span className="text-xs text-text-secondary font-medium">
              0 sedes registradas
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section
          className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
          aria-labelledby="identity-title"
        >
          <h2 id="identity-title" className="font-semibold text-base text-text-primary sm:col-span-2">
            Tu identidad
          </h2>
          <label className={labelClass}>
            <span>Nombres</span>
            <input
              name="nombres"
              className={fieldClass}
              value={nombresValue}
              onChange={(e) => setNombres(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Apellidos</span>
            <input
              name="apellidos"
              className={fieldClass}
              value={apellidosValue}
              onChange={(e) => setApellidos(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center">
              Teléfono personal (opcional)
              <PendingBadge
                label="Opcional"
                tooltip="Dato opcional para contacto del administrador"
                className="ml-2"
              />
            </span>
            <input
              name="telefono_perfil"
              type="tel"
              className={`${fieldClass} font-mono tabular-nums`}
              value={telefonoPerfilValue}
              onChange={(e) => setTelefonoPerfil(e.target.value)}
              placeholder="+528112345678"
            />
          </label>
        </section>

        <section
          className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
          aria-labelledby="business-title"
        >
          <h2 id="business-title" className="font-semibold text-base text-text-primary sm:col-span-2">
            Negocio
          </h2>
          <label className={labelClass}>
            <span>Nombre comercial</span>
            <input
              name="nombre_negocio"
              className={fieldClass}
              value={nombreNegocioValue}
              onChange={(e) => setNombreNegocio(e.target.value)}
              maxLength={200}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Giro comercial</span>
            <input
              name="giro_comercial"
              className={fieldClass}
              value={giroComercialValue}
              onChange={(e) => setGiroComercial(e.target.value)}
              maxLength={200}
              required
            />
          </label>
          <label className={labelClass}>
            <span>País (código ISO de dos letras)</span>
            <input
              name="pais"
              className={`${fieldClass} font-mono uppercase`}
              value={paisValue}
              onChange={(e) => setPais(e.target.value.toUpperCase())}
              maxLength={2}
              pattern="[A-Z]{2}"
              required
            />
          </label>
          <label className={labelClass}>
            <span>Zona horaria IANA</span>
            <input
              name="zona_horaria"
              className={fieldClass}
              value={zonaHoraria}
              onChange={(e) => setZonaHoraria(e.target.value)}
              placeholder="America/Monterrey"
              list="zonas-horarias"
              required
            />
          </label>
          <datalist id="zonas-horarias">
            <option value="America/Monterrey" />
            <option value="America/Mexico_City" />
            <option value="America/Cancun" />
            <option value="America/Tijuana" />
          </datalist>
          <p className="text-xs text-text-muted sm:col-span-2">
            Selecciona la zona donde opera tu negocio; no uses la zona de tu dispositivo si es distinta.
          </p>
        </section>

        <section
          className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
          aria-labelledby="branch-title"
        >
          <h2 id="branch-title" className="font-semibold text-base text-text-primary sm:col-span-2">
            Primera sucursal
          </h2>
          <label className={labelClass}>
            <span>Nombre de la sucursal</span>
            <input
              name="nombre_sucursal"
              className={fieldClass}
              value={nombreSucursal}
              onChange={(e) => setNombreSucursal(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Teléfono de la sucursal (+ código de país)</span>
            <input
              name="telefono_sucursal"
              type="tel"
              className={`${fieldClass} font-mono tabular-nums`}
              value={telefonoSucursal}
              onChange={(e) => setTelefonoSucursal(e.target.value)}
              placeholder="+528112345678"
              required
            />
          </label>
          <label className={labelClass}>
            <span>Dirección</span>
            <input
              name="direccion"
              className={fieldClass}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              maxLength={250}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Ciudad</span>
            <input
              name="ciudad"
              className={fieldClass}
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Estado o provincia</span>
            <input
              name="estado_provincia"
              className={fieldClass}
              value={estadoProvincia}
              onChange={(e) => setEstadoProvincia(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Código postal</span>
            <input
              name="codigo_postal"
              className={`${fieldClass} font-mono tabular-nums`}
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              maxLength={10}
              required
            />
          </label>
        </section>

        {formError && (
          <p role="alert" className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-md)] p-3">
            {formError}
          </p>
        )}

        <div>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            disabled={saving || !sucursales}
          >
            Guardar y abrir panel
          </Button>
        </div>
      </form>
    </div>
  );
}
