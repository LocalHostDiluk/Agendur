"use client";

import { useState, useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MESES_CALENDARIO,
  formatYMD,
  computeKeyboardTargetDate,
} from "@/lib/utils/booking-calendar";
import { BookingCalendarGrid } from "./BookingCalendarGrid";

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  accentColor?: string;
  hasAvailability?: (dateStr: string) => boolean;
  isDateDimmed?: (dateStr: string) => boolean;
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
  const todayStr = formatYMD(todayYear, todayMonth, today.getDate());

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();
  const maxDateStr = formatYMD(maxYear, maxMonth, maxDate.getDate());

  const [currentYear, setCurrentYear] = useState(
    selectedDate ? parseInt(selectedDate.slice(0, 4), 10) : todayYear,
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? parseInt(selectedDate.slice(5, 7), 10) - 1 : todayMonth,
  );

  const isAtCurrentMonth = currentYear === todayYear && currentMonth === todayMonth;
  const isAtMaxMonth =
    currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonth);

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

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOffset = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentDateStr: string,
    isDisabled: boolean,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      if (!isDisabled) {
        e.preventDefault();
        onSelectDate(currentDateStr);
      }
      return;
    }
    const targetDate = computeKeyboardTargetDate(
      e.key,
      currentDateStr,
      currentYear,
      currentMonth,
      totalDaysInMonth,
    );
    if (!targetDate) return;
    e.preventDefault();
    const targetDateStr = formatYMD(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    if (targetDateStr < todayStr || targetDateStr > maxDateStr) return;
    if (targetDate.getFullYear() !== currentYear || targetDate.getMonth() !== currentMonth) {
      setCurrentYear(targetDate.getFullYear());
      setCurrentMonth(targetDate.getMonth());
    }
    setTimeout(() => document.getElementById(`${calendarId}-${targetDateStr}`)?.focus(), 15);
  }

  const navBtnClass =
    "w-10 h-10 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="w-full select-none" role="region" aria-label="Calendario de reservas">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bricolage text-lg font-bold text-text-primary">
          {MESES_CALENDARIO[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth} disabled={isAtCurrentMonth} aria-label="Mes anterior" className={navBtnClass}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={nextMonth} disabled={isAtMaxMonth} aria-label="Mes siguiente" className={navBtnClass}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <BookingCalendarGrid
        calendarId={calendarId}
        currentYear={currentYear}
        currentMonth={currentMonth}
        todayStr={todayStr}
        maxDateStr={maxDateStr}
        selectedDate={selectedDate}
        accentColor={accentColor}
        startDayOffset={startDayOffset}
        daysInPrevMonth={daysInPrevMonth}
        totalDaysInMonth={totalDaysInMonth}
        hasAvailability={hasAvailability}
        isDateDimmed={isDateDimmed}
        onSelectDate={onSelectDate}
        onCellKeyDown={handleKeyDown}
      />
    </div>
  );
}
