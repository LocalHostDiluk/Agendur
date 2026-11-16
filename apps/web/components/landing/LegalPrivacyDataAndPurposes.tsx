import {
  privacySectionClass,
  privacyHeadingClass,
  privacySimpleBoxClass,
  privacyCodeClass,
  privacyLinkClass,
} from "./LegalPrivacyIntroAndRoles";

export function LegalPrivacyDataAndPurposes() {
  return (
    <>
      {/* 2. Datos Personales que Recabamos */}
      <section id="datos-recabados" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>2. Datos Personales que Recabamos</h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Solo pedimos los datos estrictamente
          necesarios para operar tu cuenta, mostrar el catálogo de tu negocio y
          registrar citas. <strong>Nunca guardamos números de tarjeta ni códigos CVV</strong>;
          los pagos se procesan directamente en Stripe.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Dependiendo de su perfil de uso dentro de la plataforma, recabamos
            las siguientes categorías de datos personales:
          </p>
          <ul className="list-disc space-y-2.5 pl-6">
            <li>
              <strong>Titulares y Administradores del Negocio:</strong> nombres,
              apellidos, correo electrónico, teléfono en formato internacional (
              <code className={privacyCodeClass}>E.164</code>), rol operativo (
              <code className={privacyCodeClass}>Dueño</code>,{" "}
              <code className={privacyCodeClass}>Gerente</code>,{" "}
              <code className={privacyCodeClass}>Recepcionista</code>,{" "}
              <code className={privacyCodeClass}>Otro</code>), preferencia de idioma (
              <code className={privacyCodeClass}>locale</code>), datos de sucursales (
              <code className={privacyCodeClass}>nombre_comercial</code>,{" "}
              <code className={privacyCodeClass}>slug</code>, giro comercial, dirección,
              ciudad, zona horaria) y bitácora de aceptación normativa (
              <code className={privacyCodeClass}>consentimientos_usuario</code>).
            </li>
            <li>
              <strong>Profesionales del Negocio:</strong> nombre, apellido,
              especialidad o cargo, horarios de atención semanales y, de forma
              opcional cuando el Negocio los configura, correo electrónico,
              teléfono de contacto y fotografía de perfil (
              <code className={privacyCodeClass}>avatar_url</code>).
            </li>
            <li>
              <strong>Clientes Finales que agendan citas:</strong> nombre,
              apellido, teléfono de contacto, correo electrónico, servicio,
              profesional y sucursal seleccionados, fecha y hora de la cita,
              monto y método de anticipo, notas opcionales proporcionadas por el
              cliente (<code className={privacyCodeClass}>notas_cliente</code>) y marcas
              de tiempo de aceptación expresa (
              <code className={privacyCodeClass}>privacidad_aceptada_en</code> y{" "}
              <code className={privacyCodeClass}>politica_cancelacion_aceptada_en</code>).
            </li>
          </ul>
          <p className="rounded-lg border border-[#D8D0BF] bg-[#EAE3D2]/50 p-3.5 text-xs sm:text-sm dark:border-[#332B3D] dark:bg-[#17121B]/60">
            <strong>Importante sobre datos financieros y sensibles:</strong>{" "}
            Agendur <strong>no almacena números completos de tarjetas bancarias ni códigos de seguridad CVV</strong>.
            Las transacciones de suscripción y cobro se procesan de manera
            directa y tokenizada por <strong>Stripe</strong> bajo certificación
            PCI-DSS Nivel 1. Asimismo, exhortamos a los Clientes Finales a no
            incluir datos personales sensibles de salud en el campo abierto{" "}
            <code className="font-mono">notas_cliente</code>.
          </p>
        </div>
      </section>

      {/* 3. Finalidades del Tratamiento */}
      <section id="finalidades" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          3. Finalidades del Tratamiento (Primarias y Secundarias)
        </h2>
        <div className={privacySimpleBoxClass}>
          <strong>En simple:</strong> Usamos tus datos para que la agenda
          funcione en tiempo real, para enviar recordatorios de citas por
          WhatsApp y correo, y para gestionar tu suscripción. No vendemos tus
          datos a terceros.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            <strong>Finalidades Primarias (necesarias para el servicio):</strong>{" "}
            Dan origen y son indispensables para la relación jurídica y técnica
            en la plataforma:
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              Creación, autenticación y administración segura de cuentas de
              negocio y perfiles de usuario.
            </li>
            <li>
              Sincronización de calendario y disponibilidad de horarios en
              tiempo real entre sucursales y profesionales.
            </li>
            <li>
              Gestión de reservas, bloqueo de horarios y registro de anticipos o
              estados de citas.
            </li>
            <li>
              Envío de confirmaciones, códigos de reserva, reprogramaciones y
              recordatorios transaccionales automatizados por{" "}
              <strong>WhatsApp</strong> y correo electrónico.
            </li>
            <li>
              Facturación y administración de planes de suscripción (
              <code className={privacyCodeClass}>Starter</code>,{" "}
              <code className={privacyCodeClass}>Pro</code>,{" "}
              <code className={privacyCodeClass}>Business</code>).
            </li>
            <li>
              Prevención de fraude, mitigación de tráfico automatizado
              (anti-bots) y diagnóstico de errores técnicos.
            </li>
          </ul>

          <p className="pt-2">
            <strong>Finalidades Secundarias (opcionales):</strong> De manera
            adicional, podremos utilizar los datos de contacto de los titulares
            de Cuentas de Negocio para enviar avisos sobre nuevas
            funcionalidades, encuestas de calidad y mejora de experiencia del
            producto. Si no desea que sus datos sean tratados para estas
            finalidades secundarias, puede manifestar su negativa o solicitar su
            baja inmediata en cualquier momento enviando un correo a{" "}
            <a href="mailto:privacidad@agendur.app" className={privacyLinkClass}>
              privacidad@agendur.app
            </a>
            , sin que ello afecte el uso ni la continuidad de su cuenta en
            Agendur.
          </p>
        </div>
      </section>
    </>
  );
}
