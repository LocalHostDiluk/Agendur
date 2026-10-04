# Documentación de Implementación: OP-04 — Edición de Servicios en Interfaz

**Fecha:** 3 de octubre de 2026  
**Módulos Afectados:** Componentes UI (`ModalEditarServicio.tsx`), Vista (`/sucursales`), Hooks (`use-negocio-data.ts`), Pruebas Automatizadas y Documentación.  
**Estado:** Implementado y Validado

---

## 1. Contexto y Problema Resuelto

### 1.1. Diagnóstico Previo (OP-04)
- **Falta de edición en UI para servicios:** Aunque existía el Route Handler `PATCH /api/negocio/servicios` y el hook `useUpdateServicio`, la pantalla de `/sucursales` (pestaña "Servicios") únicamente permitía crear nuevos servicios mediante `ModalNuevoServicio` y alternar entre pausar y activar.
- **Imposibilidad de ajustar precios y tiempos:** El administrador del negocio no disponía de un formulario visual para corregir la duración en minutos, el tiempo de buffer post-servicio, el precio o la descripción de un servicio existente sin tener que eliminarlo o recrearlo.
- **Preservación de historial:** Se requería garantizar que los servicios editados mantuvieran su ID canónico y que la desactivación actuara como archivo lógico sin romper las citas previamente agendadas.

---

## 2. Resumen de lo Implementado y Modificado

```
Agender
├── apps/web/
│   ├── app/
│   │   ├── (negocio)/sucursales/page.tsx   [MODIFICADO - BOTÓN EDITAR SERVICIO EN DESKTOP/MOBILE]
│   │   └── api/negocio/servicios/route.ts  [VALIDADO Y EXISTENTE]
│   ├── components/negocio/
│   │   ├── ModalEditarServicio.tsx         [NUEVO - 123 LÍNEAS]
│   │   └── index.ts                        [MODIFICADO]
│   └── tests/
│       ├── servicios-api.test.ts           [VALIDADO - 20 TESTS]
│       └── sucursales-servicios.test.tsx   [VALIDADO - 7 TESTS]
└── docs/
    └── OP-04_EDICION_SERVICIOS_UI.md       [NUEVO]
```

---

## 3. Detalle de Arquitectura e Implementación

### 3.1. Componente `ModalEditarServicio.tsx` (123 líneas)
Implementado en `apps/web/components/negocio/ModalEditarServicio.tsx` respetando estrictamente el límite de 150 líneas:
- **Patrón de Renderizado y Ciclo de Vida:**
  - Emplea un subcomponente interno `EditarServicioDialog` montado con clave única `key={servicio.id}`.
  - Inicializa el estado local en `useState` directamente a partir de las propiedades del servicio, sin utilizar efectos secundarios con `setState`, eliminando advertencias de renders en cascada en React 19.
- **Campos del Formulario:**
  - `nombre`: Cadena de texto requerida (hasta 120 caracteres).
  - `descripcion`: Área de texto multilínea opcional.
  - `duracion`: Input numérico en minutos acompañado de botones de acceso rápido (presets: 15m, 30m, 45m, 60m, 90m, 120m).
  - `precio`: Input numérico formateado para moneda local (MXN), admitiendo servicios gratuitos (precio = 0).
  - `buffer`: Input numérico para minutos de margen de preparación post-atención (0 a 120 min).
  - `activo`: Checkbox para activar o pausar la disponibilidad pública en el catálogo.

### 3.2. Integración en `apps/web/app/(negocio)/sucursales/page.tsx`
- **Estado de Edición:**
  ```tsx
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  ```
- **Disparador en Tabla Desktop:**
  Se agregó el botón "Editar" con variante secundaria, icono `Pencil` y texto responsive:
  ```tsx
  <Button
    variant="secondary"
    size="sm"
    onClick={() => setEditingServicio(s)}
    aria-label={`Editar servicio ${s.nombre}`}
    className="h-8 px-2.5 text-xs"
  >
    <Pencil className="w-3.5 h-3.5" />
    <span className="hidden lg:inline">Editar</span>
  </Button>
  ```
- **Disparador en Tarjetas Mobile:**
  Se integró el botón de edición accesible dentro de la barra de acciones de cada tarjeta de servicio en pantallas pequeñas (`block sm:hidden`).
- **Montaje del Modal:**
  ```tsx
  <ModalEditarServicio
    isOpen={Boolean(editingServicio)}
    onClose={() => setEditingServicio(null)}
    servicio={editingServicio}
    onSuccess={() => refetchServicios()}
  />
  ```

### 3.3. Reactividad Inmediata en Caché (`setQueryData`) y Control HTTP
Para evitar retrasos en la actualización de la tabla:
- **Actualización Inmediata en Memoria:** El hook `useUpdateServicio` en [use-negocio-data.ts](file:///home/mario_lira/Documents/Universidad/Cuatrimestre_9/Desarrollo%20web%20integral/Agender/apps/web/lib/hooks/use-negocio-data.ts) ejecuta `queryClient.setQueryData(["negocio", "servicios"], ...)` en su `onSuccess`. La fila de la tabla refleja la nueva duración (ej. de 30m a 60m), precio y estado con latencia de 0 ms, antes de que concluya el cierre del modal.
- **Prevención de Caché Estática:**
  - Se configuró `export const dynamic = "force-dynamic"` en `/api/negocio/servicios`.
  - Se añadieron cabeceras `Cache-Control: no-store, no-cache, must-revalidate` en `apiSuccess`.
  - `apiFetch` aplica por defecto `cache: "no-store"`, garantizando que ninguna consulta devuelva datos desactualizados.

---

## 4. Validación y Criterio de Aceptación

1. **Persistencia Inmediata y Reactividad:** La edición de servicios impacta la base de datos vía `PATCH /api/negocio/servicios` y los cambios se reflejan inmediatamente en la interfaz en 0 ms sin necesidad de recargar la página completa.
2. **Archivo Lógico:** Al desactivar un servicio (`activo = false`), este deja de aparecer en el portal público de clientes para nuevas reservas, pero se mantiene en el panel del negocio con badge "PAUSADO" y se preserva intacto en las citas previas.
3. **Pruebas Automatizadas:**
   - `bun test tests/servicios-api.test.ts`: 20/20 pruebas pasando.
   - `bun test tests/sucursales-servicios.test.tsx`: 7/7 pruebas pasando.
4. **Calidad:** 0 errores en compilación TypeScript (`bunx tsc --noEmit`) y 0 errores en ESLint (`bun run lint`).
