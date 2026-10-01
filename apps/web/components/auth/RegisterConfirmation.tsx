import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";

interface RegisterConfirmationProps {
  registeredEmail: string;
}

export function RegisterConfirmation({
  registeredEmail,
}: RegisterConfirmationProps) {
  return (
    <div className="w-full bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-6 text-center shadow-sm">
      <div className="mx-auto w-14 h-14 bg-grape-soft rounded-full flex items-center justify-center border border-grape/20">
        <MailCheck className="w-7 h-7 text-grape" />
      </div>

      <div className="space-y-2">
        <h1 className="text-[24px] font-bricolage font-bold tracking-tight text-text-primary">
          ¡Verifica tu correo electrónico!
        </h1>
        <p className="text-[14px] text-text-secondary max-w-sm mx-auto">
          Hemos enviado un enlace de confirmación a{" "}
          <span className="font-semibold text-text-primary">
            {registeredEmail}
          </span>
          .
        </p>
      </div>

      <div className="bg-surface-alt border border-border rounded-md p-4 text-xs text-text-secondary text-left space-y-2">
        <p className="font-semibold text-text-primary">Próximos pasos:</p>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li>Abre tu bandeja de entrada en el correo indicado.</li>
          <li>Haz clic en el enlace seguro de confirmación.</li>
          <li>Comienza a configurar tu negocio y recibir citas.</li>
        </ol>
        <p className="pt-2 text-[11px] text-text-muted">
          * Si no lo ves en unos segundos, revisa tu carpeta de Spam.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full h-[40px] rounded-md bg-grape hover:opacity-95 text-white font-medium text-sm transition-all"
        >
          Ir a Iniciar Sesión <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
