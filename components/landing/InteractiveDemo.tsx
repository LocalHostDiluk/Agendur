"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Store,
  CheckCircle2,
  MessageSquare,
  CreditCard,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  staffCount: number;
  active: boolean;
}

export function InteractiveDemo() {
  const [businessType, setBusinessType] = useState("Barbería & Peluquería");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [depositEnabled, setDepositEnabled] = useState(true);

  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "1",
      name: "Sucursal Central - Polanco",
      address: "Av. Horacio 450, CDMX",
      staffCount: 6,
      active: true,
    },
    {
      id: "2",
      name: "Sucursal Roma Norte",
      address: "Colima 180, CDMX",
      staffCount: 4,
      active: true,
    },
    {
      id: "3",
      name: "Sucursal Guadalajara",
      address: "Av. Vallarta 1200, GDL",
      staffCount: 5,
      active: false,
    },
  ]);

  const toggleBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const activeBranches = branches.filter((b) => b.active);
  const totalStaff = activeBranches.reduce((acc, b) => acc + b.staffCount, 0);

  return (
    <section
      id="sucursales"
      className="py-20 bg-slate-900/50 relative border-y border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Panel de Control Multi-Sucursal
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Prueba lo fácil que es administrar múltiples sucursales en CitaSync.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Activa o desactiva sucursales, selecciona el giro de tu empresa y
            configura reglas de reserva automáticas en tiempo real.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left: Business Configuration */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tipo de Negocio / Industria:
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Barbería & Peluquería">
                    Barbería & Peluquería
                  </option>
                  <option value="Clínica Médica / Dental">
                    Clínica Médica / Dental
                  </option>
                  <option value="Spa, Estética & Uñas">
                    Spa, Estética & Uñas
                  </option>
                  <option value="Centro de Fisioterapia & Fitness">
                    Centro de Fisioterapia & Fitness
                  </option>
                  <option value="Consultoría & Asesoría Legal">
                    Consultoría & Asesoría Legal
                  </option>
                  <option value="Taller Automotriz">Taller Automotriz</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sucursales de tu empresa ({branches.length}):
                  </label>
                  <button
                    onClick={() =>
                      alert("Puedes agregar ilimitadas sucursales en tu panel.")
                    }
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Sucursal
                  </button>
                </div>

                <div className="space-y-2.5">
                  {branches.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => toggleBranch(b.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        b.active
                          ? "bg-slate-900 border-emerald-500/60 shadow-md"
                          : "bg-slate-950/40 border-slate-800/80 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                            b.active
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                              : "bg-slate-800 border-slate-700 text-slate-500"
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-semibold ${b.active ? "text-white" : "text-slate-400"}`}
                          >
                            {b.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {b.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                          {b.staffCount} Especialistas
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.active
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {b.active ? "ACTIVA" : "INACTIVA"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Recordatorios por WhatsApp Automáticos</span>
                  </div>
                  <button
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      whatsappEnabled ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        whatsappEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span>Cobro de Anticipo obligatorio (50%)</span>
                  </div>
                  <button
                    onClick={() => setDepositEnabled(!depositEnabled)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      depositEnabled ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        depositEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Summary Panel */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">
                  RESUMEN DE OPERACIÓN
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Giro comercial:</span>
                  <span className="font-semibold text-white truncate max-w-[140px] text-right">
                    {businessType}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sucursales activas:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeBranches.length} de {branches.length}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Personal / Agentes:</span>
                  <span className="font-mono text-slate-200">
                    {totalStaff} Profesionales
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Alertas WhatsApp:</span>
                  <span
                    className={
                      whatsappEnabled
                        ? "text-emerald-400 font-semibold"
                        : "text-slate-500"
                    }
                  >
                    {whatsappEnabled ? "ACTIVADO" : "DESACTIVADO"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cobro Anticipo:</span>
                  <span
                    className={
                      depositEnabled
                        ? "text-purple-400 font-semibold"
                        : "text-slate-500"
                    }
                  >
                    {depositEnabled ? "50% Stripe/MercadoPago" : "LIBRE"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
                  Enlace Público Generado:
                </p>
                <p className="font-mono text-emerald-400 truncate">
                  citasync.com/reserva/tu-empresa
                </p>
              </div>

              <a
                href="/dashboard"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] inline-block text-center"
              >
                Crear Mi Plataforma Gratis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
