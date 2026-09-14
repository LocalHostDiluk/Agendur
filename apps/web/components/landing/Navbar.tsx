"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLandingLanguage } from "./LandingLanguageContext";
import { Menu, X, Ticket } from "lucide-react";

export function Navbar() {
  const { lang, setLang, t } = useLandingLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-ink border-b border-paper/15 text-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Agendur */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-hidden"
          >
            <div className="w-8 h-8 bg-flame flex items-center justify-center ticket-notch-tr text-paper font-mono font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              <Ticket className="w-4.5 h-4.5 text-paper" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-bricolage font-bold text-xl sm:text-2xl tracking-tight text-paper">
                Agendur
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#diferenciadores"
              className="text-paper/80 hover:text-paper transition-colors"
            >
              {t.nav.product}
            </a>
            <a
              href="#precios"
              className="text-paper/80 hover:text-paper transition-colors"
            >
              {t.nav.pricing}
            </a>
            <a
              href="#como-funciona"
              className="text-paper/80 hover:text-paper transition-colors"
            >
              {t.nav.forBusiness}
            </a>
            <a
              href="#faq"
              className="text-paper/80 hover:text-paper transition-colors"
            >
              {t.nav.contact}
            </a>
          </nav>

          {/* Right Actions: Language Selector & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector ES/EN */}
            <div className="flex items-center border border-paper/20 rounded-none bg-paper/5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={`px-2.5 py-1 transition-colors ${
                  lang === "es"
                    ? "bg-grape text-paper font-bold"
                    : "text-paper/60 hover:text-paper"
                }`}
                aria-label="Cambiar idioma a Español"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 transition-colors ${
                  lang === "en"
                    ? "bg-grape text-paper font-bold"
                    : "text-paper/60 hover:text-paper"
                }`}
                aria-label="Switch language to English"
              >
                EN
              </button>
            </div>

            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-paper/80 hover:text-paper transition-colors px-2 py-1"
            >
              {t.nav.login}
            </Link>

            {/* CTA Ticket Button */}
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center px-4 py-2.5 bg-flame text-paper font-medium text-sm ticket-notch-tr hover:bg-flame/90 active:scale-[0.98] transition-all focus:outline-hidden focus:ring-2 focus:ring-flame focus:ring-offset-2 focus:ring-offset-ink"
            >
              {t.nav.cta}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Lang Selector */}
            <div className="flex items-center border border-paper/20 bg-paper/5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={`px-2 py-0.5 ${
                  lang === "es"
                    ? "bg-grape text-paper font-bold"
                    : "text-paper/60"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 ${
                  lang === "en"
                    ? "bg-grape text-paper font-bold"
                    : "text-paper/60"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-paper hover:text-flame transition-colors focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink border-b border-paper/20 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <a
              href="#diferenciadores"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-paper/80 hover:text-paper"
            >
              {t.nav.product}
            </a>
            <a
              href="#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-paper/80 hover:text-paper"
            >
              {t.nav.pricing}
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-paper/80 hover:text-paper"
            >
              {t.nav.forBusiness}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-paper/80 hover:text-paper"
            >
              {t.nav.contact}
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-paper/80 hover:text-paper"
            >
              {t.nav.login}
            </Link>
          </nav>

          <div className="pt-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-flame text-paper font-medium text-sm ticket-notch-tr"
            >
              {t.nav.cta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const FloatingNavbarWithCta = Navbar;
