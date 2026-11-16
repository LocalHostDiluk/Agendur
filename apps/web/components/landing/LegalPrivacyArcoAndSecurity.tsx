import { PendingField } from "@/components/landing/LegalDraftShell";
import {
  privacySectionClass,
  privacyHeadingClass,
  privacySimpleBoxClass,
  privacyCodeClass,
  privacyLinkClass,
} from "./LegalPrivacyIntroAndRoles";

export function LegalPrivacyArcoAndSecurity() {
  return (
    <>
      {/* 6. Ejercicio de Derechos ARCO y Revocación */}
      <section id="derechos-arco" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          6. Ejercicio de Derechos ARCO y Revocación del Consentimiento
        </h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Tienes derecho a acceder, corregir, eliminar tus datos u oponerte a su uso escribiendo a{" "}
          <code className="font-mono">privacidad@agendur.app</code>. Te responderemos en un plazo máximo de 20 días hábiles conforme a la ley mexicana.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (<strong>Acceso</strong>); solicitar la corrección de su información en caso de que esté desactualizada, sea inexacta o incompleta (<strong>Rectificación</strong>); que la eliminemos de nuestros registros o bases de datos cuando considere que no está siendo utilizada adecuadamente (<strong>Cancelación</strong>); así como oponerse al uso de sus datos para fines específicos (<strong>Oposición</strong>), o revocar el consentimiento otorgado.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Canal de recepción:</strong> Puede presentar su solicitud ARCO o de revocación enviando un correo electrónico a{" "}
              <a href="mailto:privacidad@agendur.app" className={privacyLinkClass}>privacidad@agendur.app</a> o a{" "}
              <a href="mailto:soporte@agendur.app" className={privacyLinkClass}>soporte@agendur.app</a>, indicando su nombre completo, correo o teléfono registrado, una descripción clara de los datos sobre los que busca ejercer el derecho y copia de una identificación oficial vigente.
            </li>
            <li>
              <strong>Plazos legales (artículo 32 de la LFPDPPP):</strong> Agendur comunicará la determinación adoptada en un plazo máximo de <strong>20 días hábiles</strong> contados desde la fecha en que se recibió la solicitud. En caso de resultar procedente, se hará efectiva dentro de los <strong>15 días hábiles</strong> siguientes a la fecha en que se comunique la respuesta.
            </li>
            <li>
              <strong>Solicitudes de Clientes Finales:</strong> Los Clientes Finales que agendaron una cita pueden ejercer sus derechos ARCO directamente ante el <strong>Negocio</strong> con el que reservaron (en su calidad de Responsable), o bien remitir su solicitud a{" "}
              <a href="mailto:privacidad@agendur.app" className={privacyLinkClass}>privacidad@agendur.app</a> para que Agendur la canalice y ejecute las instrucciones técnicas correspondientes.
            </li>
          </ul>
        </div>
      </section>

      {/* 7. Medidas de Seguridad y Plazos de Conservación */}
      <section id="conservacion-y-seguridad" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          7. Medidas de Seguridad y Plazos de Conservación
        </h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Protegemos la información con cifrado TLS, contraseñas encriptadas y aislamiento estricto por negocio en la base de datos para que ningún establecimiento pueda ver datos de otro.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Agendur implementa medidas de seguridad administrativas, técnicas y físicas conforme al artículo 19 de la LFPDPPP para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado:
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>Cifrado en tránsito y contraseñas:</strong> Todas las comunicaciones se transmiten bajo protocolo seguro TLS (HTTPS) y las credenciales de acceso se resguardan mediante funciones de hash criptográfico irreversible.
            </li>
            <li>
              <strong>Aislamiento multitenant y control por rol:</strong> Aplicamos políticas de seguridad a nivel de fila (<em>Row Level Security — RLS</em> en PostgreSQL) por negocio y por rol operativo, garantizando que cada cuenta acceda únicamente a sus propias sucursales, profesionales y citas.
            </li>
            <li>
              <strong>Plazos de conservación y bloqueo:</strong> Los datos se conservarán durante la vigencia de la cuenta o de la relación comercial y posteriormente pasarán a un periodo de bloqueo previo a su supresión definitiva conforme a:{" "}
              <PendingField>
                Plazo exacto en meses de bloqueo y supresión definitiva tras la cancelación de una cuenta de negocio
              </PendingField>.
            </li>
          </ul>
        </div>
      </section>

      {/* 8. Cambios al Aviso de Privacidad */}
      <section id="actualizaciones" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>8. Cambios al Aviso de Privacidad</h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Si actualizamos este aviso, publicaremos la nueva versión en <code className="font-mono">/legal/privacidad</code> y avisaremos a los negocios registrados manteniendo trazabilidad de la versión aceptada.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            El presente Aviso de Privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de las propias necesidades de los servicios que ofrecemos en Agendur o de nuestras prácticas de privacidad.
          </p>
          <p>
            Cualquier modificación sustancial será publicada de forma permanente en la ruta pública <code className={privacyCodeClass}>/legal/privacidad</code>, llevando el control criptográfico y de versión en la bitácora <code className={privacyCodeClass}>consentimientos_usuario</code> (versión actual <code className={privacyCodeClass}>v1</code>) y notificando por correo electrónico o mediante aviso destacado en el panel administrativo a los titulares registrados.
          </p>
        </div>
      </section>
    </>
  );
}
