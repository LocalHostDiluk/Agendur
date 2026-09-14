"use client";

import React from "react";
import Link from "next/link";
import { useLandingLanguage } from "./LandingLanguageContext";
import { Ticket } from "lucide-react";

export function Footer() {
  const { lang, setLang, t } = useLandingLanguage();

  return (
    <footer className="bg-ink text-paper pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-14 border-b border-paper/15">
          {/* Columna de Marca (Agendur) */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-flame flex items-center justify-center ticket-notch-tr text-paper font-mono font-bold text-sm">
                <Ticket className="w-4.5 h-4.5 text-paper" strokeWidth={2} />
              </div>
              <span className="font-bricolage font-bold text-2xl tracking-tight text-paper">
                Agendur
              </span>
            </Link>
            <p className="text-mist text-xs sm:text-sm max-w-sm leading-relaxed">
              {t.footer.tagline}
            </p>

            {/* Selector de idioma en Footer */}
            <div className="pt-2 flex items-center gap-2 text-xs font-mono">
              <span className="text-mist">{t.footer.langLabel}</span>
              <div className="flex items-center border border-paper/20 bg-paper/5">
                <button
                  type="button"
                  onClick={() => setLang("es")}
                  className={`px-2 py-0.5 transition-colors ${
                    lang === "es"
                      ? "bg-grape text-paper font-bold"
                      : "text-paper/60 hover:text-paper"
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 transition-colors ${
                    lang === "en"
                      ? "bg-grape text-paper font-bold"
                      : "text-paper/60 hover:text-paper"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Columna 1: Producto */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="font-bricolage font-semibold text-sm text-paper">
              {t.footer.columns.product.title}
            </h4>
            <ul className="space-y-2 text-xs text-mist">
              {t.footer.columns.product.links.map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#diferenciadores"
                    className="hover:text-paper transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2: Industrias */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="font-bricolage font-semibold text-sm text-paper">
              {t.footer.columns.industries.title}
            </h4>
            <ul className="space-y-2 text-xs text-mist">
              {t.footer.columns.industries.links.map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#como-funciona"
                    className="hover:text-paper transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Empresa */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="font-bricolage font-semibold text-sm text-paper">
              {t.footer.columns.company.title}
            </h4>
            <ul className="space-y-2 text-xs text-mist">
              {t.footer.columns.company.links.map((link, idx) => (
                <li key={idx}>
                  <span className="cursor-default hover:text-paper transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Legal */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="font-bricolage font-semibold text-sm text-paper">
              {t.footer.columns.legal.title}
            </h4>
            <ul className="space-y-2 text-xs text-mist">
              <li>
                <Link
                  href="/privacidad"
                  className="hover:text-paper transition-colors"
                >
                  {t.footer.columns.legal.links[0]}
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-paper transition-colors"
                >
                  {t.footer.columns.legal.links[1]}
                </Link>
              </li>
              <li>
                <span className="cursor-default hover:text-paper transition-colors">
                  {t.footer.columns.legal.links[2]}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright y marca de agua inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-mist">
          <span>{t.footer.copyright}</span>
          <span className="text-paper/40">
            TICKET SYSTEM DESIGN · RISOGRAPH PRINT SPEC
          </span>
        </div>
      </div>
    </footer>
  );
}
