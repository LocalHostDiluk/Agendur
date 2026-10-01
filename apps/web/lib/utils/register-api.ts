import { triggerRegisterConfetti } from "@/lib/utils/confetti";
import { notify } from "@/lib/utils/toast";

export interface RegisterApiParams {
  nombreComercial: string;
  giroComercial: string;
  otroGiro: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  codigoPais: string;
  telefono: string;
  rol: string;
  sucursales: string;
  ciudad: string;
  turnstileToken: string | null;
}

export interface RegisterResult {
  success?: boolean;
  ok?: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function submitRegisterApi(params: RegisterApiParams): Promise<RegisterResult> {
  const giroFinal = params.giroComercial === "Otro" ? params.otroGiro.trim() : params.giroComercial;
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombreComercial: params.nombreComercial.trim(),
      giroComercial: giroFinal,
      nombres: params.nombres.trim(),
      apellidos: params.apellidos.trim(),
      email: params.email.trim(),
      password: params.password,
      confirmarPassword: params.password,
      aceptaTerminos: true,
      aceptaPrivacidad: true,
      termsVersionAccepted: process.env.NEXT_PUBLIC_TERMS_VERSION || "v1",
      privacyVersionAccepted: process.env.NEXT_PUBLIC_PRIVACY_VERSION || "v1",
      turnstileToken: params.turnstileToken,
      telefono: `${params.codigoPais} ${params.telefono}`.trim(),
      rol: params.rol,
      sucursales: params.sucursales,
      ciudad: params.ciudad.trim(),
    }),
  });

  const data = (await res.json()) as RegisterResult;
  if (!res.ok || (!data.success && !data.ok)) {
    throw new Error(data.error || "Error al crear la cuenta del negocio.");
  }
  return data;
}

export interface HandleRegisterSuccessParams {
  data: RegisterResult;
  email: string;
  setRegisteredEmail: (email: string) => void;
  setLoading: (loading: boolean) => void;
  router: { push: (url: string) => void; refresh: () => void };
}

export function handleRegisterSuccess({
  data,
  email,
  setRegisteredEmail,
  setLoading,
  router,
}: HandleRegisterSuccessParams): void {
  triggerRegisterConfetti();
  if (data.needsEmailConfirmation) {
    setRegisteredEmail(email.trim());
    setLoading(false);
    notify.info("¡Verifica tu correo!", "Te hemos enviado un enlace para activar tu cuenta.");
    return;
  }
  notify.success("¡Bienvenido a Agendur!", "Tu cuenta ha sido creada exitosamente.");
  router.push("/dashboard");
  router.refresh();
}
