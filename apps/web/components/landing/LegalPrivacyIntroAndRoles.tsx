import { PendingField } from "@/components/landing/LegalDraftShell";

export const privacySectionClass = "scroll-mt-24 space-y-4";
export const privacyHeadingClass = "font-bricolage text-xl sm:text-2xl font-bold";
export const privacySimpleBoxClass =
  "rounded-lg border-l-4 border-[#46B88A] bg-[#46B88A]/10 p-3.5 text-sm";
export const privacyCodeClass =
  "rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10";
export const privacyLinkClass =
  "font-medium text-[#6E49A6] underline dark:text-[#B99CE8]";

export function LegalPrivacyIntroAndRoles() {
  return (
    <>
      <p className="text-sm text-[#6B6355] dark:text-[#A79FAE]">
        En cumplimiento con los artículos 15 y 16 de la{" "}
        <strong>
          Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP)
        </strong>{" "}
        y su Reglamento en los Estados Unidos Mexicanos, ponemos a su
        disposición el presente Aviso de Privacidad Integral aplicable a la
        plataforma tecnológica <strong>Agendur</strong>.
      </p>

      {/* 1. Identidad del Responsable vs. Encargado */}
      <section id="identidad-y-roles" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          1. Identidad del Responsable vs. Encargado del Tratamiento
        </h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Si eres dueño o miembro del equipo de un
          negocio registrado en Agendur, nosotros somos el{" "}
          <strong>Responsable</strong> de proteger tus datos de cuenta. Si eres
          un cliente que agenda una cita con un negocio, ese negocio es el{" "}
          <strong>Responsable</strong> de tus datos y Agendur actúa únicamente
          como su proveedor tecnológico (<strong>Encargado</strong>).
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Dada la naturaleza de software como servicio (SaaS) B2B2C de la
            plataforma, el carácter jurídico con el que interviene{" "}
            <strong>Agendur</strong> se divide en dos supuestos:
          </p>
          <ul className="list-disc space-y-2.5 pl-6">
            <li>
              <strong>Agendur como Responsable del Tratamiento:</strong>{" "}
              Respecto de los datos personales de los titulares de{" "}
              <strong>Cuentas de Negocio y su Personal</strong> registrados en
              las tablas operativas del sistema (
              <code className={privacyCodeClass}>perfiles_usuario</code>,{" "}
              <code className={privacyCodeClass}>negocios</code>,{" "}
              <code className={privacyCodeClass}>sucursales</code> y{" "}
              <code className={privacyCodeClass}>consentimientos_usuario</code>
              ). Datos societarios y domicilio del Responsable:{" "}
              <PendingField>
                Denominación o razón social exacta del Responsable, RFC y
                domicilio físico en México para oír y recibir notificaciones de
                privacidad
              </PendingField>
              . Correo de contacto de privacidad:{" "}
              <a href="mailto:privacidad@agendur.app" className={privacyLinkClass}>
                privacidad@agendur.app
              </a>
              .
            </li>
            <li>
              <strong>Agendur como Encargado (Procesador) del Tratamiento:</strong>{" "}
              Respecto de los datos personales de los{" "}
              <strong>Clientes Finales</strong> que reservan una cita a través
              del portal público de un Negocio (registro en{" "}
              <code className={privacyCodeClass}>citas</code>
              ). En dicha relación, cada Negocio o establecimiento actúa como{" "}
              <strong>Responsable</strong> independiente frente a sus propios
              clientes conforme al artículo 49 del Reglamento de la LFPDPPP, y
              Agendur procesa la información exclusivamente por cuenta e
              instrucciones de dicho Negocio para gestionar la agenda y enviar
              notificaciones de la reserva.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
