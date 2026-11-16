"use client";

import type React from "react";
import {
  MESES_CALENDARIO,
  formatYMD,
  buildCalendarCellAriaLabel,
} from "@/lib/utils/booking-calendar";

export interface BookingCalendarGridProps {
  calendarId: string;
  currentYear: number;
  currentMonth: number;
  todayStr: string;
  maxDateStr: string;
  selectedDate: string;
  accentColor: string;
  startDayOffset: number;
  daysInPrevMonth: number;
  totalDaysInMonth: number;
  hasAvailability?: (dateStr: string) => boolean;
  isDateDimmed?: (dateStr: string) => boolean;
  onSelectDate: (dateStr: string) => void;
  onCellKeyDown: (
    e: React.KeyboardEvent<HTMLButtonElement>,
    dateStr: string,
    isDisabled: boolean,
  ) => void;
}

export function BookingCalendarGrid({
  calendarId,
  currentYear,
  currentMonth,
  todayStr,
  maxDateStr,
  selectedDate,
  accentColor,
  startDayOffset,
  daysInPrevMonth,
  totalDaysInMonth,
  hasAvailability,
  isDateDimmed,
  onSelectDate,
  onCellKeyDown,
}: BookingCalendarGridProps) {
  return (
    <div
      className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center"
      role="grid"
      aria-label={`Mes de ${MESES_CALENDARIO[currentMonth]} de ${currentYear}`}
    >
      {["L", "M", "M", "J", "V", "S", "D"].map((dia, idx) => (
        <div
          key={`${dia}-${idx}`}
          className="text-xs font-semibold text-text-muted uppercase tracking-wider py-1.5 font-sans"
          role="columnheader"
        >
          {dia}
        </div>
      ))}

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

      {Array.from({ length: totalDaysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateStr = formatYMD(currentYear, currentMonth, day);
        const isDisabled = dateStr < todayStr || dateStr > maxDateStr;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;
        const hasSpots = hasAvailability ? hasAvailability(dateStr) : !isDisabled;
        const isDimmed = isDateDimmed ? isDateDimmed(dateStr) : false;

        const cellAria = buildCalendarCellAriaLabel({
          year: currentYear,
          month: currentMonth,
          day,
          isToday,
          isSelected,
          isDisabled,
          isDimmed,
          hasSpots,
        });

        return (
          <div key={dateStr} className="flex justify-center" role="gridcell">
            <button
              type="button"
              id={`${calendarId}-${dateStr}`}
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              onKeyDown={(e) => onCellKeyDown(e, dateStr, isDisabled)}
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
  );
}
