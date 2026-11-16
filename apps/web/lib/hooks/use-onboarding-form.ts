"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthMe, useConfiguracion, useSucursales } from "@/lib/hooks";
import { apiFetch, ApiClientError } from "@/lib/query/api-client";
import { notify } from "@/lib/utils/toast";

export function useOnboardingForm() {
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

  return {
    auth, sucursales, saving, formError, save,
    isLoading: authLoading || configLoading || branchesLoading,
    hasError: Boolean(authError || configError || branchesError),
    values: { nombresValue, apellidosValue, telefonoPerfilValue, nombreNegocioValue, giroComercialValue, paisValue, zonaHoraria, nombreSucursal, direccion, ciudad, estadoProvincia, codigoPostal, telefonoSucursal },
    setters: { setNombres, setApellidos, setTelefonoPerfil, setNombreNegocio, setGiroComercial, setPais, setZonaHoraria, setNombreSucursal, setDireccion, setCiudad, setEstadoProvincia, setCodigoPostal, setTelefonoSucursal },
  };
}
