import { getPasswordStrength } from "@/lib/utils/password-strength";

interface RegisterPasswordStrengthProps {
  password: string;
}

export function RegisterPasswordStrength({
  password,
}: RegisterPasswordStrengthProps) {
  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-1 pt-1">
      <div className="flex items-center gap-1.5 h-1">
        <div
          className={`h-full flex-1 rounded-full transition-colors ${
            strength.score >= 1
              ? strength.score === 1
                ? "bg-danger"
                : strength.score === 2
                  ? "bg-warning"
                  : "bg-success"
              : "bg-border"
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-colors ${
            strength.score >= 2
              ? strength.score === 2
                ? "bg-warning"
                : "bg-success"
              : "bg-border"
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-colors ${
            strength.score >= 3 ? "bg-success" : "bg-border"
          }`}
        />
      </div>
      {password.length > 0 && (
        <div className="flex justify-between text-[11px]">
          <span className="text-text-muted">Fortaleza:</span>
          <span
            className={`font-medium ${
              strength.score === 1
                ? "text-danger"
                : strength.score === 2
                  ? "text-warning"
                  : "text-success"
            }`}
          >
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}
