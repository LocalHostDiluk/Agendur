"use client";

import { useState } from "react";

export type StepKey = "sucursal" | "fecha" | "servicio" | "hora" | "datos";
export interface StepItem { key: StepKey; label: string; title: string; }

const STEPS_BASE: StepItem[] = [
  { key: "sucursal", label: "Sucursal", title: "¿En qué sucursal?" },
  { key: "fecha", label: "Fecha", title: "Elige el día" },
  { key: "servicio", label: "Servicio", title: "¿Qué servicio necesitas?" },
  { key: "hora", label: "Hora", title: "Elige tu horario" },
  { key: "datos", label: "Datos", title: "Solo faltan tus datos" },
];
const STEPS = { multi: STEPS_BASE, single: STEPS_BASE.slice(1) };

export interface UseBookingWizardOptions {
  isMultiBranch: boolean;
  isStepValid?: (key: StepKey) => boolean;
}

export function useBookingWizard({ isMultiBranch, isStepValid: customCheck }: UseBookingWizardOptions) {
  const [currentStepKey, setCurrentStepKey] = useState<StepKey>("sucursal");
  const [selectedSucursalId, setSelectedSucursalId] = useState("");
  const [fecha, setFecha] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [hora, setHora] = useState("");
  const [notice, setNotice] = useState("");

  const activeStepKey: StepKey = !isMultiBranch && currentStepKey === "sucursal" ? "fecha" : currentStepKey;
  const stepsList = isMultiBranch ? STEPS.multi : STEPS.single;
  const currentStepIndex = stepsList.findIndex((s) => s.key === activeStepKey);
  const currentStepTitle = stepsList[currentStepIndex]?.title || "";

  const isStepValid = (key: StepKey) => {
    if (customCheck) return customCheck(key);
    if (key === "sucursal") return !isMultiBranch || Boolean(selectedSucursalId);
    if (key === "fecha") return Boolean(fecha);
    if (key === "servicio") return Boolean(servicioId);
    if (key === "hora") return Boolean(hora);
    return false;
  };
  const canAdvance = isStepValid(activeStepKey);

  const notify = (cond: boolean) => {
    if (!cond) return;
    setNotice("Actualizamos los horarios disponibles.");
    setTimeout(() => setNotice(""), 3500);
  };

  const handleSelectSucursal = (id: string) => {
    if (id === selectedSucursalId) return;
    setSelectedSucursalId(id);
    setServicioId("");
    setHora("");
    notify(Boolean(servicioId || hora));
  };
  const handleSelectFecha = (newDate: string) => {
    if (newDate === fecha) return;
    setFecha(newDate);
    setServicioId("");
    setHora("");
    notify(Boolean(servicioId || hora));
  };
  const handleSelectServicio = (id: string) => {
    if (id === servicioId) return;
    setServicioId(id);
    setHora("");
    notify(Boolean(hora));
  };
  const handleNextStep = () => {
    if (canAdvance && currentStepIndex < stepsList.length - 1) {
      setCurrentStepKey(stepsList[currentStepIndex + 1].key);
    }
  };
  const handlePrevStep = () => {
    if (currentStepIndex > 0) setCurrentStepKey(stepsList[currentStepIndex - 1].key);
  };
  const handleGoToStep = (targetKey: StepKey) => {
    const idx = stepsList.findIndex((s) => s.key === targetKey);
    if (idx < currentStepIndex) setCurrentStepKey(targetKey);
  };

  return {
    currentStepKey, setCurrentStepKey,
    selectedSucursalId, setSelectedSucursalId,
    fecha, setFecha,
    servicioId, setServicioId,
    profesionalId, setProfesionalId,
    hora, setHora,
    notice, setNotice,
    activeStepKey, canAdvance, currentStepIndex, currentStepTitle, isStepValid, stepsList,
    handleSelectSucursal, handleSelectFecha, handleSelectServicio,
    handleNextStep, handlePrevStep, handleGoToStep,
  };
}
