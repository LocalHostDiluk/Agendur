import { Check } from "lucide-react";

export const STEPS = [
  { number: 1, label: "Cuenta" },
  { number: 2, label: "Perfil" },
  { number: 3, label: "Negocio" },
];

interface RegisterStepperProps {
  currentStep: number;
}

export function RegisterStepper({ currentStep }: RegisterStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-start w-full">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.number;
          const isActive = currentStep === s.number;
          return (
            <div
              key={s.number}
              className="flex items-start flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                    isActive
                      ? "bg-grape text-white font-medium shadow-sm"
                      : isCompleted
                        ? "bg-grape text-white"
                        : "border border-border text-text-muted bg-transparent font-medium"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className={`text-[12px] mt-1.5 transition-colors ${
                    isActive
                      ? "text-text-primary font-semibold"
                      : isCompleted
                        ? "text-text-primary font-medium"
                        : "text-text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 sm:mx-3 mt-[15px] transition-colors ${
                    currentStep > s.number ? "bg-grape" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
