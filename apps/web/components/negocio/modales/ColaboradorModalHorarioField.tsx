"use client";

import React from "react";
import { Clock } from "lucide-react";
import {
  COLABORADOR_DIAS_SEMANA,
  COLABORADOR_HORAS_OPCIONES,
} from "@/lib/utils/modal-colaborador-constants";

interface ColaboradorModalHorarioFieldProps {
  diasLaborables: number[];
  onToggleDia: (dia: number) => void;
  horaInicio: string;
  onChangeHoraInicio: (val: string) => void;
  horaFin: string;
  onChangeHoraFin: (val: string) => void;
}

export function ColaboradorModalHorarioField({
  diasLaborables,
  onToggleDia,
  horaInicio,
  onChangeHoraInicio,
  horaFin,
  onChangeHoraFin,
}: ColaboradorModalHorarioFieldProps) {
  return (
    <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-grape" />
          <span>Horario Laboral Semanal</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-text-secondary mr-1">Días:</span>
        {COLABORADOR_DIAS_SEMANA.map((d) => {
          const isSelected = diasLaborables.includes(d.dia);
          return (
            <button
              key={d.dia}
              type="button"
              onClick={() => onToggleDia(d.dia)}
              aria-pressed={isSelected}
              aria-label={`${d.label}: ${isSelected ? "laborable" : "no laborable"}`}
              className={`size-8 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-grape text-white shadow-xs"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label
            htmlFor="colaborador-entrada"
            className="text-[11px] text-text-secondary block mb-1"
          >
            Hora Entrada
          </label>
          <select
            id="colaborador-entrada"
            value={horaInicio}
            onChange={(e) => onChangeHoraInicio(e.target.value)}
            className="select-native w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape focus:ring-2 focus:ring-grape min-h-[38px]"
          >
            {COLABORADOR_HORAS_OPCIONES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="colaborador-salida"
            className="text-[11px] text-text-secondary block mb-1"
          >
            Hora Salida
          </label>
          <select
            id="colaborador-salida"
            value={horaFin}
            onChange={(e) => onChangeHoraFin(e.target.value)}
            className="select-native w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape focus:ring-2 focus:ring-grape min-h-[38px]"
          >
            {COLABORADOR_HORAS_OPCIONES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
