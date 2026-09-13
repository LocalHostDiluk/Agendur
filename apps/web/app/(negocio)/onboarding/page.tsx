"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthMe, useConfiguracion, useSucursales } from "@/lib/hooks";
import { apiFetch, ApiClientError } from "@/lib/query/api-client";
import { notify } from "@/lib/utils/toast";

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const labelClass = "space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200";

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
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombres: nombresValue, apellidos: apellidosValue, telefono: telefonoPerfilValue }),
      });
      await apiFetch("/api/negocio/configuracion", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreNegocio: nombreNegocioValue, giroComercial: giroComercialValue, pais: paisValue, zonaHoraria }),
      });
      await apiFetch("/api/negocio/sucursales", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primeraSucursal: true, nombre: nombreSucursal, direccion, ciudad,
          estado_provincia: estadoProvincia, codigo_postal: codigoPostal,
          telefono: telefonoSucursal, zona_horaria: zonaHoraria,
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
    return <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Cargando tus datos…</p>;
  }
  if (auth && !auth.negocio) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">Esta cuenta no tiene un negocio asociado. Contacta a soporte antes de crear una sucursal.</p>;
  }
  if (authError || configError || branchesError) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No pudimos cargar los datos de tu negocio. Recarga la página o vuelve a iniciar sesión.</p>;
  }
  if ((sucursales?.sucursales.length ?? 0) > 0) {
    return <div className="max-w-xl space-y-3"><h1 className="text-2xl font-bold">Tu primera sucursal ya está registrada</h1><p>El onboarding está completo.</p><Link href="/dashboard" className="text-blue-600 underline">Ir al panel</Link></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Completa tu negocio</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Confirma tus datos y registra una ubicación real antes de compartir el portal de reservas.</p>
      </div>
      <form onSubmit={save} className="space-y-6">
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2" aria-labelledby="identity-title">
          <h2 id="identity-title" className="text-lg font-semibold sm:col-span-2">Tu identidad</h2>
          <label className={labelClass}>Nombres<input name="nombres" className={fieldClass} value={nombresValue} onChange={(e) => setNombres(e.target.value)} maxLength={120} required /></label>
          <label className={labelClass}>Apellidos<input name="apellidos" className={fieldClass} value={apellidosValue} onChange={(e) => setApellidos(e.target.value)} maxLength={120} required /></label>
          <label className={labelClass}>Teléfono personal (opcional, + código de país)<input name="telefono_perfil" type="tel" className={fieldClass} value={telefonoPerfilValue} onChange={(e) => setTelefonoPerfil(e.target.value)} placeholder="+528112345678" /></label>
        </section>
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2" aria-labelledby="business-title">
          <h2 id="business-title" className="text-lg font-semibold sm:col-span-2">Negocio</h2>
          <label className={labelClass}>Nombre comercial<input name="nombre_negocio" className={fieldClass} value={nombreNegocioValue} onChange={(e) => setNombreNegocio(e.target.value)} maxLength={200} required /></label>
          <label className={labelClass}>Giro comercial<input name="giro_comercial" className={fieldClass} value={giroComercialValue} onChange={(e) => setGiroComercial(e.target.value)} maxLength={200} required /></label>
          <label className={labelClass}>País (código ISO de dos letras)<input name="pais" className={fieldClass} value={paisValue} onChange={(e) => setPais(e.target.value.toUpperCase())} maxLength={2} pattern="[A-Z]{2}" required /></label>
          <label className={labelClass}>Zona horaria IANA<input name="zona_horaria" className={fieldClass} value={zonaHoraria} onChange={(e) => setZonaHoraria(e.target.value)} placeholder="America/Monterrey" list="zonas-horarias" required /></label>
          <datalist id="zonas-horarias"><option value="America/Monterrey" /><option value="America/Mexico_City" /><option value="America/Cancun" /><option value="America/Tijuana" /></datalist>
          <p className="text-xs text-slate-500 sm:col-span-2">Selecciona la zona donde opera tu negocio; no uses la zona de tu dispositivo si es distinta.</p>
        </section>
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2" aria-labelledby="branch-title">
          <h2 id="branch-title" className="text-lg font-semibold sm:col-span-2">Primera sucursal</h2>
          <label className={labelClass}>Nombre de la sucursal<input name="nombre_sucursal" className={fieldClass} value={nombreSucursal} onChange={(e) => setNombreSucursal(e.target.value)} maxLength={120} required /></label>
          <label className={labelClass}>Teléfono de la sucursal (+ código de país)<input name="telefono_sucursal" type="tel" className={fieldClass} value={telefonoSucursal} onChange={(e) => setTelefonoSucursal(e.target.value)} placeholder="+528112345678" required /></label>
          <label className={labelClass}>Dirección<input name="direccion" className={fieldClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={250} required /></label>
          <label className={labelClass}>Ciudad<input name="ciudad" className={fieldClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={120} required /></label>
          <label className={labelClass}>Estado o provincia<input name="estado_provincia" className={fieldClass} value={estadoProvincia} onChange={(e) => setEstadoProvincia(e.target.value)} maxLength={120} required /></label>
          <label className={labelClass}>Código postal<input name="codigo_postal" className={fieldClass} value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} maxLength={10} required /></label>
        </section>
        {formError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{formError}</p>}
        <button type="submit" disabled={saving || !sucursales} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar y abrir panel"}</button>
      </form>
    </div>
  );
}
