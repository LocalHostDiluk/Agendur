import Link from "next/link";
import { Calendar, Globe, Share2, MessageSquare, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 text-xs sm:text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col (2 cols) */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="CitaSync Inicio"
            >
              <div className="size-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-xs">
                <Calendar className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Cita
                <span className="text-blue-600 dark:text-blue-500">Sync</span>
              </span>
            </Link>

            <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed max-w-sm">
              Plataforma integral de agendamiento online, gestión multi-sucursal
              y cobro de anticipos para negocios y prestadores de servicios en
              Latinoamérica.
            </p>

            {/* Social & Theme Controls */}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <a
                href="https://citasync.com"
                className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 transition-colors"
                aria-label="Sitio Web Global"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 transition-colors"
                aria-label="Comunidad y Novedades"
              >
                <Share2 className="size-4" />
              </a>
              <a
                href="https://wa.me"
                className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 transition-colors"
                aria-label="Soporte WhatsApp"
              >
                <MessageSquare className="size-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Producto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Producto
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#caracteristicas"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Multi-Sucursal
                </a>
              </li>
              <li>
                <a
                  href="#caracteristicas"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Cobro de Anticipos
                </a>
              </li>
              <li>
                <a
                  href="#caracteristicas"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Recordatorios WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="#impacto"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Calculadora de Impacto
                </a>
              </li>
              <li>
                <a
                  href="#precios"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Planes & Tarifas
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Soluciones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Sectores
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Barberías y Salones
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Clínicas y Consultorios
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Spas y Masajes
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Estudios de Tatuajes
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Centros de Fisioterapia
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Empresa & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Legal & Soporte
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Acceso al Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Registrar Negocio
                </Link>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Política de Privacidad
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  Términos del Servicio
                </span>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-neutral-500 gap-4">
          <p>
            © {currentYear} CitaSync Technologies Inc. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Hecho con{" "}
            <Heart className="size-3.5 text-red-500 fill-red-500 inline-block" />{" "}
            para potenciar a las PyMEs en Latinoamérica.
          </p>
        </div>
      </div>
    </footer>
  );
}
