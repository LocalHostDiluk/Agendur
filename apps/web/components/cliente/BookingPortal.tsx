"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCatalogo } from "@/lib/hooks/use-catalogo";
import { useDisponibilidad } from "@/lib/hooks/use-disponibilidad";
import { useCrearReserva } from "@/lib/hooks/use-reserva";
import { ApiClientError } from "@/lib/query/api-client";
import { BookingCalendar } from "./BookingCalendar";
import { BlurText } from "./BlurText";
import { triggerBookingConfetti } from "@/lib/utils/confetti";
import { downloadIcsFile } from "@/lib/utils/calendar-event";
import { BusinessNotFound } from "@/components/errors/BusinessNotFound";
import { PortalSkeletons } from "./PortalSkeletons";
import type { Cita } from "@/lib/types";

interface BookingPortalProps {
  negocioSlug: string;
}

type StepKey = "sucursal" | "fecha" | "servicio" | "hora" | "datos";

const DIAS_ABREV = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES_LARGOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDateReadable(fechaStr: string): string {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = DIAS_ABREV[date.getUTCDay()];
  const monthName = MESES_LARGOS[date.getUTCMonth()];
  return `${dow}, ${d} de ${monthName} de ${y}`;
}

function formatDateShort(fechaStr: string): string {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = DIAS_ABREV[date.getUTCDay()];
  const monthName = MESES_LARGOS[date.getUTCMonth()].slice(0, 3);
  return `${dow} ${d} ${monthName}`;
}

function getNext3Days(
  fechaStr: string,
): Array<{ dateStr: string; label: string }> {
  if (!fechaStr) return [];
  const [y, m, d] = fechaStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const results: Array<{ dateStr: string; label: string }> = [];

  for (let i = 1; i <= 3; i++) {
    const next = new Date(base);
    next.setUTCDate(base.getUTCDate() + i);
    const ny = next.getUTCFullYear();
    const nm = (next.getUTCMonth() + 1).toString().padStart(2, "0");
    const nd = next.getUTCDate().toString().padStart(2, "0");
    const dow = DIAS_ABREV[next.getUTCDay()];
    results.push({
      dateStr: `${ny}-${nm}-${nd}`,
      label: `${dow} ${nd}`,
    });
  }
  return results;
}

export function BookingPortal({ negocioSlug }: BookingPortalProps) {
  const catalogo = useCatalogo(negocioSlug);
  const reserva = useCrearReserva();

  const data = catalogo.data?.data;
  const negocio = data?.negocio;
  const sucursales = data?.sucursales ?? [];
  const servicios = data?.servicios ?? [];
  const todosProfesionales = data?.profesionales ?? [];

  // B.2: Si sucursales.length > 1 -> 5 pasos; si sucursales.length === 1 -> 4 pasos (omite Sucursal)
  const isMultiBranch = sucursales.length > 1;

  const stepsList: Array<{ key: StepKey; label: string; title: string }> =
    isMultiBranch
      ? [
          { key: "sucursal", label: "Sucursal", title: "¿En qué sucursal?" },
          { key: "fecha", label: "Fecha", title: "Elige el día" },
          {
            key: "servicio",
            label: "Servicio",
            title: "¿Qué servicio necesitas?",
          },
          { key: "hora", label: "Hora", title: "Elige tu horario" },
          { key: "datos", label: "Datos", title: "Solo faltan tus datos" },
        ]
      : [
          { key: "fecha", label: "Fecha", title: "Elige el día" },
          {
            key: "servicio",
            label: "Servicio",
            title: "¿Qué servicio necesitas?",
          },
          { key: "hora", label: "Hora", title: "Elige tu horario" },
          { key: "datos", label: "Datos", title: "Solo faltan tus datos" },
        ];

  // Estado del Wizard
  const [currentStepKey, setCurrentStepKey] = useState<StepKey>(
    isMultiBranch ? "sucursal" : "fecha",
  );

  // Estados de selección de cita
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [servicioId, setServicioId] = useState<string>("");
  const [profesionalId, setProfesionalId] = useState<string>(""); // "" = "Cualquier profesional disponible"
  const [hora, setHora] = useState<string>("");

  // Estados del formulario del cliente
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [privacidad, setPrivacidad] = useState<boolean>(false);
  const [cancelacion, setCancelacion] = useState<boolean>(false);

  // Estados de feedback
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [cita, setCita] = useState<Cita | null>(null);
  const [showCancelInfo, setShowCancelInfo] = useState<boolean>(false);

  // REGLA B.2: Si hay 1 sola sucursal, omitir sucursal y arrancar directamente en fecha
  const activeStepKey: StepKey =
    !isMultiBranch && currentStepKey === "sucursal" ? "fecha" : currentStepKey;

  // Color de acento de marca (REGLA B.11 & B.13: default #6E49A6)
  const accentColor = "var(--grape)";

  // Sucursal y servicio activos (autoselecciona matriz o primera sede si no hay selección manual)
  const defaultSucursal = sucursales.find((s) => s.es_matriz) || sucursales[0];
  const sucursalActiva =
    sucursales.find((s) => s.id === selectedSucursalId) || defaultSucursal;
  const servicioActivo = servicios.find((s) => s.id === servicioId);

  // Profesionales disponibles para la sucursal y servicio seleccionados
  const profesionalesDisponibles = todosProfesionales.filter((p) => {
    const enSucursal = p.sucursal_id === sucursalActiva?.id;
    if (!servicioActivo) return enSucursal;
    return enSucursal && (p.serviciosIds ?? []).includes(servicioActivo.id);
  });

  const profesionalActivo = profesionalesDisponibles.find(
    (p) => p.id === profesionalId,
  );

  // Consulta de disponibilidad en tiempo real
  const disponibilidad = useDisponibilidad({
    sucursalId: sucursalActiva?.id,
    servicioId: servicioActivo?.id,
    profesionalId: profesionalActivo?.id,
    fecha: fecha || undefined,
  });

  const horarios = disponibilidad.data?.horarios ?? [];
  const horaDisponible = horarios.includes(hora) ? hora : "";

  // Franjas horarias: Mañana, Tarde, Noche (REGLA B.19: si está vacía, no mostrar encabezado)
  const slotsManana = horarios.filter(
    (h) => parseInt(h.split(":")[0], 10) < 12,
  );
  const slotsTarde = horarios.filter((h) => {
    const hr = parseInt(h.split(":")[0], 10);
    return hr >= 12 && hr < 18;
  });
  const slotsNoche = horarios.filter(
    (h) => parseInt(h.split(":")[0], 10) >= 18,
  );

  // REGLA B.5: Invalidaciones en cascada
  function handleSelectSucursal(id: string) {
    if (id !== selectedSucursalId) {
      setSelectedSucursalId(id);
      setServicioId("");
      setHora("");
      setNotice("Actualizamos los horarios disponibles.");
      setTimeout(() => setNotice(""), 3500);
    }
  }

  function handleSelectFecha(newDate: string) {
    if (newDate !== fecha) {
      setFecha(newDate);
      setServicioId("");
      setHora("");
      setNotice("Actualizamos los horarios disponibles.");
      setTimeout(() => setNotice(""), 3500);
    }
  }

  function handleSelectServicio(id: string) {
    if (id !== servicioId) {
      setServicioId(id);
      setHora("");
      setNotice("Actualizamos los horarios disponibles.");
      setTimeout(() => setNotice(""), 3500);
    }
  }

  // Validación de pasos (REGLA B.6)
  const isSucursalValid = Boolean(
    sucursalActiva?.id && sucursalActiva.activa !== false,
  );
  const isFechaValid = Boolean(fecha);
  const isServicioValid = Boolean(servicioActivo?.id);
  const isHoraValid = Boolean(horaDisponible);
  const isDatosValid = Boolean(
    nombre.trim() &&
    apellido.trim() &&
    (!negocio?.email_cliente_requerido || email.trim()) &&
    (!negocio?.telefono_cliente_requerido || telefono.trim()) &&
    privacidad &&
    (!negocio?.politica_cancelacion?.trim() || cancelacion),
  );

  function isStepValid(key: StepKey): boolean {
    switch (key) {
      case "sucursal":
        return isSucursalValid;
      case "fecha":
        return isFechaValid;
      case "servicio":
        return isServicioValid;
      case "hora":
        return isHoraValid;
      case "datos":
        return isDatosValid;
    }
  }

  const currentStepIndex = stepsList.findIndex((s) => s.key === activeStepKey);
  const canAdvance = isStepValid(activeStepKey);

  // Navegación del wizard
  function handleNextStep() {
    if (!canAdvance) return;
    if (currentStepIndex < stepsList.length - 1) {
      setCurrentStepKey(stepsList[currentStepIndex + 1].key);
    }
  }

  function handlePrevStep() {
    if (currentStepIndex > 0) {
      setCurrentStepKey(stepsList[currentStepIndex - 1].key);
    }
  }

  function handleGoToStep(targetKey: StepKey) {
    const targetIdx = stepsList.findIndex((s) => s.key === targetKey);
    // REGLA B.4: Solo se puede regresar a pasos anteriores completados
    if (targetIdx < currentStepIndex) {
      setCurrentStepKey(targetKey);
    }
  }

  // Envío de la reserva
  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !negocio ||
      !sucursalActiva ||
      !servicioActivo ||
      !fecha ||
      !horaDisponible
    ) {
      setError(
        "Por favor completa todos los pasos de la cita antes de confirmar.",
      );
      return;
    }

    const profIdFinal =
      profesionalActivo?.id || profesionalesDisponibles[0]?.id;
    if (!profIdFinal) {
      setError("No hay personal disponible para este servicio en esta fecha.");
      return;
    }

    try {
      const result = await reserva.mutateAsync({
        sucursalId: sucursalActiva.id,
        servicioId: servicioActivo.id,
        profesionalId: profIdFinal,
        fecha,
        hora: horaDisponible,
        clienteNombre: nombre.trim(),
        clienteApellido: apellido.trim(),
        clientePhone: telefono.trim() || null,
        clienteEmail: email.trim() || null,
        notasCliente: negocio.notas_cliente_habilitadas
          ? notas.trim()
          : undefined,
        aceptaPrivacidad: privacidad,
        aceptaPoliticaCancelacion: cancelacion,
      });

      setCita(result.cita);
      triggerBookingConfetti();
    } catch (cause) {
      // Caso 7 (B.8): Horario ocupado (409) -> mensaje y retorno automático al Paso 4
      if (cause instanceof ApiClientError && cause.status === 409) {
        setHora("");
        await disponibilidad.refetch();
        setError(
          "Ese horario acaba de ocuparse. Elige otro, por favor. ya no está disponible.",
        );
        setCurrentStepKey("hora");
      } else {
        // Caso 8 (B.8): Error de red conservando datos
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo completar la reserva. Intenta de nuevo.",
        );
      }
    }
  }

  // Estado de carga inicial (REGLA 2.2: Skeletons en lugar de spinner redundante)
  if (catalogo.isPending) {
    return <PortalSkeletons />;
  }

  // Negocio no encontrado (REGLA A.6 / A.10)
  if (catalogo.isError || !negocio) {
    return <BusinessNotFound />;
  }

  // PANTALLA DE CONFIRMACIÓN A PANTALLA COMPLETA (B.10)
  if (cita) {
    const profNombre = profesionalActivo
      ? `${profesionalActivo.nombre} ${profesionalActivo.apellido}`
      : "Especialista asignado";

    const calendarEvent = {
      title: `${servicioActivo?.nombre || "Cita"} en ${negocio.nombre_comercial}`,
      description: `Cita reservada en ${sucursalActiva?.nombre || ""}. Profesional: ${profNombre}.`,
      location: `${sucursalActiva?.nombre || ""}, ${sucursalActiva?.direccion || ""}, ${sucursalActiva?.ciudad || ""}`,
      fecha: cita.fecha,
      horaInicio: cita.hora_inicio ? cita.hora_inicio.slice(0, 5) : "00:00",
      duracionMinutos: servicioActivo?.duracion_minutos || 45,
    };

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${negocio.nombre_comercial} ${sucursalActiva?.direccion || ""} ${sucursalActiva?.ciudad || ""}`,
    )}`;

    return (
      <div className="min-h-screen bg-[#1D1720] text-[#F3EEDF] py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
        {/* Encabezado de confirmación */}
        <div className="max-w-md w-full text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#46B88A]/15 border border-[#46B88A]/30 flex items-center justify-center text-[#46B88A] animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-bricolage text-[28px] font-bold text-[#F3EEDF] leading-tight">
            ¡Listo! Tu cita está confirmada.
          </h1>
          <h2 className="sr-only">Reserva registrada</h2>
          <p className="font-sans text-sm text-[#F3EEDF]/65 mt-1.5">
            Hemos registrado tu turno con éxito.
          </p>
        </div>

        {/* Ticket Emitido de 400px con muescas en --ink (B.10) */}
        <div className="ticket-on-ink max-w-[400px] w-full bg-[#FFFFFF] text-[#211A26] rounded-2xl shadow-2xl overflow-hidden mb-6 relative">
          <div className="p-6 text-center border-b border-dashed border-[#E7E1D3]">
            <h2 className="font-bricolage text-lg font-bold text-[#211A26]">
              {negocio.nombre_comercial}
            </h2>
            <p className="text-xs text-[#A39C8C] mt-0.5">
              {sucursalActiva?.nombre}
            </p>

            {/* Fecha y hora en Space Mono 22px peso 700 */}
            <div className="mt-4 p-3.5 bg-[var(--surface-alt,#F0ECE0)] rounded-xl border border-[#E7E1D3]/80 inline-block w-full">
              <p className="font-mono text-[22px] font-bold text-[#211A26] tracking-tight">
                {cita.hora_inicio
                  ? cita.hora_inicio.slice(0, 5)
                  : horaDisponible}{" "}
                <span className="text-sm font-normal text-[#A39C8C]">hrs</span>
              </p>
              <p className="font-sans text-sm font-medium text-[#6B6355] mt-0.5">
                {formatDateReadable(cita.fecha)}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[#A39C8C]">Servicio:</span>
              <span className="font-semibold text-[#211A26] text-right">
                {servicioActivo?.nombre} ({servicioActivo?.duracion_minutos}{" "}
                min)
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-[#A39C8C]">Profesional:</span>
              <span className="font-medium text-[#211A26]">{profNombre}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-[#A39C8C]">Cliente:</span>
              <span className="font-medium text-[#211A26]">
                {nombre} {apellido}
              </span>
            </div>

            {sucursalActiva && (
              <div className="flex justify-between items-baseline py-0.5">
                <span className="text-[#A39C8C]">Ubicación:</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-grape hover:underline text-right text-xs max-w-[200px]"
                >
                  {sucursalActiva.direccion}, {sucursalActiva.ciudad}
                </a>
              </div>
            )}

            <div className="perforacion my-2" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#A39C8C]">Total:</span>
              <span className="font-mono text-lg font-bold text-grape">
                ${servicioActivo?.precio} {negocio.moneda_principal}
              </span>
            </div>

            <div className="pt-2 text-center">
              <span className="font-mono text-[13px] text-[#A39C8C] tracking-wider font-semibold">
                #AG-{cita.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Botones Apilados de 400px */}
        <div className="max-w-[400px] w-full space-y-2.5">
          <button
            type="button"
            onClick={() => downloadIcsFile(calendarEvent)}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-grape hover:bg-grape/90 text-white font-semibold text-sm transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            Agregar a mi calendario
          </button>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-[#F3EEDF]/25 bg-transparent hover:bg-white/5 text-[#F3EEDF] font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-center"
          >
            <MapPin className="w-4 h-4 text-flame" />
            Ver ubicación
          </a>

          <button
            type="button"
            onClick={() => setShowCancelInfo(!showCancelInfo)}
            className="w-full min-h-[44px] py-2 px-4 text-xs text-[#D14343] hover:text-[#D14343]/80 transition-colors underline cursor-pointer"
          >
            Cancelar cita
          </button>

          {showCancelInfo && sucursalActiva && (
            <div className="p-3 bg-[#2A2130] rounded-xl border border-[#F3EEDF]/15 text-xs text-[#F3EEDF]/80 animate-in fade-in">
              Para cancelar o reprogramar tu cita, comunícate directamente con
              la sucursal al{" "}
              <span className="font-bold text-[#F3EEDF]">
                {sucursalActiva.telefono || "teléfono de la sede"}
              </span>{" "}
              con al menos 24 hrs de antelación.
            </div>
          )}

          <p className="text-center font-sans text-sm text-[#F3EEDF]/65 pt-2">
            Te enviaremos un recordatorio por WhatsApp antes de tu cita.
          </p>

          <p className="text-center text-[13px] font-sans text-[#A39C8C] pt-4">
            Reservas con{" "}
            <Link href="/" className="font-semibold text-grape hover:underline">
              Agendur
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // WIZARD DE PASOS PRINCIPAL (B.3)
  const currentStepTitle = stepsList[currentStepIndex]?.title || "";

  return (
    <div className="min-h-screen bg-[var(--paper,#F3EEDF)] text-text-primary flex flex-col lg:flex-row">
      {/* =========================================================================
          MOBILE HEADER COMPACTO (72px, fondo --ink) (<1024px)
          ========================================================================= */}
      <header className="lg:hidden h-[72px] bg-[#1D1720] text-[#F3EEDF] px-4 flex items-center justify-between border-b border-[#F3EEDF]/10 shrink-0">
        <div className="flex items-center gap-2.5">
          {negocio.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={negocio.logo_url}
              alt={negocio.nombre_comercial}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-grape text-white font-bricolage font-bold text-sm flex items-center justify-center">
              {negocio.nombre_comercial.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-bricolage text-base font-bold text-[#F3EEDF] truncate max-w-[200px]">
            {negocio.nombre_comercial}
          </span>
        </div>

        <Link
          href="/"
          className="text-xs font-medium text-[#F3EEDF]/65 hover:text-[#F3EEDF] transition-colors"
        >
          Agendur
        </Link>
      </header>

      {/* =========================================================================
          COLUMNA IZQUIERDA DESKTOP (380px, fondo --ink #1D1720) (≥1024px) (B.3 & B.4)
          ========================================================================= */}
      <aside className="hidden lg:flex w-[380px] shrink-0 bg-[#1D1720] text-[#F3EEDF] p-8 flex-col justify-between min-h-screen sticky top-0 border-r border-[#F3EEDF]/10">
        <div>
          {/* Logo y Nombre del negocio (B.3) */}
          <div className="mb-6">
            {negocio.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={negocio.logo_url}
                alt={negocio.nombre_comercial}
                className="h-12 w-auto max-w-[200px] object-contain rounded-xl mb-3"
              />
            ) : null}
            <h1 className="font-bricolage text-[24px] font-bold text-[#F3EEDF] leading-tight">
              {negocio.nombre_comercial}
            </h1>
            <h2 className="sr-only">Reservar en {negocio.nombre_comercial}</h2>
            {sucursalActiva && (
              <p className="font-sans text-sm text-[#F3EEDF]/65 mt-1">
                {sucursalActiva.nombre} — {sucursalActiva.direccion}
              </p>
            )}
          </div>

          {/* Ticket de Resumen (B.4 y REGLA B.15, B.16) */}
          <div className="ticket-on-ink bg-[#FFFFFF] text-[#211A26] rounded-2xl p-6 shadow-2xl relative my-6">
            {/* Encabezado */}
            <div className="text-center pb-2">
              <span className="font-mono text-[11px] font-bold text-[#A39C8C] tracking-[0.1em] uppercase">
                TU RESERVA
              </span>
            </div>

            <div className="perforacion my-3" />

            {/* Filas de datos obligatorias: Sucursal, Fecha, Servicio, Hora, Profesional */}
            <div className="space-y-3.5 py-1">
              {/* 1. Sucursal */}
              <div>
                <div className="text-[12px] font-sans text-[#A39C8C]">
                  Sucursal
                </div>
                {sucursalActiva ? (
                  <BlurText
                    key={sucursalActiva.id}
                    className="text-[15px] font-sans font-semibold text-[#211A26] block"
                  >
                    {sucursalActiva.nombre}
                  </BlurText>
                ) : (
                  <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
                )}
              </div>

              {/* 2. Fecha */}
              <div>
                <div className="text-[12px] font-sans text-[#A39C8C]">
                  Fecha
                </div>
                {fecha ? (
                  <BlurText
                    key={fecha}
                    className="font-mono text-[15px] font-semibold text-[#211A26] block"
                  >
                    {formatDateShort(fecha)}
                  </BlurText>
                ) : (
                  <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
                )}
              </div>

              {/* 3. Servicio */}
              <div>
                <div className="text-[12px] font-sans text-[#A39C8C]">
                  Servicio
                </div>
                {servicioActivo ? (
                  <BlurText
                    key={servicioActivo.id}
                    className="text-[15px] font-sans font-semibold text-[#211A26] block"
                  >
                    {servicioActivo.nombre}
                  </BlurText>
                ) : (
                  <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
                )}
              </div>

              {/* 4. Hora */}
              <div>
                <div className="text-[12px] font-sans text-[#A39C8C]">Hora</div>
                {horaDisponible ? (
                  <BlurText
                    key={horaDisponible}
                    className="font-mono text-[15px] font-semibold text-grape block"
                  >
                    {horaDisponible} hrs
                  </BlurText>
                ) : (
                  <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
                )}
              </div>

              {/* 5. Profesional */}
              <div>
                <div className="text-[12px] font-sans text-[#A39C8C]">
                  Profesional
                </div>
                {profesionalActivo ? (
                  <BlurText
                    key={profesionalActivo.id}
                    className="text-[15px] font-sans font-semibold text-[#211A26] block"
                  >
                    {profesionalActivo.nombre} {profesionalActivo.apellido}
                  </BlurText>
                ) : horaDisponible ||
                  activeStepKey === "hora" ||
                  activeStepKey === "datos" ? (
                  <BlurText
                    key="cualquiera"
                    className="text-[15px] font-sans font-semibold text-[#211A26] block"
                  >
                    Cualquier profesional disponible
                  </BlurText>
                ) : (
                  <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
                )}
              </div>
            </div>

            <div className="perforacion my-3" />

            {/* Pie con duración y precio en Space Mono */}
            <div className="pt-1 flex items-baseline justify-between text-xs">
              <span className="text-[#6B6355] font-sans">
                {servicioActivo
                  ? `${servicioActivo.duracion_minutos} min`
                  : "Total"}
              </span>
              <span className="font-mono text-base font-bold text-[#211A26]">
                {servicioActivo
                  ? `$${servicioActivo.precio} ${negocio.moneda_principal}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Pie con marca Agendur */}
        <div className="pt-6 border-t border-[#F3EEDF]/15 text-center">
          <p className="text-[13px] font-sans text-[#A39C8C]">
            Reservas con{" "}
            <Link href="/" className="font-semibold text-grape hover:underline">
              Agendur
            </Link>
          </p>
        </div>
      </aside>

      {/* =========================================================================
          COLUMNA DERECHA: WIZARD DE PASOS (B.3 & B.5)
          ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pb-24 lg:pb-12 overflow-y-auto">
        <div className="max-w-[560px] w-full mx-auto">
          {/* STEPPER / INDICADOR DE PROGRESO (B.5 & REGLA B.17) */}
          <div className="w-full mb-8" aria-label="Progreso de la reserva">
            <div className="flex items-center justify-between">
              {stepsList.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    {/* Círculo del paso */}
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleGoToStep(step.key)}
                        title={`Volver a ${step.label}`}
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-full bg-grape flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </span>
                        <span className="text-[13px] font-sans text-text-primary hidden sm:inline group-hover:underline">
                          {step.label}
                        </span>
                      </button>
                    ) : isActive ? (
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full border-2 border-grape bg-transparent flex items-center justify-center font-mono text-sm font-bold text-grape">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] font-sans font-semibold text-text-primary hidden sm:inline">
                          {step.label}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full border border-border bg-surface-alt flex items-center justify-center font-mono text-sm text-text-muted">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] font-sans text-text-muted hidden sm:inline">
                          {step.label}
                        </span>
                      </div>
                    )}

                    {/* Línea conectora entre círculos */}
                    {idx < stepsList.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors duration-300 ${
                          idx < currentStepIndex ? "bg-grape" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aviso breve de actualización en cascada (REGLA B.5) */}
          {notice && (
            <div className="mb-4 p-3 rounded-xl bg-grape/10 border border-grape/20 text-xs font-sans text-grape flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* FORMULARIO CONTENEDOR DEL WIZARD (Conserva inputs en el DOM para compatibilidad con SSR y tests) */}
          <form
            id="wizard-reserva-form"
            onSubmit={handleBooking}
            className="space-y-6"
          >
            {/* Campos accesibles y hidden inputs requeridos por tests */}
            <input
              type="hidden"
              id="reserva-sucursal-hidden"
              name="sucursalId"
              value={sucursalActiva?.id ?? ""}
            />

            <select
              id="reserva-sucursal"
              value={sucursalActiva?.id ?? ""}
              onChange={(e) => handleSelectSucursal(e.target.value)}
              className="sr-only"
              aria-label="Sucursal"
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {s.direccion}
                </option>
              ))}
            </select>

            <input
              id="reserva-fecha"
              type="date"
              aria-label="Fecha"
              value={fecha}
              onChange={(e) => handleSelectFecha(e.target.value)}
              className="sr-only"
            />

            <select
              id="reserva-servicio"
              value={servicioId}
              onChange={(e) => handleSelectServicio(e.target.value)}
              className="sr-only"
              aria-label="Servicio"
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {s.duracion_minutos} min — {s.precio}{" "}
                  {negocio.moneda_principal}
                </option>
              ))}
            </select>

            <select
              id="reserva-profesional"
              value={profesionalId}
              onChange={(e) => {
                setProfesionalId(e.target.value);
                setHora("");
              }}
              className="sr-only"
              aria-label="Profesional"
            >
              <option value="">Cualquier profesional disponible</option>
              {profesionalesDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>

            <select
              id="reserva-hora"
              value={horaDisponible}
              onChange={(e) => setHora(e.target.value)}
              className="sr-only"
              aria-label="Horario"
            >
              <option value="">Selecciona un horario</option>
              {horarios.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {/* -------------------------------------------------------------
                PASO 1 — SUCURSAL (Solo si sucursales.length > 1) (B.6)
                ------------------------------------------------------------- */}
            {isMultiBranch && (
              <div
                id="paso-sucursal"
                style={{
                  display: activeStepKey === "sucursal" ? "block" : "none",
                }}
                className="space-y-6 animate-in fade-in duration-200"
              >
                <div>
                  <h2 className="font-bricolage text-2xl font-bold text-text-primary">
                    {currentStepTitle}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Selecciona la sede donde deseas recibir tu servicio.
                  </p>
                </div>

                <div className="space-y-3">
                  {sucursales.map((s) => {
                    const isSelected = s.id === sucursalActiva?.id;
                    const isClosed = s.activa === false;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isClosed}
                        onClick={() => handleSelectSucursal(s.id)}
                        className={`w-full min-h-[56px] text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-2 border-grape bg-grape-soft shadow-sm"
                            : isClosed
                              ? "border-border bg-surface opacity-50 cursor-not-allowed"
                              : "border-border bg-surface hover:bg-surface-alt"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-base font-semibold text-text-primary">
                              {s.nombre}
                            </span>
                            {s.es_matriz && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">
                                Matriz
                              </span>
                            )}
                            {isClosed && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                                Cerrada temporalmente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">
                            {s.direccion}
                            {s.ciudad ? `, ${s.ciudad}` : ""}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Hoy: 09:00 - 19:00
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!isSucursalValid}
                    onClick={handleNextStep}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-grape text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grape/90 cursor-pointer flex items-center gap-2"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                PASO 2 — FECHA (Calendario mensual) (B.6 & B.7)
                ------------------------------------------------------------- */}
            <div
              id="paso-fecha"
              style={{ display: activeStepKey === "fecha" ? "block" : "none" }}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <h2 className="font-bricolage text-2xl font-bold text-text-primary">
                  {currentStepTitle}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Consulta los días disponibles para tu cita.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <BookingCalendar
                  selectedDate={fecha}
                  onSelectDate={handleSelectFecha}
                  accentColor={accentColor}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                {isMultiBranch ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  disabled={!isFechaValid}
                  onClick={handleNextStep}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-grape text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grape/90 cursor-pointer flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                PASO 3 — SERVICIO (Lista vertical con Space Mono y duración) (B.6)
                ------------------------------------------------------------- */}
            <div
              id="paso-servicio"
              style={{
                display: activeStepKey === "servicio" ? "block" : "none",
              }}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <h2 className="font-bricolage text-2xl font-bold text-text-primary">
                  {currentStepTitle}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Disponibles el{" "}
                  {fecha ? formatDateReadable(fecha) : "día seleccionado"}
                </p>
              </div>

              {servicios.length === 0 ? (
                // Caso 5 (B.8): Sin servicios configurados
                <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-surface">
                  <p className="text-sm text-text-secondary">
                    Este negocio aún no tiene servicios disponibles para
                    reservar en línea.
                  </p>
                  {sucursalActiva?.telefono && (
                    <p className="text-xs text-text-muted mt-2">
                      Comunícate al{" "}
                      <a
                        href={`tel:${sucursalActiva.telefono}`}
                        className="text-grape underline"
                      >
                        {sucursalActiva.telefono}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {servicios.map((s) => {
                    const isSelected = s.id === servicioActivo?.id;

                    return (
                      <button
                        key={s.id}
                        id={`reserva-servicio-${s.id}`}
                        data-servicio-id={s.id}
                        type="button"
                        onClick={() => handleSelectServicio(s.id)}
                        className={`w-full min-h-[56px] text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                          isSelected
                            ? "border-2 border-grape bg-grape-soft shadow-sm"
                            : "border-border bg-surface hover:bg-surface-alt"
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="font-sans text-base font-semibold text-text-primary">
                            {s.nombre}
                          </h3>
                          {s.descripcion && (
                            <p className="font-sans text-sm text-text-secondary line-clamp-2 mt-1">
                              {s.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{s.duracion_minutos} min</span>
                          </div>
                        </div>

                        <div className="font-mono text-base font-bold text-grape shrink-0 text-right">
                          ${s.precio} {negocio.moneda_principal}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Caso 4 (B.8): Rescate si el día elegido no tiene horarios para el servicio */}
              {servicioActivo &&
                fecha &&
                !disponibilidad.isFetching &&
                horarios.length === 0 && (
                  <div className="p-4 rounded-xl bg-flame/10 border border-flame/20 space-y-2">
                    <p className="text-sm font-semibold text-text-primary">
                      No hay horarios para este servicio el{" "}
                      {formatDateShort(fecha)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Puedes revisar estos próximos días disponibles:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {getNext3Days(fecha).map((chip) => (
                        <button
                          key={chip.dateStr}
                          type="button"
                          onClick={() => {
                            setFecha(chip.dateStr);
                            setHora("");
                            setCurrentStepKey("hora");
                          }}
                          className="min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-flame/30 text-xs font-medium text-text-primary hover:bg-surface-alt transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-flame" />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  disabled={!isServicioValid}
                  onClick={handleNextStep}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-grape text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grape/90 cursor-pointer flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                PASO 4 — HORA (Selector de profesional + franjas Mañana/Tarde/Noche) (B.6)
                ------------------------------------------------------------- */}
            <div
              id="paso-hora"
              style={{ display: activeStepKey === "hora" ? "block" : "none" }}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <h2 className="font-bricolage text-2xl font-bold text-text-primary">
                  {currentStepTitle}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Elige el horario que mejor te convenga para el{" "}
                  {fecha ? formatDateReadable(fecha) : ""}.
                </p>
              </div>

              {/* Selector de Profesional (Cualquier profesional por defecto) */}
              <div className="bg-surface border border-border rounded-xl p-4">
                <label
                  htmlFor="selector-profesional-visible"
                  className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2"
                >
                  Profesional
                </label>
                <select
                  id="selector-profesional-visible"
                  value={profesionalId}
                  onChange={(e) => {
                    setProfesionalId(e.target.value);
                    setHora("");
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface-alt text-sm text-text-primary focus:outline-none focus:border-grape cursor-pointer"
                >
                  <option value="">Cualquier profesional disponible</option>
                  {profesionalesDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback de carga */}
              {disponibilidad.isFetching && (
                <div className="py-8 text-center text-xs text-text-muted font-mono flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4 animate-spin text-grape" />
                  Consultando turnos libres en tiempo real…
                </div>
              )}

              {/* Grid de Chips de Horarios agrupados por 3 franjas (REGLA B.19) */}
              {!disponibilidad.isFetching && horarios.length > 0 && (
                <div className="space-y-5">
                  {/* Franja Mañana (< 12:00) */}
                  {slotsManana.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2 font-sans">
                        🌅 Mañana (antes de 12:00)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slotsManana.map((slot) => {
                          const isSelected = slot === horaDisponible;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setHora(slot)}
                              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-mono text-[15px] font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? "bg-grape text-white border-grape shadow-md"
                                  : "bg-surface hover:bg-surface-alt text-text-primary border-border"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Franja Tarde (12:00 a 18:00) */}
                  {slotsTarde.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2 font-sans">
                        ☀️ Tarde (12:00 a 18:00)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slotsTarde.map((slot) => {
                          const isSelected = slot === horaDisponible;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setHora(slot)}
                              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-mono text-[15px] font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? "bg-grape text-white border-grape shadow-md"
                                  : "bg-surface hover:bg-surface-alt text-text-primary border-border"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Franja Noche (>= 18:00) */}
                  {slotsNoche.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2 font-sans">
                        🌙 Noche (18:00 en adelante)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slotsNoche.map((slot) => {
                          const isSelected = slot === horaDisponible;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setHora(slot)}
                              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-mono text-[15px] font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? "bg-grape text-white border-grape shadow-md"
                                  : "bg-surface hover:bg-surface-alt text-text-primary border-border"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estado sin horarios */}
              {!disponibilidad.isFetching && horarios.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-surface">
                  <p className="text-sm text-text-secondary">
                    No hay horarios disponibles para la selección actual.
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Intenta cambiar la fecha o seleccionar otro profesional.
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  disabled={!isHoraValid}
                  onClick={handleNextStep}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-grape text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grape/90 cursor-pointer flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                PASO 5 — TUS DATOS (Formulario final + Confirmar cita) (B.6)
                ------------------------------------------------------------- */}
            <div
              id="paso-datos"
              style={{ display: activeStepKey === "datos" ? "block" : "none" }}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <h2 className="font-bricolage text-2xl font-bold text-text-primary">
                  {currentStepTitle}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Ingresa tus datos de contacto para emitir tu confirmación.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                {/* 1. Nombre completo (Nombre y Apellidos con labels visibles - REGLA B.21) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reserva-nombre"
                      className="block text-xs font-semibold text-text-primary mb-1 font-sans"
                    >
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reserva-nombre"
                      name="nombre"
                      type="text"
                      required
                      maxLength={100}
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Sofía"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reserva-apellido"
                      className="block text-xs font-semibold text-text-primary mb-1 font-sans"
                    >
                      Apellidos <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reserva-apellido"
                      name="apellido"
                      type="text"
                      required
                      maxLength={100}
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. Morales"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 2. Teléfono con inputmode="tel" (REGLA B.20) */}
                <div>
                  <label
                    htmlFor="reserva-telefono"
                    className="block text-xs font-semibold text-text-primary mb-1 font-sans"
                  >
                    Teléfono
                    {negocio.telefono_cliente_requerido ? " *" : " (opcional)"}
                  </label>
                  <input
                    id="reserva-telefono"
                    name="telefono"
                    type="tel"
                    inputMode="tel"
                    required={Boolean(negocio.telefono_cliente_requerido)}
                    pattern="\+?[1-9][0-9]{7,14}"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
                  />
                  <p className="text-[11px] text-text-muted mt-1 font-sans">
                    Aquí te enviaremos el recordatorio de tu cita.
                  </p>
                </div>

                {/* 3. Correo electrónico */}
                <div>
                  <label
                    htmlFor="reserva-email"
                    className="block text-xs font-semibold text-text-primary mb-1 font-sans"
                  >
                    Correo electrónico
                    {negocio.email_cliente_requerido ? " *" : " (opcional)"}
                  </label>
                  <input
                    id="reserva-email"
                    name="email"
                    type="email"
                    required={Boolean(negocio.email_cliente_requerido)}
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
                  />
                  <p className="text-[11px] text-text-muted mt-1 font-sans">
                    Opcional, para enviarte el comprobante.
                  </p>
                </div>

                {/* 4. Notas para el negocio (si están habilitadas) */}
                {negocio.notas_cliente_habilitadas && (
                  <div>
                    <label
                      htmlFor="reserva-notas"
                      className="block text-xs font-semibold text-text-primary mb-1 font-sans"
                    >
                      Notas para el negocio (opcional)
                    </label>
                    <textarea
                      id="reserva-notas"
                      name="notas"
                      rows={3}
                      maxLength={2000}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="¿Alguna indicación previa para tu cita?"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
                    />
                  </div>
                )}

                {/* 5. Checkboxes obligatorios */}
                <div className="pt-2 space-y-2.5 border-t border-border/80">
                  <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={privacidad}
                      onChange={(e) => setPrivacidad(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border text-grape focus:ring-grape cursor-pointer"
                    />
                    <span>
                      Acepto el{" "}
                      <Link
                        href="/privacidad"
                        target="_blank"
                        className="text-grape underline font-medium"
                      >
                        aviso de privacidad
                      </Link>{" "}
                      y el tratamiento de mis datos de contacto para la cita.
                    </span>
                  </label>

                  {negocio.politica_cancelacion?.trim() && (
                    <div className="space-y-1">
                      <p className="text-xs text-text-secondary">
                        Política de cancelación:{" "}
                        <span className="font-semibold text-text-primary">
                          {negocio.politica_cancelacion}
                        </span>
                      </p>
                      <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={cancelacion}
                          onChange={(e) => setCancelacion(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-border text-grape focus:ring-grape cursor-pointer"
                        />
                        <span>Acepto la política de cancelación.</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Mensaje de error / colisión 409 */}
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger animate-in fade-in"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  aria-label="Confirmar reserva"
                  disabled={reserva.isPending || !isDatosValid}
                  className="btn-ticket min-h-[44px] px-7 py-3 rounded-xl bg-grape hover:bg-grape/90 text-white font-semibold text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {reserva.isPending ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Emitiendo tu cita…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar mi cita</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* =========================================================================
          BARRA FIJA INFERIOR EN MOBILE (<1024px) (B.3)
          ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E7E1D3] p-3.5 z-30 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="truncate text-xs">
            <p className="font-semibold text-text-primary truncate font-sans">
              {servicioActivo ? servicioActivo.nombre : "Elige tu servicio"}
            </p>
            <p className="text-text-muted font-mono text-[11px] truncate">
              {fecha ? formatDateShort(fecha) : "Fecha pendiente"}
              {horaDisponible ? ` · ${horaDisponible} hrs` : ""}
            </p>
          </div>

          {activeStepKey === "datos" ? (
            <button
              type="submit"
              form="wizard-reserva-form"
              disabled={reserva.isPending || !isDatosValid}
              className="py-2.5 px-4 rounded-xl bg-grape text-white text-xs font-semibold shrink-0 min-h-[44px] flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {reserva.isPending ? "Confirmando…" : "Confirmar mi cita"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canAdvance}
              className="py-2.5 px-4 rounded-xl bg-grape text-white text-xs font-semibold shrink-0 min-h-[44px] flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
