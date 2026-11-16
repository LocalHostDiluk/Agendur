import { PendingField } from "@/components/landing/LegalDraftShell";

export const termsSectionClass = "scroll-mt-24 space-y-4";
export const termsHeadingClass = "font-bricolage text-xl sm:text-2xl font-bold tracking-tight";
export const termsSummaryBoxClass =
  "rounded-lg border-l-4 border-[#6E49A6] bg-[#6E49A6]/5 p-3.5 text-sm";

export function LegalTermsServiceAndPlans() {
  return (
    <>
      <section id="operador" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>1. Identidad del Operador y Aceptación</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Al crear tu cuenta o agendar una cita en{" "}
          <code>agendur.app</code>, aceptas estas reglas de uso y guardamos constancia
          auditada de tu aceptación.
        </div>
        <p>
          Los presentes Términos y Condiciones de Uso regulan el acceso y utilización de la plataforma tecnológica operada bajo la marca comercial <strong>Agendur</strong> (<code>agendur.app</code>), con canal oficial de atención y contacto en{" "}
          <a href="mailto:soporte@agendur.app" className="underline">soporte@agendur.app</a>. Datos societarios del titular:{" "}
          <PendingField>Denominación o razón social del operador, RFC y domicilio fiscal en México para notificaciones legales</PendingField>.
        </p>
        <p>
          Al registrarse como Negocio o utilizar el portal de reservas, el usuario manifiesta su consentimiento expreso mediante medios electrónicos. Dicha aceptación queda registrada de forma verificable en nuestra bitácora de <code>consentimientos_usuario</code> (versión <code>v1</code>), incluyendo marca de tiempo (UTC), versión documental aceptada, huella técnica de red y agente de navegador.
        </p>
      </section>

      <section id="servicio" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>2. Descripción del Servicio SaaS</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Agendur es un software en la nube para que negocios con citas administren sucursales, profesionales, horarios, pagos de anticipos y recordatorios por WhatsApp y correo.
        </div>
        <p>
          Agendur provee una solución de Software como Servicio (SaaS) diseñada para la operación y administración integral de negocios basados en citas. Las funcionalidades principales de la plataforma comprenden:
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Agenda en tiempo real multi-sucursal:</strong> control de disponibilidad, bloqueos de horario, estados de cita y asignación de espacios por sucursal.
          </li>
          <li>
            <strong>Gestión de profesionales y servicios:</strong> configuración de catálogos de servicios, precios en MXN, duraciones, comisiones y horarios individuales de atención.
          </li>
          <li>
            <strong>Portal público de reservas:</strong> página web personalizada bajo subdominio o ruta dedicada (<code>negocio.agendur.app</code> / <code>/reserva/[negocioSlug]</code>) disponible 24/7 para clientes finales.
          </li>
          <li>
            <strong>Cobro de anticipos y automatización:</strong> integración para retención o cobro de anticipos en línea y envío automatizado de confirmaciones y recordatorios vía <strong>WhatsApp</strong> y <strong>correo electrónico</strong>.
          </li>
        </ul>
      </section>

      <section id="cuentas" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>3. Cuentas Administradoras, Seguridad y Roles</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Debes ser mayor de 18 años, usar contraseñas seguras de al menos 12 caracteres y eres responsable de los permisos que asignes a tu equipo (<code>Dueño</code>, <code>Gerente</code>, <code>Recepcionista</code> u <code>Otro</code>).
        </div>
        <p>
          El registro de una cuenta administradora de Negocio está reservado exclusivamente a personas físicas mayores de <strong>18 años</strong> con capacidad legal para contratar, o representantes autorizados de personas morales. Para proteger la integridad del acceso, Agendur exige una <strong>contraseña mínima de 12 caracteres</strong> con validación criptográfica y aplica verificación anti-bots mediante <strong>Cloudflare Turnstile</strong> en los flujos de autenticación y registro.
        </p>
        <p>
          El titular de la cuenta puede habilitar accesos diferenciados para su personal bajo el esquema de roles del sistema (<code>Dueño</code>, <code>Gerente</code>, <code>Recepcionista</code> y <code>Otro</code>). El Negocio titular es el único responsable de custodiar sus credenciales, revocar accesos de excolaboradores y responder por toda acción ejecutada desde los perfiles vinculados a su organización.
        </p>
      </section>

      <section id="planes" className={termsSectionClass}>
        <h2 className={termsHeadingClass}>4. Planes, Prueba Gratuita de 14 Días y Facturación</h2>
        <div className={termsSummaryBoxClass}>
          <strong>En simple:</strong> Tienes 14 días gratis en el plan Starter sin cargo inicial. Después eliges tu plan en pesos mexicanos (MXN) con pago mensual o anual vía Stripe, y puedes cancelar cuando quieras conservando el acceso hasta el final de tu periodo pagado.
        </div>
        <p>
          Al crear una cuenta nueva, el Negocio accede a un periodo de <strong>prueba gratuita de 14 días naturales</strong> en el plan <strong>Starter</strong> sin cargo inicial. Al concluir el periodo de prueba, la continuidad del servicio requiere mantener una suscripción activa en alguno de nuestros planes expresados en pesos mexicanos (<code>MXN</code>):
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Plan Starter:</strong> <strong>$199 MXN/mes</strong> en modalidad mensual o <strong>$159 MXN/mes</strong> en modalidad anual (<strong>$1,908 MXN/año</strong>). Incluye 1 sucursal, hasta 3 profesionales, citas ilimitadas y hasta 100 recordatorios por WhatsApp al mes.
          </li>
          <li>
            <strong>Plan Pro:</strong> <strong>$399 MXN/mes</strong> en modalidad mensual o <strong>$319 MXN/mes</strong> en modalidad anual (<strong>$3,828 MXN/año</strong>). Incluye hasta 3 sucursales, hasta 10 profesionales, cobro de anticipos online, hasta 500 recordatorios por WhatsApp al mes y reportes exportables.
          </li>
          <li>
            <strong>Plan Business:</strong> cotización personalizada para cadenas y franquicias con sucursales y profesionales ilimitados, configuración a medida y atención prioritaria.
          </li>
        </ul>
        <p>
          Los cobros recurrentes se procesan de forma segura a través de <strong>Stripe</strong> o mediante la modalidad manual autorizada por Agendur. El Negocio puede cancelar su suscripción en cualquier momento desde su panel de administración, conservando el acceso íntegro a las funciones contratadas hasta el último día del ciclo de facturación previamente pagado.{" "}
          <PendingField>Política de emisión de CFDI (facturación electrónica mexicana) y supuestos extraordinarios de reembolso conforme a la LFPC</PendingField>.
        </p>
      </section>
    </>
  );
}
