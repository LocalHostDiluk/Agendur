import { Calendar, Globe, Share2, MessageSquare, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
                <Calendar className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Cita<span className="text-emerald-400">Sync</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              La plataforma SaaS especializada en la gestión de citas,
              reservaciones y sucursales online para PyMEs en Latinoamérica.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a
                href="#"
                className="hover:text-white transition-colors"
                aria-label="Sitio Web"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                aria-label="Comunidad"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                aria-label="Compartir"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Industriales */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Industrias
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Barberías y Peluquerías
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Clínicas Médicas & Dentales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Spas y Centros de Estética
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gimnasios y Fisioterapia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Talleres Automotrices
                </a>
              </li>
            </ul>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Funcionalidades
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#sucursales"
                  className="hover:text-white transition-colors"
                >
                  Gestión Multi-Sucursal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Recordatorios por WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cobro de Anticipos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sincronización de Calendarios
                </a>
              </li>
              <li>
                <a
                  href="#precios"
                  className="hover:text-white transition-colors"
                >
                  Planes y Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Legal & Soporte
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacidad de Datos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Seguridad de la Información
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contacto de Ventas
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} CitaSync SaaS Inc. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1">
            Creado con{" "}
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />{" "}
            para hacer crecer tu negocio.
          </p>
        </div>
      </div>
    </footer>
  );
}
