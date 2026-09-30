"use client";

import { Sparkles } from "lucide-react";
import { useCatalogo } from "@/lib/hooks/use-catalogo";
import { useDisponibilidad } from "@/lib/hooks/use-disponibilidad";
import { useBookingWizard } from "@/lib/hooks/use-booking-wizard";
import { useBookingForm } from "@/lib/hooks/use-booking-form";
import { BookingStepFecha } from "./BookingStepFecha";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingMobileHeader } from "./BookingMobileHeader";
import { BookingSummarySidebar } from "./BookingSummarySidebar";
import { BookingStepper } from "./BookingStepper";
import { BookingHiddenInputs } from "./BookingHiddenInputs";
import { BookingStepHora } from "./BookingStepHora";
import { BookingStepDatos } from "./BookingStepDatos";
import { BookingMobileBar } from "./BookingMobileBar";
import { BookingStepSucursal } from "./BookingStepSucursal";
import { BookingStepServicio } from "./BookingStepServicio";
import { BusinessNotFound } from "@/components/errors/BusinessNotFound";
import { PortalSkeletons } from "./PortalSkeletons";

interface BookingPortalProps {
  negocioSlug: string;
}

export function BookingPortal({ negocioSlug }: BookingPortalProps) {
  const catalogo = useCatalogo(negocioSlug);

  const data = catalogo.data?.data;
  const negocio = data?.negocio;
  const sucursales = data?.sucursales ?? [];
  const servicios = data?.servicios ?? [];
  const todosProfesionales = data?.profesionales ?? [];

  const isMultiBranch = sucursales.length > 1;

  const {
    currentStepKey,
    setCurrentStepKey,
    selectedSucursalId,
    fecha,
    setFecha,
    servicioId,
    profesionalId,
    setProfesionalId,
    hora,
    setHora,
    notice,
    activeStepKey,
    canAdvance,
    currentStepIndex,
    currentStepTitle,
    stepsList,
    handleSelectSucursal,
    handleSelectFecha,
    handleSelectServicio,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
  } = useBookingWizard({ isMultiBranch });

  // Color de acento de marca (REGLA B.11 & B.13: default #6E49A6)
  const accentColor = "var(--grape)";

  // Sucursal y servicio activos (autoselecciona matriz o primera sede si no hay selección manual)
  const defaultSucursal = sucursales.length === 1 ? sucursales[0] : undefined;
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

  // Validación de pasos (REGLA B.6)
  const isSucursalValid = Boolean(
    sucursalActiva?.id && sucursalActiva.activa !== false,
  );
  const isFechaValid = Boolean(fecha);
  const isServicioValid = Boolean(servicioActivo?.id);
  const isHoraValid = Boolean(horaDisponible);
  const {
    nombre,
    setNombre,
    apellido,
    setApellido,
    telefono,
    setTelefono,
    email,
    setEmail,
    notas,
    setNotas,
    privacidad,
    setPrivacidad,
    cancelacion,
    setCancelacion,
    error,
    cita,
    showCancelInfo,
    setShowCancelInfo,
    isDatosValid,
    handleBooking,
    reserva,
  } = useBookingForm({
    negocio,
    sucursalActiva,
    servicioActivo,
    profesionalActivo,
    profesionalesDisponibles,
    fecha,
    horaDisponible,
    onSlotConflict: async () => {
      setHora("");
      await disponibilidad.refetch();
      setCurrentStepKey("hora");
    },
  });

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
    return (
      <BookingConfirmation
        negocio={negocio}
        sucursalActiva={sucursalActiva}
        servicioActivo={servicioActivo}
        profesionalActivo={profesionalActivo}
        cita={cita}
        horaDisponible={horaDisponible}
        nombre={nombre}
        apellido={apellido}
        showCancelInfo={showCancelInfo}
        setShowCancelInfo={setShowCancelInfo}
      />
    );
  }


  // WIZARD DE PASOS PRINCIPAL (B.3)

  return (
    <div className="min-h-screen bg-[var(--paper,#F3EEDF)] text-text-primary flex flex-col lg:flex-row">
      {/* =========================================================================
          MOBILE HEADER COMPACTO (72px, fondo --ink) (<1024px)
          ========================================================================= */}
      <BookingMobileHeader negocio={negocio} />


      {/* =========================================================================
          COLUMNA IZQUIERDA DESKTOP (380px, fondo --ink #1D1720) (≥1024px) (B.3 & B.4)
          ========================================================================= */}
      <BookingSummarySidebar
        negocio={negocio}
        sucursalActiva={sucursalActiva}
        fecha={fecha}
        servicioActivo={servicioActivo}
        horaDisponible={horaDisponible}
        profesionalActivo={profesionalActivo}
        activeStepKey={activeStepKey}
      />


      {/* =========================================================================
          COLUMNA DERECHA: WIZARD DE PASOS (B.3 & B.5)
          ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pb-24 lg:pb-12 overflow-y-auto">
        <div className="max-w-[560px] w-full mx-auto">
          {/* STEPPER / INDICADOR DE PROGRESO (B.5 & REGLA B.17) */}
          <BookingStepper
            stepsList={stepsList}
            currentStepIndex={currentStepIndex}
            handleGoToStep={handleGoToStep}
          />


          {/* Aviso breve de actualización en cascada (REGLA B.5) */}
          {notice && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-3 rounded-xl bg-grape/10 border border-grape/20 text-xs font-sans text-grape flex items-center gap-2 animate-in fade-in"
            >
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
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
            <BookingHiddenInputs
              sucursalActiva={sucursalActiva}
              handleSelectSucursal={handleSelectSucursal}
              sucursales={sucursales}
              fecha={fecha}
              handleSelectFecha={handleSelectFecha}
              servicioId={servicioId}
              handleSelectServicio={handleSelectServicio}
              servicios={servicios}
              moneda={negocio.moneda_principal}
              profesionalId={profesionalId}
              onSelectProfesional={(id) => {
                setProfesionalId(id);
                setHora("");
              }}
              profesionalesDisponibles={profesionalesDisponibles}
              horaDisponible={horaDisponible}
              setHora={setHora}
              horarios={horarios}
            />


            {/* -------------------------------------------------------------
                PASO 1 — SUCURSAL (Solo si sucursales.length > 1) (B.6)
                ------------------------------------------------------------- */}
            <BookingStepSucursal
              isMultiBranch={isMultiBranch}
              activeStepKey={activeStepKey}
              currentStepTitle={currentStepTitle}
              sucursales={sucursales}
              sucursalActiva={sucursalActiva}
              isSucursalValid={isSucursalValid}
              handleSelectSucursal={handleSelectSucursal}
              handleNextStep={handleNextStep}
            />

            {/* -------------------------------------------------------------
                PASO 2 — FECHA (Calendario mensual) (B.6 & B.7)
                ------------------------------------------------------------- */}
            <BookingStepFecha
              activeStepKey={activeStepKey}
              currentStepTitle={currentStepTitle}
              fecha={fecha}
              handleSelectFecha={handleSelectFecha}
              accentColor={accentColor}
              isMultiBranch={isMultiBranch}
              handlePrevStep={handlePrevStep}
              isFechaValid={isFechaValid}
              handleNextStep={handleNextStep}
            />

            {/* -------------------------------------------------------------
                PASO 3 — SERVICIO (Lista vertical con Space Mono y duración) (B.6)
                ------------------------------------------------------------- */}
            <BookingStepServicio
              activeStepKey={activeStepKey}
              currentStepTitle={currentStepTitle}
              fecha={fecha}
              servicios={servicios}
              servicioActivo={servicioActivo}
              moneda={negocio.moneda_principal}
              sucursalActiva={sucursalActiva}
              isFetchingDisponibilidad={disponibilidad.isFetching}
              horarios={horarios}
              handleSelectServicio={handleSelectServicio}
              setFecha={setFecha}
              setHora={setHora}
              setCurrentStepKey={setCurrentStepKey}
              handlePrevStep={handlePrevStep}
              isServicioValid={isServicioValid}
              handleNextStep={handleNextStep}
            />

            {/* -------------------------------------------------------------
                PASO 4 — HORA (Selector de profesional + franjas Mañana/Tarde/Noche) (B.6)
                ------------------------------------------------------------- */}
            <BookingStepHora
              activeStepKey={activeStepKey}
              currentStepTitle={currentStepTitle}
              fecha={fecha}
              profesionalId={profesionalId}
              setProfesionalId={setProfesionalId}
              setHora={setHora}
              profesionalesDisponibles={profesionalesDisponibles}
              isFetchingDisponibilidad={disponibilidad.isFetching}
              horarios={horarios}
              slotsManana={slotsManana}
              slotsTarde={slotsTarde}
              slotsNoche={slotsNoche}
              horaDisponible={horaDisponible}
              handlePrevStep={handlePrevStep}
              isHoraValid={isHoraValid}
              handleNextStep={handleNextStep}
            />

            {/* -------------------------------------------------------------
                PASO 5 — TUS DATOS (Formulario final + Confirmar cita) (B.6)
                ------------------------------------------------------------- */}
            <BookingStepDatos
              activeStepKey={activeStepKey}
              currentStepTitle={currentStepTitle}
              nombre={nombre}
              setNombre={setNombre}
              apellido={apellido}
              setApellido={setApellido}
              telefono={telefono}
              setTelefono={setTelefono}
              email={email}
              setEmail={setEmail}
              notas={notas}
              setNotas={setNotas}
              privacidad={privacidad}
              setPrivacidad={setPrivacidad}
              cancelacion={cancelacion}
              setCancelacion={setCancelacion}
              negocio={negocio}
              error={error}
              isReservaPending={reserva.isPending}
              isDatosValid={isDatosValid}
              handlePrevStep={handlePrevStep}
            />
          </form>
        </div>
      </main>

      {/* =========================================================================
          BARRA FIJA INFERIOR EN MOBILE (<1024px) (B.3)
          ========================================================================= */}
      <BookingMobileBar
        servicioActivo={servicioActivo}
        fecha={fecha}
        horaDisponible={horaDisponible}
        activeStepKey={activeStepKey}
        isReservaPending={reserva.isPending}
        isDatosValid={isDatosValid}
        canAdvance={canAdvance}
        handleNextStep={handleNextStep}
      />

    </div>
  );
}
