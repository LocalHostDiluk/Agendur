"use client";

import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";
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
import { BookingTimeSlotGroup } from "./BookingTimeSlotGroup";
import { BookingConsentFields } from "./BookingConsentFields";
import { BookingMobileBar } from "./BookingMobileBar";
import { BookingStepSucursal } from "./BookingStepSucursal";
import { BookingStepServicio } from "./BookingStepServicio";
import { formatDateReadable } from "@/lib/utils/booking-date";
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
                  <BookingTimeSlotGroup
                    title="🌅 Mañana (antes de 12:00)"
                    slots={slotsManana}
                    selectedSlot={horaDisponible}
                    onSelectSlot={setHora}
                  />

                  <BookingTimeSlotGroup
                    title="☀️ Tarde (12:00 a 18:00)"
                    slots={slotsTarde}
                    selectedSlot={horaDisponible}
                    onSelectSlot={setHora}
                  />

                  <BookingTimeSlotGroup
                    title="🌙 Noche (18:00 en adelante)"
                    slots={slotsNoche}
                    selectedSlot={horaDisponible}
                    onSelectSlot={setHora}
                  />
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
                <BookingConsentFields
                  privacidad={privacidad}
                  setPrivacidad={setPrivacidad}
                  cancelacion={cancelacion}
                  setCancelacion={setCancelacion}
                  politicaCancelacion={negocio.politica_cancelacion}
                />


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
