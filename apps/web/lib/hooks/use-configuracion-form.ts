"use client";

import { useState } from "react";
import { notify } from "@/lib/utils/toast";
import { useUpdateConfiguracion } from "@/lib/hooks";
import type { ActiveConfigTab, ConfigTab, ConfigType } from "@/lib/utils/configuracion-constants";
import {
  DEFAULT_PLANTILLA_SMS,
  DEFAULT_PLANTILLA_WHATSAPP,
  normalizeConfigTab,
} from "@/lib/utils/configuracion-helpers";

export function useConfiguracionForm(
  configuracion: ConfigType,
  initialTab: ConfigTab = "perfil",
) {
  const [activeTab, setActiveTab] = useState<ActiveConfigTab>(normalizeConfigTab(initialTab));
  const updateConfiguracion = useUpdateConfiguracion();

  const [nombreNegocio, setNombreNegocio] = useState(configuracion.nombreNegocio || "");
  const [giroComercial, setGiroComercial] = useState(configuracion.giroComercial || "");
  const [logoUrl, setLogoUrl] = useState(configuracion.logoUrl || "");
  const [pais, setPais] = useState(configuracion.pais || "MX");
  const [zonaHoraria, setZonaHoraria] = useState(configuracion.zonaHoraria || "America/Mexico_City");
  const [monedaPrincipal, setMonedaPrincipal] = useState(configuracion.monedaPrincipal || "MXN");

  const [cobroAnticipo, setCobroAnticipo] = useState(
    Boolean(configuracion.cobroAnticipoObligatorio || configuracion.porcentajeAnticipo > 0),
  );
  const [porcentajeAnticipo, setPorcentajeAnticipo] = useState(
    configuracion.porcentajeAnticipo > 0 ? configuracion.porcentajeAnticipo : 20,
  );
  const [anticipacionMinima, setAnticipacionMinima] = useState("2h");
  const [anticipacionMaxima, setAnticipacionMaxima] = useState("30d");
  const [telefonoRequerido, setTelefonoRequerido] = useState(configuracion.telefonoClienteRequerido ?? true);
  const [emailRequerido, setEmailRequerido] = useState(configuracion.emailClienteRequerido ?? true);
  const [notasHabilitadas, setNotasHabilitadas] = useState(configuracion.notasClienteHabilitadas ?? true);
  const [politicaCancelacion, setPoliticaCancelacion] = useState(configuracion.politicaCancelacion || "");

  const [canalPlantilla, setCanalPlantilla] = useState<"whatsapp" | "sms">("whatsapp");
  const [tipoPlantilla, setTipoPlantilla] = useState<"recordatorio" | "confirmacion" | "cancelacion">("recordatorio");
  const [plantillaWhatsApp, setPlantillaWhatsApp] = useState(DEFAULT_PLANTILLA_WHATSAPP);
  const [plantillaSMS, setPlantillaSMS] = useState(DEFAULT_PLANTILLA_SMS);

  const hasContactMethod = telefonoRequerido || emailRequerido;
  const isFormValid = nombreNegocio.trim().length > 0 && hasContactMethod;

  const insertVariable = (varName: string) => {
    if (canalPlantilla === "whatsapp") {
      setPlantillaWhatsApp((prev) => `${prev} ${varName}`);
    } else {
      setPlantillaSMS((prev) => `${prev} ${varName}`);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      notify.error(
        !hasContactMethod
          ? "Debes mantener al menos un medio de contacto (teléfono o correo)."
          : "El nombre del negocio no puede estar vacío.",
      );
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
      notify.success("Configuración guardada", "Los cambios han sido aplicados con éxito.");
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar la configuración.");
    }
  };

  return {
    activeTab, setActiveTab,
    nombreNegocio, setNombreNegocio, giroComercial, setGiroComercial,
    logoUrl, setLogoUrl, pais, setPais, zonaHoraria, setZonaHoraria,
    monedaPrincipal, setMonedaPrincipal, cobroAnticipo, setCobroAnticipo,
    porcentajeAnticipo, setPorcentajeAnticipo, anticipacionMinima, setAnticipacionMinima,
    anticipacionMaxima, setAnticipacionMaxima, telefonoRequerido, setTelefonoRequerido,
    emailRequerido, setEmailRequerido, notasHabilitadas, setNotasHabilitadas,
    politicaCancelacion, setPoliticaCancelacion, canalPlantilla, setCanalPlantilla,
    tipoPlantilla, setTipoPlantilla, plantillaWhatsApp, setPlantillaWhatsApp,
    plantillaSMS, setPlantillaSMS, hasContactMethod, isFormValid,
    insertVariable, handleSave, isSaving: updateConfiguracion.isPending,
  };
}
