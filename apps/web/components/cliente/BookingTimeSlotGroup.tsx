"use client";

export interface BookingTimeSlotGroupProps {
  title: string;
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export function BookingTimeSlotGroup({
  title,
  slots,
  selectedSlot,
  onSelectSlot,
}: BookingTimeSlotGroupProps) {
  if (slots.length === 0) return null;

  return (
    <div>
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2 font-sans">
        {title}
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = slot === selectedSlot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
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
  );
}
