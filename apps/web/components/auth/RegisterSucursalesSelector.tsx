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
    <fieldset className="min-w-0">
      <legend className="block text-[12px] font-medium text-text-primary mb-1.5">
        Número de sucursales
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {SUCURSALES_OPTIONS.map((opt) => (
          <label
            key={opt}
            className="relative flex items-center justify-center h-[40px] rounded-md text-[14px] font-medium border transition-all cursor-pointer select-none bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-muted has-checked:bg-grape has-checked:text-white has-checked:border-grape has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-grape"
          >
            <input
              type="radio"
              name="sucursales-tier"
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
