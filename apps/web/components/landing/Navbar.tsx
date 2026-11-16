"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useLandingLanguage } from "./LandingLanguageContext";
import { LanguageSwitch, NavbarMobileDrawer } from "./NavbarMobileDrawer";

export function Navbar() {
  const { lang, setLang, t } = useLandingLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    [t.nav.product, "#como-funciona"],
    [t.nav.pricing, "#precios"],
    [t.nav.benefits, "/beneficios"],
    [t.nav.forBusiness, "#diferenciadores"],
    [t.nav.contact, "#contacto"],
  ] as const;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper text-ink">
      <div className="page-shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="brand-mark" aria-label="Agendur">
          <span>A</span>gendur
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Navegación principal"
        >
          {links.map(([label, href]) =>
            href.startsWith("/") ? (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            ) : (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <LanguageSwitch lang={lang} setLang={setLang} />
          <Link href="/login" className="nav-link">
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="ticket-button inline-flex items-center justify-center rounded-none bg-flame px-6 py-4 text-sm font-semibold text-ink hover:bg-flame/90"
          >
            {t.nav.cta}
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:hidden">
          <LanguageSwitch lang={lang} setLang={setLang} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex size-9 items-center justify-center rounded-none text-ink hover:bg-ink/5 focus-visible:outline-3 focus-visible:outline-flame"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <NavbarMobileDrawer
          links={links}
          lang={lang}
          setLang={setLang}
          loginLabel={t.nav.login}
          ctaLabel={t.nav.cta}
          onClose={closeMenu}
        />
      )}
    </header>
  );
}

export const FloatingNavbarWithCta = Navbar;
