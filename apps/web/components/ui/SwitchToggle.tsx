"use client";

export interface SwitchToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function SwitchToggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-primary cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-grape focus:ring-offset-2 ${
          checked ? "bg-grape" : "bg-border"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
