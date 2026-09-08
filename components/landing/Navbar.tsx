"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Menu, X, ArrowRight, Building2 } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Calendar className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Cita<span className="text-emerald-400">Sync</span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                PyMEs
              </span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a
              href="#caracteristicas"
              className="hover:text-emerald-400 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#sucursales"
              className="hover:text-emerald-400 transition-colors"
            >
              Multi-Sucursal
            </a>
            <a
              href="#agendador"
              className="hover:text-emerald-400 transition-colors"
            >
              Demostración
            </a>
            <a
              href="#precios"
              className="hover:text-emerald-400 transition-colors"
            >
              Precios
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Panel Negocio
            </Link>
            <Link
              href="/reserva/barber-shop"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-2"
            >
              Ver Portal Cliente
            </Link>
            <a
              href="#precios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 px-4 py-2 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              Registrar mi Negocio
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
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
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <a
            href="#caracteristicas"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-400 font-medium"
          >
            Funcionalidades
          </a>
          <a
            href="#sucursales"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-400 font-medium"
          >
            Multi-Sucursal
          </a>
          <a
            href="#agendador"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-400 font-medium"
          >
            Demostración
          </a>
          <a
            href="#precios"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-400 font-medium"
          >
            Precios
          </a>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-400 font-medium"
          >
            Panel Negocio
          </Link>
          <Link
            href="/reserva/barber-shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Portal Cliente
          </Link>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <a
              href="#precios"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-950 bg-emerald-400 font-semibold"
            >
              Registrar mi Negocio <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
