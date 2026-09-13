import type { Metadata } from "next";
import { LegalDraftShell } from "@/components/landing/LegalDraftShell";

export const metadata: Metadata = {
  title: "Aviso de privacidad — borrador | CitaSync",
  robots: { index: false, follow: false },
};

const sectionClass = "space-y-2";
const headingClass = "text-xl font-semibold";

export default function PrivacyPage() {
  return (
    <LegalDraftShell title="Aviso de privacidad">
      <p>
        Inventario y propuesta inicial para las personas que administran negocios,
        sus profesionales y quienes reservan citas. No es todavía un aviso integral:
        faltan datos del responsable y decisiones sobre tratamiento, proveedores y derechos.
      </p>

      <section className={sectionClass}>
        <h2 className={headingClass}>1. Responsable y contacto</h2>
        <p><strong>Pendiente:</strong> identidad legal y domicilio del responsable, país de operación, correo o medio para solicitudes de privacidad y contacto encargado de derechos de las personas. También debe determinarse cuándo CitaSync actúa por cuenta del negocio respecto de sus clientes.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>2. Datos identificados en la aplicación</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Administradores:</strong> correo y credenciales de acceso gestionados mediante autenticación; nombres, apellidos, teléfono opcional, idioma, negocio y registro de aceptación de documentos.</li>
          <li><strong>Negocios y profesionales:</strong> nombre comercial, giro, datos de sucursal, ubicación, teléfono y, para profesionales, nombre, apellido, correo y teléfono opcionales.</li>
          <li><strong>Clientes que reservan:</strong> nombre, apellido, correo, teléfono, servicio, profesional, fecha, hora, estado, importe y notas opcionales de la cita.</li>
          <li><strong>Suscripciones y seguridad:</strong> plan, estado e identificadores de pago; token de verificación antiabuso y datos técnicos que puedan figurar en informes de error.</li>
        </ul>
        <p>Este inventario procede del esquema y código actuales; debe contrastarse con la configuración real de producción y con cada proveedor. El campo libre de notas puede recibir información sensible si alguien la introduce; aún falta definir controles y si debe permitirse.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>3. Finalidades previstas</h2>
        <p>Los flujos observados usan datos para crear y proteger cuentas, administrar negocios y sucursales, mostrar disponibilidad, registrar reservas, gestionar suscripciones y diagnosticar errores. <strong>Pendiente:</strong> separar finalidades necesarias de opcionales, documentar cualquier uso comercial o analítico y definir los mecanismos de negativa o consentimiento que correspondan. No se presupone autorización para publicidad.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>4. Servicios de terceros y comunicaciones</h2>
        <p>El código integra Supabase para autenticación y datos, Cloudflare Turnstile para protección del registro, Stripe en el flujo opcional de suscripciones y Sentry para informes de errores. Se deben verificar contratos, datos enviados, ubicación de procesamiento y si cada flujo constituye encargo o transferencia. No se describe como activo un envío automático de WhatsApp o correo de marketing sólo por aparecer en materiales del producto.</p>
        <p><strong>Pendiente:</strong> relación completa de destinatarios, transferencias nacionales o internacionales, finalidades y consentimiento cuando sea exigible.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>5. Conservación y derechos</h2>
        <p><strong>Pendiente:</strong> plazos de conservación por tipo de dato, criterios de borrado, respaldos, exportación y atención de acceso, rectificación, cancelación, oposición y revocación del consentimiento. Sin un canal y procedimiento comprobados no sería honesto ofrecer aquí una dirección o plazo concreto.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>6. Tecnologías y cambios</h2>
        <p>La interfaz guarda la preferencia de tema en almacenamiento local y el acceso autenticado utiliza cookies de sesión. Turnstile puede procesar información técnica para distinguir tráfico automatizado. <strong>Pendiente:</strong> inventariar otras cookies, medición, duración y opciones de control, y definir el medio para comunicar cambios a este aviso.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>7. Marco de referencia</h2>
        <p>México es sólo una <strong>hipótesis de trabajo</strong> basada en valores es-MX y MXN del repositorio. Si se confirma esa operación, la <a className="text-blue-700 underline dark:text-blue-400" href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf">Ley Federal de Protección de Datos Personales en Posesión de los Particulares</a>, especialmente sus artículos 14 a 16, servirá para completar y revisar el aviso. Este enlace no implica que el borrador ya cumpla sus requisitos.</p>
      </section>
    </LegalDraftShell>
  );
}
