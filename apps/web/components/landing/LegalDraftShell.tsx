import type { ReactNode } from "react";
import Link from "next/link";

export function LegalDraftShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-neutral-800">
        <nav aria-label="Navegación legal" className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-5 text-sm sm:px-6">
          <Link href="/" className="font-bold text-blue-700 hover:underline dark:text-blue-400">Agendur</Link>
          <Link href="/terminos" className="hover:underline">Términos</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <div role="status" className="rounded-lg border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <strong className="block text-base">BORRADOR — NO VIGENTE</strong>
          <p className="mt-1">Este texto está en revisión. No es una versión aprobada para aceptación, contratación o registro.</p>
        </div>
        <article className="space-y-7 leading-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {children}
        </article>
      </main>
      <footer className="border-t border-slate-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-between gap-3 px-4 py-6 text-sm text-slate-600 dark:text-slate-400 sm:px-6">
          <span>© Agendur · Documento no vigente</span>
          <Link href="/" className="hover:underline">Volver al inicio</Link>
        </div>
      </footer>
    </div>
  );
}
