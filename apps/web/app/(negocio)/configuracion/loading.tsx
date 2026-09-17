import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";

export function ConfiguracionLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Cargando configuración"
    >
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administra los parámetros comerciales, políticas de reserva y
            suscripción de tu negocio.
          </p>
        </div>

        <SkeletonBlock className="h-[44px] w-36 rounded-lg shrink-0" />
      </div>

      {/* 3 Pestañas Superiores */}
      <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-alt min-h-[38px]">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonText className="w-24 h-3.5" />
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg min-h-[38px]">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonText className="w-28 h-3.5" />
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg min-h-[38px]">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonText className="w-28 h-3.5" />
        </div>
      </div>

      {/* Tarjetas de Formulario */}
      <div className="space-y-6">
        {/* Tarjeta 1: Portal Público */}
        <div className="bg-surface-alt border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonCircle className="w-4 h-4" />
              <SkeletonText className="w-36 h-3.5" />
            </div>
            <SkeletonBlock className="w-16 h-5 rounded-full" />
          </div>

          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>

        {/* Tarjeta 2: Formulario de Datos Comerciales */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div className="space-y-1 pb-4 border-b border-border">
            <SkeletonText className="w-44 h-5" />
            <SkeletonText className="w-72 h-3.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((field) => (
              <div key={field} className="space-y-2">
                <SkeletonText className="w-28 h-3.5" />
                <SkeletonBlock className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta 3: Políticas y Opciones */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1 pb-4 border-b border-border">
            <SkeletonText className="w-48 h-5" />
            <SkeletonText className="w-80 h-3.5" />
          </div>

          <div className="divide-y divide-border">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="space-y-1">
                  <SkeletonText className="w-40 h-4" />
                  <SkeletonText className="w-64 h-3" />
                </div>
                <SkeletonBlock className="h-6 w-11 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfiguracionLoading;
