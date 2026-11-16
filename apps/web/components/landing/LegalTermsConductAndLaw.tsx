import { PendingField } from "@/components/landing/LegalDraftShell";
import {
  termsSectionClass,
  termsHeadingClass,
  termsSummaryBoxClass,
} from "./LegalTermsServiceAndPlans";

export function LegalTermsConductAndLaw() {
  return (
    <>
      <section id="citas-y-anticipos" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>
          5. Relación entre Negocios y Clientes Finales (Reservas y Anticipos)
        </h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Agendur provee la tecnología de reservas, pero
          cada barbería, clínica o estudio es responsable del servicio que brinda, del
          anticipo que solicita y de sus propias reglas de cancelación.
        </div>
        <p>
          Agendur actúa exclusivamente como proveedor de infraestructura tecnológica
          SaaS y no es parte en la relación comercial, profesional o de consumo entre el{" "}
          <strong>Negocio</strong> (barbería, clínica, salón, estudio o consultorio) y
          el <strong>Cliente Final</strong> que agenda una cita.
        </p>
        <p>
          El Negocio es el único y directo responsable de la calidad, puntualidad,
          higiene, precios y ejecución del servicio reservado, así como de configurar y
          respetar el porcentaje de anticipo requerido (
          <code>porcentaje_anticipo_default</code>) y los términos de su política de
          cancelación, reprogramación o inasistencia (<code>politica_cancelacion</code>)
          mostrados y aceptados por el Cliente Final durante el proceso de reserva.
          Cualquier reclamación, devolución de anticipo o controversia derivada de una
          cita deberá gestionarse directamente ante el Negocio prestador del servicio.
        </p>
      </section>

      <section id="uso-aceptable" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>6. Uso Aceptable y Conductas Prohibidas</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> No uses Agendur para enviar spam por WhatsApp o
          correo, extraer datos de forma automatizada ni suplantar la identidad de
          otros negocios o personas.
        </div>
        <p>
          El usuario se obliga a utilizar la plataforma de conformidad con la ley y las
          buenas prácticas comerciales. Queda estrictamente prohibido:
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            Utilizar los canales transaccionales de WhatsApp o correo electrónico para
            el envío de publicidad no solicitada (<em>spam</em>), fraude, phishing o
            comunicaciones ajenas a las citas agendadas.
          </li>
          <li>
            Ejecutar scripts, bots, <em>scraping</em>, ataques de denegación de servicio
            o pruebas de vulnerabilidad no autorizadas sobre los endpoints o portales de
            reserva de Agendur.
          </li>
          <li>
            Suplantar la identidad de terceros, registrar negocios ficticios o cargar
            datos personales de clientes sin contar con su autorización.
          </li>
        </ul>
      </section>

      <section id="disponibilidad" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>
          7. Disponibilidad, Monitoreo y Limitación de Responsabilidad
        </h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Operamos sobre infraestructura en la nube con
          monitoreo continuo de errores para mantener tu agenda siempre activa, y te
          atendemos en <code>soporte@agendur.app</code>.
        </div>
        <p>
          Agendur aloja su base de datos y servicios de autenticación sobre
          infraestructura de alta disponibilidad en <strong>Supabase</strong> e
          implementa monitoreo proactivo de errores y rendimiento en tiempo real mediante{" "}
          <strong>Sentry</strong>. Las solicitudes de asistencia técnica se atienden en{" "}
          <a href="mailto:soporte@agendur.app" className="underline">
            soporte@agendur.app
          </a>
          .
        </p>
        <p>
          Sin perjuicio de los esfuerzos técnicos razonables para garantizar la
          continuidad operativa, el servicio puede experimentar mantenimientos
          programados o interrupciones atribuibles a proveedores externos de nube,
          pasarelas de pago o redes de mensajería.{" "}
          <PendingField>
            Compromiso de SLA mensual garantizado para cuentas del plan Business y tope
            de responsabilidad contractual
          </PendingField>
          .
        </p>
      </section>

      <section id="jurisdiccion" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>8. Legislación Aplicable y Jurisdicción</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Estos términos se rigen por las leyes federales de
          México y cualquier controversia se resolverá ante los tribunales competentes.
        </div>
        <p>
          Para la interpretación, cumplimiento y ejecución de los presentes Términos y
          Condiciones, las partes se someten a las leyes federales vigentes en los{" "}
          <strong>Estados Unidos Mexicanos</strong>, incluyendo el Código de Comercio y,
          en lo que resulte aplicable, la Ley Federal de Protección al Consumidor
          (LFPC).
        </p>
        <p>
          Cualquier controversia derivada del uso de la plataforma se someterá a la
          jurisdicción de los tribunales competentes con sede en la Ciudad de México (
          <PendingField>
            Confirmar fuero o ciudad definitiva de los tribunales competentes
          </PendingField>
          ), renunciando expresamente a cualquier otro fuero que pudiera corresponderles
          por razón de sus domicilios presentes o futuros.
        </p>
      </section>
    </>
  );
}
