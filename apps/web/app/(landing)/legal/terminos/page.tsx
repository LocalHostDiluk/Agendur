import type { Metadata } from "next";
import { LegalDraftShell, PendingField, type LegalSectionItem } from "@/components/landing/LegalDraftShell";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | Agendur",
  description:
    "Condiciones legales que regulan el acceso y uso de la plataforma SaaS de gestión de citas, sucursales y reservas en línea de Agendur.",
  robots: { index: false, follow: false },
};

const SECTIONS: LegalSectionItem[] = [
  { id: "operador", label: "1. Identidad del Operador y Aceptación" },
  { id: "servicio", label: "2. Descripción del Servicio SaaS" },
  { id: "cuentas", label: "3. Cuentas Administradoras, Seguridad y Roles" },
  { id: "planes", label: "4. Planes, Prueba Gratuita de 14 Días y Facturación" },
  { id: "citas-y-anticipos", label: "5. Relación entre Negocios y Clientes Finales" },
  { id: "uso-aceptable", label: "6. Uso Aceptable y Conductas Prohibidas" },
  { id: "disponibilidad", label: "7. Disponibilidad, Monitoreo y Limitación de Responsabilidad" },
  { id: "jurisdiccion", label: "8. Legislación Aplicable y Jurisdicción" },
];

const sectionClass = "scroll-mt-24 space-y-4";
const headingClass = "font-bricolage text-xl sm:text-2xl font-bold tracking-tight";
const summaryBoxClass =
  "rounded-lg border-l-4 border-[#6E49A6] bg-[#6E49A6]/5 p-3.5 text-sm";

export default function TermsPage() {
  return (
    <LegalDraftShell
      title="Términos y Condiciones de Uso"
      subtitle="Condiciones que regulan el acceso y uso de la plataforma SaaS de gestión de citas, sucursales y reservas en línea de Agendur."
      activeDoc="terminos"
      sections={SECTIONS}
    >
      <section id="operador" className={sectionClass}>
        <h2 className={headingClass}>1. Identidad del Operador y Aceptación</h2>
        <div className={summaryBoxClass}>
          <strong>En simple:</strong> Al crear tu cuenta o agendar una cita en{" "}
          <code>agendur.app</code>, aceptas estas reglas de uso y guardamos constancia
          auditada de tu aceptación.
        </div>
        <p>
          Los presentes Términos y Condiciones de Uso regulan el acceso y utilización
          de la plataforma tecnológica operada bajo la marca comercial{" "}
          <strong>Agendur</strong> (<code>agendur.app</code>), con canal oficial de
          atención y contacto en{" "}
          <a href="mailto:soporte@agendur.app" className="underline">
            soporte@agendur.app
          </a>
          . Datos societarios del titular:{" "}
          <PendingField>
            Denominación o razón social del operador, RFC y domicilio fiscal en México
            para notificaciones legales
          </PendingField>
          .
        </p>
        <p>
          Al registrarse como Negocio o utilizar el portal de reservas, el usuario
          manifiesta su consentimiento expreso mediante medios electrónicos. Dicha
          aceptación queda registrada de forma verificable en nuestra bitácora de{" "}
          <code>consentimientos_usuario</code> (versión <code>v1</code>), incluyendo
          marca de tiempo (UTC), versión documental aceptada, huella técnica de red
          y agente de navegador.
        </p>
      </section>

      <section id="servicio" className={sectionClass}>
        <h2 className={headingClass}>2. Descripción del Servicio SaaS</h2>
        <div className={summaryBoxClass}>
          <strong>En simple:</strong> Agendur es un software en la nube para que negocios
          con citas administren sucursales, profesionales, horarios, pagos de anticipos
          y recordatorios por WhatsApp y correo.
        </div>
        <p>
          Agendur provee una solución de Software como Servicio (SaaS) diseñada para la
          operación y administración integral de negocios basados en citas. Las
          funcionalidades principales de la plataforma comprenden:
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Agenda en tiempo real multi-sucursal:</strong> control de
            disponibilidad, bloqueos de horario, estados de cita y asignación de
            espacios por sucursal.
          </li>
          <li>
            <strong>Gestión de profesionales y servicios:</strong> configuración de
            catálogos de servicios, precios en MXN, duraciones, comisiones y horarios
            individuales de atención.
          </li>
          <li>
            <strong>Portal público de reservas:</strong> página web personalizada bajo
            subdominio o ruta dedicada (<code>negocio.agendur.app</code> /{" "}
            <code>/reserva/[negocioSlug]</code>) disponible 24/7 para clientes finales.
          </li>
          <li>
            <strong>Cobro de anticipos y automatización:</strong> integración para
            retención o cobro de anticipos en línea y envío automatizado de
            confirmaciones y recordatorios vía <strong>WhatsApp</strong> y{" "}
            <strong>correo electrónico</strong>.
          </li>
        </ul>
      </section>

      <section id="cuentas" className={sectionClass}>
        <h2 className={headingClass}>3. Cuentas Administradoras, Seguridad y Roles</h2>
        <div className={summaryBoxClass}>
          <strong>En simple:</strong> Debes ser mayor de 18 años, usar contraseñas
          seguras de al menos 12 caracteres y eres responsable de los permisos que
          asignes a tu equipo (<code>Dueño</code>, <code>Gerente</code>,{" "}
          <code>Recepcionista</code> u <code>Otro</code>).
        </div>
        <p>
          El registro de una cuenta administradora de Negocio está reservado
          exclusivamente a personas físicas mayores de <strong>18 años</strong> con
          capacidad legal para contratar, o representantes autorizados de personas
          morales. Para proteger la integridad del acceso, Agendur exige una{" "}
          <strong>contraseña mínima de 12 caracteres</strong> con validación criptográfica
          y aplica verificación anti-bots mediante{" "}
          <strong>Cloudflare Turnstile</strong> en los flujos de autenticación y
          registro.
        </p>
        <p>
          El titular de la cuenta puede habilitar accesos diferenciados para su personal
          bajo el esquema de roles del sistema (<code>Dueño</code>,{" "}
          <code>Gerente</code>, <code>Recepcionista</code> y <code>Otro</code>). El
          Negocio titular es el único responsable de custodiar sus credenciales,
          revocar accesos de excolaboradores y responder por toda acción ejecutada
          desde los perfiles vinculados a su organización.
        </p>
      </section>

      <section id="planes" className={sectionClass}>
        <h2 className={headingClass}>
          4. Planes, Prueba Gratuita de 14 Días y Facturación
        </h2>
        <div className={summaryBoxClass}>
          <strong>En simple:</strong> Tienes 14 días gratis en el plan Starter sin
          cargo inicial. Después eliges tu plan en pesos mexicanos (MXN) con pago
          mensual o anual vía Stripe, y puedes cancelar cuando quieras conservando el
          acceso hasta el final de tu periodo pagado.
        </div>
        <p>
          Al crear una cuenta nueva, el Negocio accede a un periodo de{" "}
          <strong>prueba gratuita de 14 días naturales</strong> en el plan{" "}
          <strong>Starter</strong> sin cargo inicial. Al concluir el periodo de prueba,
          la continuidad del servicio requiere mantener una suscripción activa en alguno
          de nuestros planes expresados en pesos mexicanos (<code>MXN</code>):
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Plan Starter:</strong> <strong>$199 MXN/mes</strong> en modalidad
            mensual o <strong>$159 MXN/mes</strong> en modalidad anual (
            <strong>$1,908 MXN/año</strong>). Incluye 1 sucursal, hasta 3 profesionales,
            citas ilimitadas y hasta 100 recordatorios por WhatsApp al mes.
          </li>
          <li>
            <strong>Plan Pro:</strong> <strong>$399 MXN/mes</strong> en modalidad
            mensual o <strong>$319 MXN/mes</strong> en modalidad anual (
            <strong>$3,828 MXN/año</strong>). Incluye hasta 3 sucursales, hasta 10
            profesionales, cobro de anticipos online, hasta 500 recordatorios por
            WhatsApp al mes y reportes exportables.
          </li>
          <li>
            <strong>Plan Business:</strong> cotización personalizada para cadenas y
            franquicias con sucursales y profesionales ilimitados, configuración a
            medida y atención prioritaria.
          </li>
        </ul>
        <p>
          Los cobros recurrentes se procesan de forma segura a través de{" "}
          <strong>Stripe</strong> o mediante la modalidad manual autorizada por Agendur.
          El Negocio puede cancelar su suscripción en cualquier momento desde su panel
          de administración, conservando el acceso íntegro a las funciones contratadas
          hasta el último día del ciclo de facturación previamente pagado.{" "}
          <PendingField>
            Política de emisión de CFDI (facturación electrónica mexicana) y supuestos
            extraordinarios de reembolso conforme a la LFPC
          </PendingField>
          .
        </p>
      </section>

      <section id="citas-y-anticipos" className={sectionClass}>
        <h2 className={headingClass}>
          5. Relación entre Negocios y Clientes Finales (Reservas y Anticipos)
        </h2>
        <div className={summaryBoxClass}>
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

      <section id="uso-aceptable" className={sectionClass}>
        <h2 className={headingClass}>6. Uso Aceptable y Conductas Prohibidas</h2>
        <div className={summaryBoxClass}>
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

      <section id="disponibilidad" className={sectionClass}>
        <h2 className={headingClass}>
          7. Disponibilidad, Monitoreo y Limitación de Responsabilidad
        </h2>
        <div className={summaryBoxClass}>
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

      <section id="jurisdiccion" className={sectionClass}>
        <h2 className={headingClass}>8. Legislación Aplicable y Jurisdicción</h2>
        <div className={summaryBoxClass}>
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
    </LegalDraftShell>
  );
}
