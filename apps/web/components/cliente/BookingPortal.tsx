"use client";

import { Sparkles } from "lucide-react";
import { useCatalogo } from "@/lib/hooks/use-catalogo";
import { useDisponibilidad } from "@/lib/hooks/use-disponibilidad";
import { useBookingWizard } from "@/lib/hooks/use-booking-wizard";
import { useBookingForm } from "@/lib/hooks/use-booking-form";
import { BusinessNotFound } from "@/components/errors/BusinessNotFound";
import {
  PortalSkeletons, BookingConfirmation, BookingMobileHeader, BookingSummarySidebar,
  BookingStepper, BookingHiddenInputs, BookingMobileBar, BookingStepSucursal,
  BookingStepFecha, BookingStepServicio, BookingStepHora, BookingStepDatos,
} from "./";

interface BookingPortalProps {
  negocioSlug: string;
}

export function BookingPortal({ negocioSlug }: BookingPortalProps) {
  const catalogo = useCatalogo(negocioSlug);
  const data = catalogo.data?.data;
  const { negocio, sucursales = [], servicios = [], profesionales: todosProfesionales = [] } = data ?? {};
  const isMultiBranch = sucursales.length > 1;

  const {
    setCurrentStepKey, selectedSucursalId, fecha, setFecha, servicioId, profesionalId, setProfesionalId,
    hora, setHora, notice, activeStepKey, canAdvance, currentStepIndex, currentStepTitle,
    stepsList, handleSelectSucursal, handleSelectFecha, handleSelectServicio,
    handleNextStep, handlePrevStep, handleGoToStep,
  } = useBookingWizard({ isMultiBranch });

  const sucursalActiva = sucursales.find((s) => s.id === selectedSucursalId) || (sucursales.length === 1 ? sucursales[0] : undefined);
  const servicioActivo = servicios.find((s) => s.id === servicioId);
  const profesionalesDisponibles = todosProfesionales.filter((p) =>
    p.sucursal_id === sucursalActiva?.id && (!servicioActivo || (p.serviciosIds ?? []).includes(servicioActivo.id))
  );
  const profesionalActivo = profesionalesDisponibles.find((p) => p.id === profesionalId);

  const disponibilidad = useDisponibilidad({
    sucursalId: sucursalActiva?.id, servicioId: servicioActivo?.id,
    profesionalId: profesionalActivo?.id, fecha: fecha || undefined,
  });

  const horarios = disponibilidad.data?.horarios ?? [];
  const horaDisponible = horarios.includes(hora) ? hora : "";
  const slotsManana = horarios.filter((h) => parseInt(h.split(":")[0], 10) < 12);
  const slotsTarde = horarios.filter((h) => parseInt(h.split(":")[0], 10) >= 12 && parseInt(h.split(":")[0], 10) < 18);
  const slotsNoche = horarios.filter((h) => parseInt(h.split(":")[0], 10) >= 18);

  const isSucursalValid = Boolean(sucursalActiva?.id && sucursalActiva.activa !== false);
  const isFechaValid = Boolean(fecha); const isServicioValid = Boolean(servicioActivo?.id); const isHoraValid = Boolean(horaDisponible);

  const {
    nombre, setNombre, apellido, setApellido, telefono, setTelefono, email, setEmail,
    notas, setNotas, privacidad, setPrivacidad, cancelacion, setCancelacion,
    error, cita, showCancelInfo, setShowCancelInfo, isDatosValid, handleBooking, reserva,
  } = useBookingForm({
    negocio, sucursalActiva, servicioActivo, profesionalActivo, profesionalesDisponibles, fecha, horaDisponible,
    onSlotConflict: async () => { setHora(""); await disponibilidad.refetch(); setCurrentStepKey("hora"); },
  });

  if (catalogo.isPending) return <PortalSkeletons />;
  if (catalogo.isError || !negocio) return <BusinessNotFound />;
  if (cita) {
    return (
      <BookingConfirmation
        negocio={negocio} sucursalActiva={sucursalActiva} servicioActivo={servicioActivo}
        profesionalActivo={profesionalActivo} cita={cita} horaDisponible={horaDisponible}
        nombre={nombre} apellido={apellido} showCancelInfo={showCancelInfo} setShowCancelInfo={setShowCancelInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper,#F3EEDF)] text-text-primary flex flex-col lg:flex-row">
      <BookingMobileHeader negocio={negocio} />
      <BookingSummarySidebar
        negocio={negocio} sucursalActiva={sucursalActiva} fecha={fecha} servicioActivo={servicioActivo}
        horaDisponible={horaDisponible} profesionalActivo={profesionalActivo} activeStepKey={activeStepKey}
      />
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pb-24 lg:pb-12 overflow-y-auto">
        <div className="max-w-[560px] w-full mx-auto">
          <BookingStepper stepsList={stepsList} currentStepIndex={currentStepIndex} handleGoToStep={handleGoToStep} />
          {notice && (
            <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-grape/10 border border-grape/20 text-xs font-sans text-grape flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}
          <form id="wizard-reserva-form" onSubmit={handleBooking} className="space-y-6">
            <BookingHiddenInputs
              sucursalActiva={sucursalActiva} handleSelectSucursal={handleSelectSucursal} sucursales={sucursales}
              fecha={fecha} handleSelectFecha={handleSelectFecha} servicioId={servicioId}
              handleSelectServicio={handleSelectServicio} servicios={servicios} moneda={negocio.moneda_principal}
              profesionalId={profesionalId} onSelectProfesional={(id) => { setProfesionalId(id); setHora(""); }}
              profesionalesDisponibles={profesionalesDisponibles} horaDisponible={horaDisponible} setHora={setHora} horarios={horarios}
            />
            <BookingStepSucursal
              isMultiBranch={isMultiBranch} activeStepKey={activeStepKey} currentStepTitle={currentStepTitle}
              sucursales={sucursales} sucursalActiva={sucursalActiva} isSucursalValid={isSucursalValid}
              handleSelectSucursal={handleSelectSucursal} handleNextStep={handleNextStep}
            />
            <BookingStepFecha
              activeStepKey={activeStepKey} currentStepTitle={currentStepTitle} fecha={fecha}
              handleSelectFecha={handleSelectFecha} accentColor="var(--grape)" isMultiBranch={isMultiBranch}
              handlePrevStep={handlePrevStep} isFechaValid={isFechaValid} handleNextStep={handleNextStep}
            />
            <BookingStepServicio
              activeStepKey={activeStepKey} currentStepTitle={currentStepTitle} fecha={fecha}
              servicios={servicios} servicioActivo={servicioActivo} moneda={negocio.moneda_principal}
              sucursalActiva={sucursalActiva} isFetchingDisponibilidad={disponibilidad.isFetching} horarios={horarios}
              handleSelectServicio={handleSelectServicio} setFecha={setFecha} setHora={setHora}
              setCurrentStepKey={setCurrentStepKey} handlePrevStep={handlePrevStep}
              isServicioValid={isServicioValid} handleNextStep={handleNextStep}
            />
            <BookingStepHora
              activeStepKey={activeStepKey} currentStepTitle={currentStepTitle} fecha={fecha}
              profesionalId={profesionalId} setProfesionalId={setProfesionalId} setHora={setHora}
              profesionalesDisponibles={profesionalesDisponibles} isFetchingDisponibilidad={disponibilidad.isFetching}
              horarios={horarios} slotsManana={slotsManana} slotsTarde={slotsTarde} slotsNoche={slotsNoche}
              horaDisponible={horaDisponible} handlePrevStep={handlePrevStep} isHoraValid={isHoraValid} handleNextStep={handleNextStep}
            />
            <BookingStepDatos
              activeStepKey={activeStepKey} currentStepTitle={currentStepTitle}
              nombre={nombre} setNombre={setNombre} apellido={apellido} setApellido={setApellido}
              telefono={telefono} setTelefono={setTelefono} email={email} setEmail={setEmail}
              notas={notas} setNotas={setNotas} privacidad={privacidad} setPrivacidad={setPrivacidad}
              cancelacion={cancelacion} setCancelacion={setCancelacion} negocio={negocio} error={error}
              isReservaPending={reserva.isPending} isDatosValid={isDatosValid} handlePrevStep={handlePrevStep}
            />
          </form>
        </div>
      </main>
      <BookingMobileBar
        servicioActivo={servicioActivo} fecha={fecha} horaDisponible={horaDisponible} activeStepKey={activeStepKey}
        isReservaPending={reserva.isPending} isDatosValid={isDatosValid} canAdvance={canAdvance} handleNextStep={handleNextStep}
      />
    </div>
  );
}
