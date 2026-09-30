"use client";

export const SUCURSALES_OPTIONS = ["1", "2–3", "4+"] as const;

export type SucursalesOption = (typeof SUCURSALES_OPTIONS)[number];

interface RegisterSucursalesSelectorProps {
  value: "1" | "2–3" | "4+";
  onChange: (value: "1" | "2–3" | "4+") => void;
}

export function RegisterSucursalesSelector({
  value,
  onChange,
}: RegisterSucursalesSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-text-primary">
        Número de sucursales
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SUCURSALES_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-[40px] rounded-md text-[14px] font-medium border transition-all ${
              value === opt
                ? "bg-grape text-white border-grape shadow-sm"
                : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
