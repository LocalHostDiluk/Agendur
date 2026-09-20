"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useLandingLanguage } from "./LandingLanguageContext";

function LanguageSwitch({
  lang,
  setLang,
  inverted = false,
}: {
  lang: "es" | "en";
  setLang: (lang: "es" | "en") => void;
  inverted?: boolean;
}) {
  return (
    <div
      className={`language-switch font-mono text-xs ${
        inverted ? "border-paper/40" : "border-ink/30"
      }`}
      aria-label="Selector de idioma"
    >
      {(["es", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLang(item)}
          aria-label={
            item === "es"
              ? "Cambiar idioma a Español"
              : "Switch language to English"
          }
          aria-pressed={lang === item}
          className={`font-bold transition-colors cursor-pointer ${
            lang === item
              ? inverted
                ? "bg-paper text-ink"
                : "bg-ink text-paper"
              : inverted
                ? "text-paper/70 hover:text-paper hover:bg-paper/10"
                : "text-ink/70 hover:text-ink hover:bg-ink/10"
          }`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { lang, setLang, t } = useLandingLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    [t.nav.product, "#como-funciona"],
    [t.nav.pricing, "#precios"],
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
          {links.map(([label, href]) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
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
        <nav
          className="border-t-2 border-ink bg-paper px-5 py-5 sm:hidden"
          aria-label="Navegación móvil"
        >
          <div className="flex flex-col gap-4">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="font-semibold text-ink hover:text-flame transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={closeMenu}
              className="font-semibold text-ink hover:text-flame transition-colors"
            >
              {t.nav.login}
            </Link>
            <LanguageSwitch lang={lang} setLang={setLang} />
            <Link
              href="/register"
              onClick={closeMenu}
              className="ticket-button inline-flex items-center justify-center rounded-none bg-flame px-6 py-4 text-center font-semibold text-ink hover:bg-flame/90"
            >
              {t.nav.cta}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export const FloatingNavbarWithCta = Navbar;
