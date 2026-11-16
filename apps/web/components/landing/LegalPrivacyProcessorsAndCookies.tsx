import {
  privacySectionClass,
  privacyHeadingClass,
  privacySimpleBoxClass,
  privacyCodeClass,
} from "./LegalPrivacyIntroAndRoles";

const SUBPROCESSORS = [
  {
    name: "Supabase",
    region: "EE. UU.",
    description:
      "Base de datos relacional PostgreSQL, autenticación de sesiones y sincronización Realtime de citas y disponibilidad.",
  },
  {
    name: "Stripe",
    region: "EE. UU.",
    description:
      "Procesamiento seguro de pagos, cobro recurrente de suscripciones y portal de facturación bajo estándar PCI-DSS.",
  },
  {
    name: "Cloudflare Turnstile",
    region: "Red global",
    description:
      "Protección contra bots, ataques de fuerza bruta y abuso automatizado en flujos de registro y formularios públicos.",
  },
  {
    name: "Sentry",
    region: "EE. UU.",
    description:
      "Monitoreo técnico de errores en tiempo de ejecución, trazabilidad de fallos y estabilidad de la aplicación.",
  },
];

export function LegalPrivacyProcessorsAndCookies() {
  return (
    <>
      {/* 4. Subprocesadores y Transferencias */}
      <section id="subprocesadores" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          4. Encargados, Subprocesadores y Transferencias Internacionales
        </h2>
        <div className={privacySimpleBoxClass}>
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
            {SUBPROCESSORS.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-[#D8D0BF] bg-[#F3EEDF]/60 p-4 dark:border-[#332B3D] dark:bg-[#17121B]/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="font-bricolage text-base">{item.name}</strong>
                  <span className="rounded-full bg-[#6E49A6]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#6E49A6] dark:text-[#D1BEE8]">
                    {item.region}
                  </span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B6355] dark:text-[#A79FAE]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Uso de Cookies y localStorage */}
      <section id="cookies-y-storage" className={privacySectionClass}>
        <h2 className={privacyHeadingClass}>
          5. Uso de Cookies y Almacenamiento Local (<code>localStorage</code>)
        </h2>
        <div className={privacySimpleBoxClass}>
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
                <code className={privacyCodeClass}>localStorage</code>:
              </strong>{" "}
              Almacenamos localmente únicamente preferencias de interfaz para
              evitar reconfiguraciones en cada visita:{" "}
              <code className={privacyCodeClass}>agendur-theme</code>{" "}
              (preferencia de modo claro u oscuro),{" "}
              <code className={privacyCodeClass}>agendur_lang</code> (idioma de
              la interfaz),{" "}
              <code className={privacyCodeClass}>
                agendur_selected_sucursal_id
              </code>{" "}
              (sucursal activa seleccionada en el dashboard) y{" "}
              <code className={privacyCodeClass}>
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
    </>
  );
}
