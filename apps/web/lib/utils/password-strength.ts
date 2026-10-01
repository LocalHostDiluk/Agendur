export interface PasswordStrength {
  score: number;
  label: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "" };
  const hasLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varieties = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  if (hasLength && varieties >= 3) {
    return { score: 3, label: "Fuerte" };
  }
  if (password.length >= 8 && varieties >= 2) {
    return { score: 2, label: "Media" };
  }
  return { score: 1, label: "Débil" };
}
