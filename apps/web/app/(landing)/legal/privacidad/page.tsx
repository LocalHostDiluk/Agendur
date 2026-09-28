import type { Metadata } from "next";
import {
  LegalDraftShell,
  PendingField,
  type LegalSectionItem,
} from "@/components/landing/LegalDraftShell";

export const metadata: Metadata = {
  title: "Aviso de Privacidad Integral | Agendur",
  description:
    "Aviso de Privacidad Integral de Agendur conforme a la LFPDPPP: tratamiento de datos personales de titulares de negocios, profesionales y clientes que agendan citas.",
  robots: { index: false, follow: false },
};

const SECTIONS: LegalSectionItem[] = [
  { id: "identidad-y-roles", label: "1. Responsable vs. Encargado" },
  { id: "datos-recabados", label: "2. Datos que Recabamos" },
  { id: "finalidades", label: "3. Finalidades del Tratamiento" },
  { id: "subprocesadores", label: "4. Subprocesadores y Transferencias" },
  { id: "cookies-y-storage", label: "5. Cookies y localStorage" },
  { id: "derechos-arco", label: "6. Derechos ARCO y Revocación" },
  { id: "conservacion-y-seguridad", label: "7. Seguridad y Conservación" },
  { id: "actualizaciones", label: "8. Cambios al Aviso" },
];

const sectionClass = "scroll-mt-24 space-y-4";
const headingClass = "font-bricolage text-xl sm:text-2xl font-bold";
const simpleBoxClass =
  "rounded-lg border-l-4 border-[#46B88A] bg-[#46B88A]/10 p-3.5 text-sm";

export default function PrivacyPage() {
  return (
    <LegalDraftShell
      title="Aviso de Privacidad Integral"
      subtitle="Transparencia sobre qué datos recabamos, con qué finalidad y cómo protegemos la información de negocios, profesionales y clientes conforme a la LFPDPPP."
      activeDoc="privacidad"
      sections={SECTIONS}
    >
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
      <section id="identidad-y-roles" className={sectionClass}>
        <h2 className={headingClass}>
          1. Identidad del Responsable vs. Encargado del Tratamiento
        </h2>
        <div className={simpleBoxClass}>
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
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                perfiles_usuario
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                negocios
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                sucursales
              </code>{" "}
              y{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                consentimientos_usuario
              </code>
              ). Datos societarios y domicilio del Responsable:{" "}
              <PendingField>
                Denominación o razón social exacta del Responsable, RFC y
                domicilio físico en México para oír y recibir notificaciones de
                privacidad
              </PendingField>
              . Correo de contacto de privacidad:{" "}
              <a
                href="mailto:privacidad@agendur.app"
                className="font-medium text-[#6E49A6] underline dark:text-[#B99CE8]"
              >
                privacidad@agendur.app
              </a>
              .
            </li>
            <li>
              <strong>Agendur como Encargado (Procesador) del Tratamiento:</strong>{" "}
              Respecto de los datos personales de los{" "}
              <strong>Clientes Finales</strong> que reservan una cita a través
              del portal público de un Negocio (registro en{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                citas
              </code>
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

      {/* 2. Datos Personales que Recabamos */}
      <section id="datos-recabados" className={sectionClass}>
        <h2 className={headingClass}>2. Datos Personales que Recabamos</h2>
        <div className={simpleBoxClass}>
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
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                E.164
              </code>
              ), rol operativo (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Dueño
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Gerente
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Recepcionista
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Otro
              </code>
              ), preferencia de idioma (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                locale
              </code>
              ), datos de sucursales (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                nombre_comercial
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                slug
              </code>
              , giro comercial, dirección, ciudad, zona horaria) y bitácora de
              aceptación normativa (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                consentimientos_usuario
              </code>
              ).
            </li>
            <li>
              <strong>Profesionales del Negocio:</strong> nombre, apellido,
              especialidad o cargo, horarios de atención semanales y, de forma
              opcional cuando el Negocio los configura, correo electrónico,
              teléfono de contacto y fotografía de perfil (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                avatar_url
              </code>
              ).
            </li>
            <li>
              <strong>Clientes Finales que agendan citas:</strong> nombre,
              apellido, teléfono de contacto, correo electrónico, servicio,
              profesional y sucursal seleccionados, fecha y hora de la cita,
              monto y método de anticipo, notas opcionales proporcionadas por el
              cliente (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                notas_cliente
              </code>
              ) y marcas de tiempo de aceptación expresa (
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                privacidad_aceptada_en
              </code>{" "}
              y{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                politica_cancelacion_aceptada_en
              </code>
              ).
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
      <section id="finalidades" className={sectionClass}>
        <h2 className={headingClass}>
          3. Finalidades del Tratamiento (Primarias y Secundarias)
        </h2>
        <div className={simpleBoxClass}>
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
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Starter
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Pro
              </code>
              ,{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                Business
              </code>
              ).
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
            <a
              href="mailto:privacidad@agendur.app"
              className="font-medium text-[#6E49A6] underline dark:text-[#B99CE8]"
            >
              privacidad@agendur.app
            </a>
            , sin que ello afecte el uso ni la continuidad de su cuenta en
            Agendur.
          </p>
        </div>
      </section>

      {/* 4. Subprocesadores y Transferencias */}
      <section id="subprocesadores" className={sectionClass}>
        <h2 className={headingClass}>
          4. Encargados, Subprocesadores y Transferencias Internacionales
        </h2>
        <div className={simpleBoxClass}>
          <strong>En simple:</strong> Nos apoyamos en 4 proveedores de
          infraestructura líderes a nivel mundial (Supabase, Stripe, Cloudflare
          y Sentry) para operar la base de datos, pagos y seguridad bajo
          contratos de confidencialidad y protección de datos.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Para cumplir con las finalidades primarias descritas, Agendur se
            apoya en subprocesadores de infraestructura tecnológica ubicados en
            los Estados Unidos y en red global, en términos del artículo 37
            fracción VII de la LFPDPPP:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#D8D0BF] bg-[#F3EEDF]/60 p-4 dark:border-[#332B3D] dark:bg-[#17121B]/70">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-bricolage text-base">Supabase</strong>
                <span className="rounded-full bg-[#6E49A6]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#6E49A6] dark:text-[#D1BEE8]">
                  EE. UU.
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6B6355] dark:text-[#A79FAE]">
                Base de datos relacional PostgreSQL, autenticación de sesiones y
                sincronización Realtime de citas y disponibilidad.
              </p>
            </div>

            <div className="rounded-xl border border-[#D8D0BF] bg-[#F3EEDF]/60 p-4 dark:border-[#332B3D] dark:bg-[#17121B]/70">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-bricolage text-base">Stripe</strong>
                <span className="rounded-full bg-[#6E49A6]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#6E49A6] dark:text-[#D1BEE8]">
                  EE. UU.
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6B6355] dark:text-[#A79FAE]">
                Procesamiento seguro de pagos, cobro recurrente de suscripciones
                y portal de facturación bajo estándar PCI-DSS.
              </p>
            </div>

            <div className="rounded-xl border border-[#D8D0BF] bg-[#F3EEDF]/60 p-4 dark:border-[#332B3D] dark:bg-[#17121B]/70">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-bricolage text-base">
                  Cloudflare Turnstile
                </strong>
                <span className="rounded-full bg-[#6E49A6]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#6E49A6] dark:text-[#D1BEE8]">
                  Red global
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6B6355] dark:text-[#A79FAE]">
                Protección contra bots, ataques de fuerza bruta y abuso
                automatizado en flujos de registro y formularios públicos.
              </p>
            </div>

            <div className="rounded-xl border border-[#D8D0BF] bg-[#F3EEDF]/60 p-4 dark:border-[#332B3D] dark:bg-[#17121B]/70">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-bricolage text-base">Sentry</strong>
                <span className="rounded-full bg-[#6E49A6]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#6E49A6] dark:text-[#D1BEE8]">
                  EE. UU.
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6B6355] dark:text-[#A79FAE]">
                Monitoreo técnico de errores en tiempo de ejecución, trazabilidad
                de fallos y estabilidad de la aplicación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Uso de Cookies y localStorage */}
      <section id="cookies-y-storage" className={sectionClass}>
        <h2 className={headingClass}>
          5. Uso de Cookies y Almacenamiento Local (<code>localStorage</code>)
        </h2>
        <div className={simpleBoxClass}>
          <strong>En simple:</strong> Solo usamos cookies técnicas para mantener
          tu sesión abierta y guardamos en tu navegador preferencias visuales
          como el modo claro/oscuro, el idioma o la sucursal seleccionada.{" "}
          <strong>No usamos cookies de rastreo publicitario.</strong>
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Agendur utiliza tecnologías de almacenamiento estrictamente
            funcionales y técnicas en su navegador web:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Cookies técnicas de sesión (Supabase Auth):</strong>{" "}
              Indispensables para autenticar al usuario, proteger las rutas del
              panel administrativo y mantener la sesión iniciada de forma
              segura.
            </li>
            <li>
              <strong>
                Claves funcionales en{" "}
                <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                  localStorage
                </code>
                :
              </strong>{" "}
              Almacenamos localmente únicamente preferencias de interfaz para
              evitar reconfiguraciones en cada visita:{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                agendur-theme
              </code>{" "}
              (preferencia de modo claro u oscuro),{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                agendur_lang
              </code>{" "}
              (idioma de la interfaz),{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                agendur_selected_sucursal_id
              </code>{" "}
              (sucursal activa seleccionada en el dashboard) y{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                agendur_sidebar_collapsed
              </code>{" "}
              (estado visual expandido o contraído del menú lateral).
            </li>
          </ul>
          <p>
            Agendur <strong>no instala cookies de rastreo publicitario de terceros</strong>{" "}
            ni perfiles de comportamiento comercial cruzado.
          </p>
        </div>
      </section>

      {/* 6. Ejercicio de Derechos ARCO y Revocación */}
      <section id="derechos-arco" className={sectionClass}>
        <h2 className={headingClass}>
          6. Ejercicio de Derechos ARCO y Revocación del Consentimiento
        </h2>
        <div className={simpleBoxClass}>
          <strong>En simple:</strong> Tienes derecho a acceder, corregir,
          eliminar tus datos u oponerte a su uso escribiendo a{" "}
          <code className="font-mono">privacidad@agendur.app</code>. Te
          responderemos en un plazo máximo de 20 días hábiles conforme a la ley
          mexicana.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted,
            para qué los utilizamos y las condiciones del uso que les damos (
            <strong>Acceso</strong>); solicitar la corrección de su información
            en caso de que esté desactualizada, sea inexacta o incompleta (
            <strong>Rectificación</strong>); que la eliminemos de nuestros
            registros o bases de datos cuando considere que no está siendo
            utilizada adecuadamente (<strong>Cancelación</strong>); así como
            oponerse al uso de sus datos para fines específicos (
            <strong>Oposición</strong>), o revocar el consentimiento otorgado.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Canal de recepción:</strong> Puede presentar su solicitud
              ARCO o de revocación enviando un correo electrónico a{" "}
              <a
                href="mailto:privacidad@agendur.app"
                className="font-medium text-[#6E49A6] underline dark:text-[#B99CE8]"
              >
                privacidad@agendur.app
              </a>{" "}
              o a{" "}
              <a
                href="mailto:soporte@agendur.app"
                className="font-medium text-[#6E49A6] underline dark:text-[#B99CE8]"
              >
                soporte@agendur.app
              </a>
              , indicando su nombre completo, correo o teléfono registrado, una
              descripción clara de los datos sobre los que busca ejercer el
              derecho y copia de una identificación oficial vigente.
            </li>
            <li>
              <strong>Plazos legales (artículo 32 de la LFPDPPP):</strong>{" "}
              Agendur comunicará la determinación adoptada en un plazo máximo de{" "}
              <strong>20 días hábiles</strong> contados desde la fecha en que se
              recibió la solicitud. En caso de resultar procedente, se hará
              efectiva dentro de los <strong>15 días hábiles</strong> siguientes
              a la fecha en que se comunique la respuesta.
            </li>
            <li>
              <strong>Solicitudes de Clientes Finales:</strong> Los Clientes
              Finales que agendaron una cita pueden ejercer sus derechos ARCO
              directamente ante el <strong>Negocio</strong> con el que
              reservaron (en su calidad de Responsable), o bien remitir su
              solicitud a{" "}
              <a
                href="mailto:privacidad@agendur.app"
                className="font-medium text-[#6E49A6] underline dark:text-[#B99CE8]"
              >
                privacidad@agendur.app
              </a>{" "}
              para que Agendur la canalice y ejecute las instrucciones técnicas
              correspondientes.
            </li>
          </ul>
        </div>
      </section>

      {/* 7. Medidas de Seguridad y Plazos de Conservación */}
      <section id="conservacion-y-seguridad" className={sectionClass}>
        <h2 className={headingClass}>
          7. Medidas de Seguridad y Plazos de Conservación
        </h2>
        <div className={simpleBoxClass}>
          <strong>En simple:</strong> Protegemos la información con cifrado TLS,
          contraseñas encriptadas y aislamiento estricto por negocio en la base
          de datos para que ningún establecimiento pueda ver datos de otro.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            Agendur implementa medidas de seguridad administrativas, técnicas y
            físicas conforme al artículo 19 de la LFPDPPP para proteger sus
            datos personales contra daño, pérdida, alteración, destrucción o el
            uso, acceso o tratamiento no autorizado:
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>Cifrado en tránsito y contraseñas:</strong> Todas las
              comunicaciones se transmiten bajo protocolo seguro TLS (HTTPS) y
              las credenciales de acceso se resguardan mediante funciones de
              hash criptográfico irreversible.
            </li>
            <li>
              <strong>Aislamiento multitenant y control por rol:</strong>{" "}
              Aplicamos políticas de seguridad a nivel de fila (
              <em>Row Level Security — RLS</em> en PostgreSQL) por negocio y por
              rol operativo, garantizando que cada cuenta acceda únicamente a
              sus propias sucursales, profesionales y citas.
            </li>
            <li>
              <strong>Plazos de conservación y bloqueo:</strong> Los datos se
              conservarán durante la vigencia de la cuenta o de la relación
              comercial y posteriormente pasarán a un periodo de bloqueo previo
              a su supresión definitiva conforme a:{" "}
              <PendingField>
                Plazo exacto en meses de bloqueo y supresión definitiva tras la
                cancelación de una cuenta de negocio
              </PendingField>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* 8. Cambios al Aviso de Privacidad */}
      <section id="actualizaciones" className={sectionClass}>
        <h2 className={headingClass}>8. Cambios al Aviso de Privacidad</h2>
        <div className={simpleBoxClass}>
          <strong>En simple:</strong> Si actualizamos este aviso, publicaremos
          la nueva versión en <code className="font-mono">/legal/privacidad</code>{" "}
          y avisaremos a los negocios registrados manteniendo trazabilidad de la
          versión aceptada.
        </div>
        <div className="space-y-3 text-sm sm:text-base">
          <p>
            El presente Aviso de Privacidad puede sufrir modificaciones, cambios
            o actualizaciones derivadas de nuevos requerimientos legales, de las
            propias necesidades de los servicios que ofrecemos en Agendur o de
            nuestras prácticas de privacidad.
          </p>
          <p>
            Cualquier modificación sustancial será publicada de forma permanente
            en la ruta pública{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
              /legal/privacidad
            </code>
            , llevando el control criptográfico y de versión en la bitácora{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
              consentimientos_usuario
            </code>{" "}
            (versión actual{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
              v1
            </code>
            ) y notificando por correo electrónico o mediante aviso destacado en
            el panel administrativo a los titulares registrados.
          </p>
        </div>
      </section>
    </LegalDraftShell>
  );
}
