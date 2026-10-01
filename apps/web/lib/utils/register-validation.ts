export interface RegisterStep1Data {
  email: string;
  password: string;
  aceptaTerminosYPrivacidad: boolean;
}

export interface RegisterStep2Data {
  nombres: string;
  apellidos: string;
  telefono: string;
}

export interface RegisterStep3Data {
  nombreComercial: string;
  giroComercial: string;
  otroGiro: string;
  ciudad: string;
  turnstileToken: string | null;
  isTest?: boolean;
}

export function validateRegisterStep1(data: RegisterStep1Data) {
  const trimmedEmail = data.email.trim();
  let email = "";
  let password = "";
  let legal = "";

  if (!trimmedEmail) email = "Ingresa tu correo electrónico.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) email = "Ingresa un correo electrónico válido.";

  if (!data.password) password = "Ingresa una contraseña.";
  else if (data.password.length < 12) password = "La contraseña debe tener al menos 12 caracteres.";

  if (!data.aceptaTerminosYPrivacidad) {
    legal = "Debes aceptar los Términos de Servicio y el Aviso de Privacidad.";
  }

  return { isValid: !email && !password && !legal, errors: { email, password, legal } };
}

export function validateRegisterStep2(data: RegisterStep2Data) {
  let nombres = "";
  let apellidos = "";
  let phone = "";

  if (!data.nombres.trim()) nombres = "Ingresa tus nombres.";
  else if (data.nombres.trim().length > 100) nombres = "Máximo 100 caracteres.";

  if (!data.apellidos.trim()) apellidos = "Ingresa tus apellidos.";
  else if (data.apellidos.trim().length > 100) apellidos = "Máximo 100 caracteres.";

  const digitsOnly = data.telefono.replace(/\D/g, "");
  if (!digitsOnly) phone = "Ingresa tu número de teléfono.";
  else if (digitsOnly.length < 7) phone = "Ingresa un número de teléfono válido (mínimo 7 dígitos).";

  return { isValid: !nombres && !apellidos && !phone, errors: { nombres, apellidos, telefono: phone, phone } };
}

export function validateRegisterStep3(data: RegisterStep3Data) {
  let nombreComercial = "";
  let otroGiro = "";
  let ciudad = "";
  let turnstile = "";

  if (!data.nombreComercial.trim()) nombreComercial = "Ingresa el nombre comercial de tu negocio.";

  const giroFinal = data.giroComercial === "Otro" ? data.otroGiro.trim() : data.giroComercial;
  if (data.giroComercial === "Otro" && !giroFinal) otroGiro = "Especifica el giro de tu negocio.";

  if (!data.ciudad.trim()) ciudad = "Ingresa la ciudad de tu negocio.";

  const skipTurnstile = data.isTest ?? (typeof process !== "undefined" && process.env.NODE_ENV === "test");
  if (!data.turnstileToken && !skipTurnstile) {
    turnstile = "Por favor completa la verificación de seguridad anti-spam.";
  }

  return {
    isValid: !nombreComercial && !otroGiro && !ciudad && !turnstile,
    errors: { nombreComercial, otroGiro, ciudad, turnstile, turnstileToken: turnstile },
  };
}
