import { useState } from "react";
import type { ConfigType } from "@/lib/constants/configuracion";

export function useConfiguracionFormState(configuracion: ConfigType) {
  // Tab 1: Perfil Form local state
  const [nombreNegocio, setNombreNegocio] = useState(configuracion.nombreNegocio || "");
  const [giroComercial, setGiroComercial] = useState(configuracion.giroComercial || "");
  const [logoUrl, setLogoUrl] = useState(configuracion.logoUrl || "");
  const [pais, setPais] = useState(configuracion.pais || "MX");
  const [zonaHoraria, setZonaHoraria] = useState(configuracion.zonaHoraria || "America/Mexico_City");
  const [monedaPrincipal, setMonedaPrincipal] = useState(configuracion.monedaPrincipal || "MXN");

  // Tab 2: Políticas Form local state
  const [cobroAnticipo, setCobroAnticipo] = useState(
    Boolean(configuracion.cobroAnticipoObligatorio || configuracion.porcentajeAnticipo > 0)
  );
  const [porcentajeAnticipo, setPorcentajeAnticipo] = useState(
    configuracion.porcentajeAnticipo > 0 ? configuracion.porcentajeAnticipo : 20
  );
  const [anticipacionMinima, setAnticipacionMinima] = useState("2h");
  const [anticipacionMaxima, setAnticipacionMaxima] = useState("30d");
  const [telefonoRequerido, setTelefonoRequerido] = useState(configuracion.telefonoClienteRequerido ?? true);
  const [emailRequerido, setEmailRequerido] = useState(configuracion.emailClienteRequerido ?? true);
  const [notasHabilitadas, setNotasHabilitadas] = useState(configuracion.notasClienteHabilitadas ?? true);
  const [politicaCancelacion, setPoliticaCancelacion] = useState(configuracion.politicaCancelacion || "");

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

  const insertVariable = (varName: string) => {
    if (canalPlantilla === "whatsapp") {
      setPlantillaWhatsApp((prev) => `${prev} ${varName}`);
    } else {
      setPlantillaSMS((prev) => `${prev} ${varName}`);
    }
  };

  return {
    nombreNegocio, setNombreNegocio,
    giroComercial, setGiroComercial,
    logoUrl, setLogoUrl,
    pais, setPais,
    zonaHoraria, setZonaHoraria,
    monedaPrincipal, setMonedaPrincipal,
    cobroAnticipo, setCobroAnticipo,
    porcentajeAnticipo, setPorcentajeAnticipo,
    anticipacionMinima, setAnticipacionMinima,
    anticipacionMaxima, setAnticipacionMaxima,
    telefonoRequerido, setTelefonoRequerido,
    emailRequerido, setEmailRequerido,
    notasHabilitadas, setNotasHabilitadas,
    politicaCancelacion, setPoliticaCancelacion,
    canalPlantilla, setCanalPlantilla,
    tipoPlantilla, setTipoPlantilla,
    plantillaWhatsApp, setPlantillaWhatsApp,
    plantillaSMS, setPlantillaSMS,
    hasContactMethod, isFormValid,
    insertVariable,
  };
}
