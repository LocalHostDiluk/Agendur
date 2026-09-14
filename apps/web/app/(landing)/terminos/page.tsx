import type { Metadata } from "next";
import { LegalDraftShell } from "@/components/landing/LegalDraftShell";

export const metadata: Metadata = {
  title: "Términos del servicio — borrador | Agendur",
  robots: { index: false, follow: false },
};

const sectionClass = "space-y-2";
const headingClass = "text-xl font-semibold";

export default function TermsPage() {
  return (
    <LegalDraftShell title="Términos del servicio">
      <p>
        Propuesta de condiciones para la plataforma Agendur. Describe el alcance
        técnico observado en el repositorio; no sustituye una oferta comercial,
        un contrato ni la revisión del operador y de asesoría jurídica.
      </p>

      <section className={sectionClass}>
        <h2 className={headingClass}>1. Quién presta el servicio</h2>
        <p><strong>Pendiente:</strong> nombre o razón social del operador, domicilio, país de operación y canales verificables de soporte y reclamaciones. La marca Agendur, por sí sola, no identifica a la parte contratante.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>2. Alcance de la plataforma</h2>
        <p>El proyecto contempla cuentas de negocio, sucursales, servicios, profesionales, un portal de reservas, citas y suscripciones. Algunas funciones mostradas en materiales comerciales podrían no estar operativas; antes de contratar debe precisarse qué funciones se ofrecen efectivamente y bajo qué plan.</p>
        <p><strong>Pendiente:</strong> definir niveles de servicio, soporte, disponibilidad y funciones incluidas en cada plan. Ninguna descripción de este borrador garantiza una función futura.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>3. Cuentas y contenido del negocio</h2>
        <p>La cuenta administrativa sirve para gestionar la información del negocio. Como condición propuesta, quien la administre debería mantener datos de contacto y catálogo correctos, proteger sus credenciales y contar con autorización para publicar datos de profesionales y atender reservas de clientes. Agendur no presta los servicios profesionales anunciados por cada negocio.</p>
        <p><strong>Pendiente:</strong> verificar el modelo de roles, edad mínima, usos prohibidos, suspensión y procedimiento de recuperación de cuenta antes de convertir estas condiciones en obligaciones vigentes.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>4. Reservas y pagos</h2>
        <p>La plataforma registra reservas y contempla planes de suscripción con cobro manual o mediante Stripe. La prestación del servicio reservado al cliente corresponde al negocio que lo ofrece; sus reglas de precio, anticipos, cambios y cancelación deben presentarse con claridad en el flujo de reserva.</p>
        <p><strong>Pendiente:</strong> precio final, impuestos, duración de prueba, periodicidad y fecha de cargos, renovación, cancelación inmediata cuando corresponda, reembolsos, contracargos y comprobantes. No se afirma aquí que exista una política de reembolso ni una renovación automática aprobada.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>5. Datos, continuidad y cambios</h2>
        <p>El tratamiento de datos necesita un aviso de privacidad aprobado y accesible. Deben definirse las condiciones de conservación, exportación y eliminación de información al cerrar una cuenta, así como el canal y plazo de aviso de cambios materiales del servicio.</p>
        <p><strong>Pendiente:</strong> reglas de interrupciones, responsabilidad, propiedad del contenido, terminación y resolución de disputas; no se incluyen renuncias de derechos ni limitaciones de responsabilidad sin validación jurídica.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>6. Jurisdicción y revisión</h2>
        <p>Se ha usado México sólo como <strong>hipótesis de trabajo</strong> porque el proyecto contiene valores es-MX y MXN; el país y la ley aplicable requieren confirmación. Si el servicio opera en México, la información previa a transacciones electrónicas y los cargos recurrentes deben revisarse frente a la <a className="text-blue-700 underline dark:text-blue-400" href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf">Ley Federal de Protección al Consumidor</a>. Esta referencia no certifica cumplimiento.</p>
      </section>
    </LegalDraftShell>
  );
}
