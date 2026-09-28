import type { ReactNode } from "react";
import Link from "next/link";

export interface LegalSectionItem {
  id: string;
  label: string;
}

export function PendingField({ children }: { children: ReactNode }) {
  return (
    <span className="my-1 inline-flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-[#6E49A6]/50 bg-[#6E49A6]/10 px-2.5 py-1 text-xs font-medium text-[#4F327D] dark:border-[#8B67C4]/50 dark:bg-[#8B67C4]/15 dark:text-[#D1BEE8]">
      <strong className="font-mono text-[11px] uppercase tracking-wider text-[#6E49A6] dark:text-[#B99CE8]">
        Por completar:
      </strong>
      <span>{children}</span>
    </span>
  );
}

export function LegalDraftShell({
  title,
  subtitle,
  lastUpdated = "Versión Preliminar v1.0 · Septiembre 2026",
  activeDoc,
  sections = [],
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  activeDoc?: "terminos" | "privacidad";
  sections?: LegalSectionItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3EEDF] text-[#1D1720] selection:bg-[#6E49A6]/20 dark:bg-[#17121B] dark:text-[#F1ECE2]">
      <header className="sticky top-0 z-30 border-b border-[#D8D0BF] bg-[#F3EEDF]/90 backdrop-blur-md dark:border-[#332B3D] dark:bg-[#17121B]/90">
        <nav
          aria-label="Navegación legal"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6"
        >
          <Link
            href="/"
            className="brand-mark text-2xl text-[#1D1720] dark:text-[#F1ECE2]"
            aria-label="Agendur"
          >
            <span>A</span>gendur
          </Link>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium sm:text-sm">
            <Link
              href="/legal/terminos"
              className={`rounded-full px-3.5 py-1.5 transition-colors ${
                activeDoc === "terminos"
                  ? "bg-[#6E49A6] text-[#F3EEDF]"
                  : "text-[#1D1720]/80 hover:bg-[#1D1720]/5 dark:text-[#F1ECE2]/80 dark:hover:bg-white/5"
              }`}
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/legal/privacidad"
              className={`rounded-full px-3.5 py-1.5 transition-colors ${
                activeDoc === "privacidad"
                  ? "bg-[#6E49A6] text-[#F3EEDF]"
                  : "text-[#1D1720]/80 hover:bg-[#1D1720]/5 dark:text-[#F1ECE2]/80 dark:hover:bg-white/5"
              }`}
            >
              Aviso de Privacidad
            </Link>
            <span className="mx-1 hidden h-4 w-px bg-[#D8D0BF] sm:inline-block dark:bg-[#332B3D]" />
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-[#6B6355] transition-colors hover:bg-[#1D1720]/5 hover:text-[#1D1720] dark:text-[#A79FAE] dark:hover:bg-white/5 dark:hover:text-[#F1ECE2]"
            >
              Volver al inicio
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-[#D8D0BF] bg-[#EAE3D2]/60 dark:border-[#332B3D] dark:bg-[#1F1926]/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-widest text-[#6E49A6] dark:text-[#B99CE8]">
            Centro Legal Agendur · {lastUpdated}
          </p>
          <h1 className="mt-2 font-bricolage text-3xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base text-[#6B6355] dark:text-[#A79FAE]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>

      <div
        className={`mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 ${
          sections.length > 0
            ? "lg:grid lg:grid-cols-[250px_1fr] lg:gap-10"
            : ""
        }`}
      >
        {sections.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-[#D8D0BF] bg-[#FAF7F0] p-4 dark:border-[#332B3D] dark:bg-[#1F1926]">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#6B6355] dark:text-[#A79FAE]">
                Contenido
              </p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-md px-2 py-1.5 text-[#1D1720]/80 transition-colors hover:bg-[#6E49A6]/10 hover:text-[#6E49A6] dark:text-[#F1ECE2]/80 dark:hover:bg-[#8B67C4]/15 dark:hover:text-[#D1BEE8]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-[#D8D0BF] pt-3 text-[11px] leading-relaxed text-[#6B6355] dark:border-[#332B3D] dark:text-[#A79FAE]">
                Los campos con etiqueta{" "}
                <span className="font-mono font-semibold text-[#6E49A6] dark:text-[#B99CE8]">
                  Por completar:
                </span>{" "}
                corresponden a datos societarios y operativos en proceso de alta final.
              </div>
            </div>
          </aside>
        ) : null}

        <main className="rounded-2xl border border-[#D8D0BF] bg-[#FAF7F0] p-6 shadow-xs sm:p-10 dark:border-[#332B3D] dark:bg-[#1F1926]">
          <article className="space-y-10 leading-relaxed">{children}</article>
        </main>
      </div>

      <footer className="border-t border-[#D8D0BF] bg-[#EAE3D2]/40 dark:border-[#332B3D] dark:bg-[#1F1926]/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-[#6B6355] sm:px-6 dark:text-[#A79FAE]">
          <span>© 2026 Agendur · Todos los derechos reservados</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/legal/terminos" className="hover:underline">
              Términos y Condiciones
            </Link>
            <Link href="/legal/privacidad" className="hover:underline">
              Aviso de Privacidad
            </Link>
            <Link href="/" className="hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
