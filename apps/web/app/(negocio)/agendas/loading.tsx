import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";

const DIAS = [
  { nombre: "LUN", dia: 15 },
  { nombre: "MAR", dia: 16 },
  { nombre: "MIÉ", dia: 17 },
  { nombre: "JUE", dia: 18 },
  { nombre: "VIE", dia: 19 },
  { nombre: "SÁB", dia: 20 },
  { nombre: "DOM", dia: 21 },
];

export function AgendasLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Cargando agendas y calendario"
    >
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Calendario & Agendas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza y administra las citas programadas por sucursal, fecha y
            horario.
          </p>
        </div>

        <SkeletonBlock className="h-[44px] w-44 rounded-xl shrink-0" />
      </div>

      {/* Barra de Control: Fecha, Alternador de Vista y Filtros */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <div className="flex items-center gap-2 flex-wrap">
            <SkeletonBlock className="h-[36px] w-14 rounded-lg" />
            <SkeletonBlock className="h-[36px] w-16 rounded-lg" />
            <SkeletonBlock className="h-[36px] w-36 rounded-lg" />
            <SkeletonText className="h-4 w-48 ml-2" />
          </div>

          {/* Alternador de Vista y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            <SkeletonBlock className="h-[36px] w-52 rounded-xl" />
            <SkeletonBlock className="h-[36px] w-40 rounded-xl" />
            <SkeletonBlock className="h-[36px] w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cuadrícula de Calendario: 7 columnas con números visibles y dots de disponibilidad en .skel-circle de 4px */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <SkeletonText className="w-32 h-4" />
          <SkeletonText className="w-14 h-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DIAS.map((item) => (
            <div
              key={item.nombre}
              className="rounded-2xl border border-border bg-surface flex flex-col min-h-[320px]"
            >
              {/* Encabezado del Día */}
              <div className="p-3 border-b border-border text-center rounded-t-2xl bg-surface-alt/70">
                <span className="text-[11px] font-mono font-semibold text-text-secondary block">
                  {item.nombre}
                </span>
                {/* Número visible y normal según especificación */}
                <span className="text-lg font-bricolage font-bold text-text-primary">
                  {item.dia}
                </span>

                {/* Dot de disponibilidad en .skel-circle de 4px (1rem/4 = 4px = w-1 h-1) */}
                <div className="flex justify-center items-center h-2 mt-1">
                  <SkeletonCircle className="w-1 h-1" />
                </div>
              </div>

              {/* Lista de citas en skeleton */}
              <div className="p-2 space-y-2 flex-1">
                <SkeletonBlock className="h-16 w-full rounded-xl" />
                <SkeletonBlock className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgendasLoading;
