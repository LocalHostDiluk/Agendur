"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDisplayDate, formatDisplayWeek, formatDisplayMonth } from "@/lib/utils/agenda-display-date";
import type { useAgendaUi } from "@/lib/hooks/use-agenda-ui";

interface AgendaDateNavigationProps {
  selectedDate: string;
  todayStr: string;
  mondayYMD: string;
  sundayYMD: string;
  viewMode: ReturnType<typeof useAgendaUi>["viewMode"];
  setSelectedDate: ReturnType<typeof useAgendaUi>["setSelectedDate"];
  handleToday: () => void;
  handlePrev: () => void;
  handleNext: () => void;
}

export function AgendaDateNavigation({ selectedDate, todayStr, mondayYMD, sundayYMD, viewMode, setSelectedDate, handleToday, handlePrev, handleNext }: AgendaDateNavigationProps) {
  return (
<div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border transition-all duration-100 ease-out cursor-pointer min-h-[36px] ${
                selectedDate === todayStr
                  ? "bg-grape-soft text-grape border-grape/30 font-bold"
                  : "bg-surface-alt hover:bg-surface text-text-secondary border-border"
              }`}
            >
              Hoy
            </button>

            <div className="inline-flex items-center rounded-[var(--radius-md)] border border-border bg-surface-alt p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Fecha anterior"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-100 ease-out"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Fecha siguiente"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-100 ease-out"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Input nativo de fecha accesible */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                e.target.value && setSelectedDate(e.target.value)
              }
              className="bg-surface-alt border border-border rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-mono text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Seleccionar fecha específica"
            />

            {/* Título de Fecha formateado en Bricolage Grotesque */}
            <span className="text-xs sm:text-sm font-bricolage font-bold text-text-primary pl-1 flex items-center gap-1.5 tracking-tight">
              <CalendarIcon className="w-3.5 h-3.5 text-grape" strokeWidth={1.75} />
              <span>
                {viewMode === "cronograma"
                  ? formatDisplayDate(selectedDate)
                  : viewMode === "semanal"
                    ? formatDisplayWeek(mondayYMD, sundayYMD)
                    : formatDisplayMonth(selectedDate)}
              </span>
            </span>
          </div>
  );
}
