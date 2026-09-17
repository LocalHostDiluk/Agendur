"use client";

import { useState, useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  accentColor?: string;
  hasAvailability?: (dateStr: string) => boolean;
  isDateDimmed?: (dateStr: string) => boolean;
}

const NOMBRES_DIAS_COMPLETOS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MESES = [
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

function formatYMD(year: number, month: number, day: number): string {
  const m = (month + 1).toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  accentColor = "var(--grape)",
  hasAvailability,
  isDateDimmed,
}: BookingCalendarProps) {
  const calendarId = useId();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const todayStr = formatYMD(todayYear, todayMonth, todayDay);

  // Límite estricto de 90 días hacia adelante
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();
  const maxDateStr = formatYMD(maxYear, maxMonth, maxDate.getDate());

  // Mes visible inicial (mes de la fecha seleccionada o mes actual)
  const initialYear = selectedDate
    ? parseInt(selectedDate.slice(0, 4), 10)
    : todayYear;
  const initialMonth = selectedDate
    ? parseInt(selectedDate.slice(5, 7), 10) - 1
    : todayMonth;

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Comprobar límites de navegación mensual
  const isAtCurrentMonth =
    currentYear === todayYear && currentMonth === todayMonth;
  const isAtMaxMonth =
    currentYear > maxYear ||
    (currentYear === maxYear && currentMonth >= maxMonth);

  function prevMonth() {
    if (isAtCurrentMonth) return;
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (isAtMaxMonth) return;
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  // Días totales del mes visible (28 a 31 días) calculado con JavaScript nativo Date
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Día de la semana del 1er día del mes (Lunes = 0, Domingo = 6)
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const startDayOffset = (firstDayRaw + 6) % 7;

  // Días del mes anterior para rellenar la primera fila
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Navegación accesible por teclado (flechas + Enter/Espacio)
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentDateStr: string,
    isDisabled: boolean,
  ) {
    const keys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
      " ",
    ];
    if (!keys.includes(e.key)) return;

    if (e.key === "Enter" || e.key === " ") {
      if (!isDisabled) {
        e.preventDefault();
        onSelectDate(currentDateStr);
      }
      return;
    }

    e.preventDefault();
    const [y, m, d] = currentDateStr.split("-").map(Number);
    const curr = new Date(y, m - 1, d);
    let targetDate = new Date(curr);

    if (e.key === "ArrowLeft") {
      targetDate.setDate(curr.getDate() - 1);
    } else if (e.key === "ArrowRight") {
      targetDate.setDate(curr.getDate() + 1);
    } else if (e.key === "ArrowUp") {
      targetDate.setDate(curr.getDate() - 7);
    } else if (e.key === "ArrowDown") {
      targetDate.setDate(curr.getDate() + 7);
    } else if (e.key === "Home") {
      targetDate = new Date(currentYear, currentMonth, 1);
    } else if (e.key === "End") {
      targetDate = new Date(currentYear, currentMonth, totalDaysInMonth);
    }

    const targetDateStr = formatYMD(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );

    // No navegar fuera del rango de 90 días o hacia el pasado
    if (targetDateStr < todayStr || targetDateStr > maxDateStr) return;

    // Cambiar de mes visible si la navegación cruza límites
    if (
      targetDate.getFullYear() !== currentYear ||
      targetDate.getMonth() !== currentMonth
    ) {
      setCurrentYear(targetDate.getFullYear());
      setCurrentMonth(targetDate.getMonth());
    }

    // Enfocar el botón de la nueva celda en el siguiente ciclo
    setTimeout(() => {
      const nextBtn = document.getElementById(`${calendarId}-${targetDateStr}`);
      if (nextBtn) {
        nextBtn.focus();
      }
    }, 15);
  }

  return (
    <div
      className="w-full select-none"
      role="region"
      aria-label="Calendario de reservas"
    >
      {/* Encabezado del mes y controles */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bricolage text-lg font-bold text-text-primary">
          {MESES[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isAtCurrentMonth}
            aria-label="Mes anterior"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={isAtMaxMonth}
            aria-label="Mes siguiente"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cuadrícula de 7 columnas comenzando en Lunes */}
      <div
        className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center"
        role="grid"
        aria-label={`Mes de ${MESES[currentMonth]} de ${currentYear}`}
      >
        {/* Días de la semana (L M M J V S D per B.7) */}
        {["L", "M", "M", "J", "V", "S", "D"].map((dia, idx) => (
          <div
            key={`${dia}-${idx}`}
            className="text-xs font-semibold text-text-muted uppercase tracking-wider py-1.5 font-sans"
            role="columnheader"
          >
            {dia}
          </div>
        ))}

        {/* Celdas del mes anterior para rellenar el offset inicial */}
        {Array.from({ length: startDayOffset }).map((_, i) => {
          const dayNum = daysInPrevMonth - startDayOffset + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="h-11 sm:h-12 flex items-center justify-center text-sm text-text-muted/30 pointer-events-none"
              aria-hidden="true"
            >
              {dayNum}
            </div>
          );
        })}

        {/* Días reales del mes actual */}
        {Array.from({ length: totalDaysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatYMD(currentYear, currentMonth, day);
          const isPast = dateStr < todayStr;
          const isBeyondMax = dateStr > maxDateStr;
          const isDisabled = isPast || isBeyondMax;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasSpots = hasAvailability
            ? hasAvailability(dateStr)
            : !isDisabled;
          const isDimmed = isDateDimmed ? isDateDimmed(dateStr) : false;

          const dateObj = new Date(currentYear, currentMonth, day);
          const diaSemanaNombre = NOMBRES_DIAS_COMPLETOS[dateObj.getDay()];

          // Construcción de aria-label descriptivo y accesible
          let cellAria = `${diaSemanaNombre} ${day} de ${MESES[currentMonth]} de ${currentYear}`;
          if (isToday) cellAria += ", hoy";
          if (isSelected) cellAria += ", seleccionado";
          if (isDisabled) {
            cellAria += ", fecha no disponible";
          } else if (isDimmed) {
            cellAria += ", sin horarios para este servicio";
          } else if (hasSpots) {
            cellAria += ", disponible";
          } else {
            cellAria += ", sin disponibilidad";
          }

          return (
            <div key={dateStr} className="flex justify-center" role="gridcell">
              <button
                type="button"
                id={`${calendarId}-${dateStr}`}
                disabled={isDisabled}
                onClick={() => onSelectDate(dateStr)}
                onKeyDown={(e) => handleKeyDown(e, dateStr, isDisabled)}
                aria-label={cellAria}
                aria-pressed={isSelected}
                tabIndex={isSelected || (isToday && !selectedDate) ? 0 : -1}
                className={`
                  relative min-w-[44px] min-h-[44px] w-full max-w-[48px] h-11 sm:h-12 rounded-lg text-sm font-medium
                  flex flex-col items-center justify-center transition-all duration-150 outline-none
                  focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2
                  ${
                    isSelected
                      ? "text-white shadow-md font-bold scale-[1.02]"
                      : isToday
                        ? "border border-border font-bold text-text-primary hover:bg-surface-alt"
                        : isDisabled
                          ? "text-text-muted/40 opacity-40 cursor-not-allowed"
                          : isDimmed
                            ? "text-text-muted/60 line-through opacity-40 hover:bg-surface-alt cursor-pointer"
                            : "text-text-primary hover:bg-surface-alt cursor-pointer"
                  }
                `}
                style={{
                  backgroundColor: isSelected ? accentColor : undefined,
                  borderColor: isToday && !isSelected ? accentColor : undefined,
                }}
              >
                <span>{day}</span>

                {/* Punto de disponibilidad (4px) en color de acento debajo del número */}
                {!isSelected && !isDisabled && hasSpots && !isDimmed && (
                  <span
                    className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 transition-transform"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
