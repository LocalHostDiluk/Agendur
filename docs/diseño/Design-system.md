# Sistema de Diseño — Agendur Dashboard

### Guía completa para agentes de IA (Claude Code, Codex, Antigravity, etc.)

Este documento es la fuente de verdad para construir el dashboard de Agendur. Sigue cada regla al pie de la letra. Donde haya un valor exacto (color, espaciado, tiempo de animación), úsalo tal cual — no lo aproximes.

---

## 0. Contexto y relación con la landing page

El dashboard es la herramienta de trabajo diaria de dueños de negocio (clínicas, barberías, spas, nutriólogos). Se usa horas al día, no segundos como la landing. Por eso:

- **La esencia de marca se mantiene, pero se dosifica.** El motivo "ticket de turno / perforado / riso" que domina la landing aquí aparece **solo en puntos de marca muy específicos** (ver sección 5.6), nunca en componentes funcionales de uso repetido (botones, inputs, filas de tabla, cards de datos). La regla de oro: _si el usuario lo va a ver 50 veces al día, es funcional y sobrio; si lo ve una vez al entrar o en un momento especial, puede llevar personalidad._
- **Prioridad: eficiencia y claridad sobre expresividad.** Sigue siendo un SaaS para empresas — la consistencia es más importante que la sorpresa.
- El sidebar oscuro (`--sidebar-bg`) es el único elemento que se mantiene fijo e idéntico en modo claro y oscuro — es el ancla visual de marca en todo momento.

---

## 1. Stack técnico

> **Corrección importante:** la versión anterior de este documento asumía shadcn/ui por error. El proyecto real está construido sobre **Preline UI**. Toda referencia a shadcn/ui en este documento queda anulada por esta sección.

| Capa             | Elección                                                                                            | Notas                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Framework        | Next.js (App Router) + TypeScript                                                                   |                                                                                                                                      |
| Estilos          | Tailwind CSS + variables CSS para todos los tokens                                                  | Nunca hardcodear hex en componentes, siempre `var(--token)` o clase Tailwind mapeada al token                                        |
| Componentes base | **Preline UI**                                                                                      | Sistema Tailwind + plugins JS (no son componentes React ni usan Radix). Ver 1.1 para inicializarlo bien en Next.js                   |
| Iconos           | `lucide-react`                                                                                      | Stroke width 1.75px en toda la app, tamaños 16/20/24px únicamente                                                                    |
| Tablas de datos  | `@tanstack/react-table`, pintada con clases/tokens de Preline                                       | Ver 1.3 — no usar DataTables.net                                                                                                     |
| Gráficas         | Recharts                                                                                            | Ver sección 6                                                                                                                        |
| Animación        | Sistema de 3 capas — ver 1.2                                                                        | Preline (estructural) + Framer Motion (nuestros tokens, sección 7) + Magic UI / React Bits (solo login/registro y momentos de marca) |
| Modo oscuro      | `next-themes`, estrategia `class` en `<html>`                                                       |                                                                                                                                      |
| Fuentes          | Bricolage Grotesque (títulos) · Inter (UI/cuerpo) · Space Mono (cifras KPI y elementos tipo ticket) |                                                                                                                                      |

### 1.1 Cómo inicializar Preline UI en Next.js (App Router)

Preline UI no es una librería de componentes React: es un sistema Tailwind que lee el DOM ya renderizado y le añade comportamiento (dropdowns, modales, tabs, acordeones). Por eso debe inicializarse desde un componente cliente y **volver a escanear el DOM cada vez que cambia la ruta**, porque el App Router navega sin recargar la página:

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PrelineScript() {
  const pathname = usePathname();
  useEffect(() => {
    import("preline/preline").then(() => {
      window.HSStaticMethods.autoInit();
    });
  }, [pathname]);
  return null;
}
```

Monta este componente una sola vez en el `layout.tsx` raíz. Todo comportamiento de abrir/cerrar (dropdown de usuario, acciones de fila, selector de sucursal, modales, tabs, acordeón de FAQ/Configuración, tooltips) se resuelve con los plugins nativos de Preline — no construyas uno propio si Preline ya lo cubre.

### 1.2 Sistema de animación en 3 capas — tabla de decisión obligatoria

Con tres fuentes de animación conviviendo, el riesgo es mezclarlas sin criterio y que la interfaz se sienta inconsistente. Esta tabla es la única fuente de decisión:

| Capa                               | Para qué sirve                                                                                                                        | Dónde se usa en Agendur                                                                                                                                                                                                                 | Instalación                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preline UI**                     | Comportamiento estructural (abrir/cerrar, mostrar/ocultar)                                                                            | Todo el dashboard interior: dropdowns, modales, tabs, acordeones, tooltips                                                                                                                                                              | Ya está en el proyecto                                                                                                                              |
| **Framer Motion** (`motion/react`) | Nuestras animaciones orquestadas propias (sección 7): stagger de KPI cards, count-up, transición de drawers/modales, skeleton shimmer | Todo el dashboard interior, siempre con los tokens de 7.1                                                                                                                                                                               | `npm i motion`                                                                                                                                      |
| **Magic UI**                       | Componentes decorativos de marca para momentos puntuales                                                                              | **Solo** en login/registro (Bento Grid, Number Ticker, Marquee, Animated List, Blur Fade — sección 12) y en los momentos de marca ya autorizados: Confetti al completar el registro, Shimmer/Border Beam en la tarjeta de upgrade (5.6) | `pnpm dlx shadcn@latest add @magicui/<componente>` — el comando usa el CLI de shadcn solo para copiar el archivo; no instala shadcn/ui como sistema |
| **React Bits**                     | Efectos de texto/fondo muy expresivos — la capa más "cara" visualmente                                                                | **Solo** en login/registro, nunca dentro del dashboard interior                                                                                                                                                                         | `npx shadcn@latest add @react-bits/<Componente>-TS-TW` (variante TypeScript + Tailwind)                                                             |

**Regla de oro:** si el componente se ve todos los días dentro del dashboard, su animación viene de Preline o de nuestros tokens de Framer Motion — nunca de Magic UI o React Bits. Esas dos quedan para el "vestíbulo" del producto (login, registro, estados vacíos, celebración), donde una impresión más expresiva sí vale la pena.

### 1.3 Tablas y calendario — nota técnica

- **Tablas:** usar `@tanstack/react-table` (headless) pintado 100% con los tokens de la sección 5.5. Preline sugiere DataTables.net como dependencia opcional — no lo uses, asume jQuery y no encaja con el modelo de render de React.
- **Calendario (módulo Agenda):** usar una librería de calendario para React (ej. FullCalendar React) estilizada con los tokens de este documento — no el `vanilla-calendar-pro` que Preline sugiere por defecto, que es un selector de fecha simple, no una vista de agenda con citas/sucursales/staff. `vanilla-calendar-pro` sí es válido para date pickers simples dentro de formularios (ej. filtro de fechas en Reportes).

---

## 2. Paleta de color

### 2.1 Filosofía

Colores de marca (`grape`, `flame`) se usan como **acento decorativo**, nunca como color semántico de estado. Para estados (éxito/alerta/error) existen tokens separados — así nunca hay ambigüedad entre "esto es mi marca" y "esto necesita tu atención".

### 2.2 Modo claro (default)

```css
--background: #f7f5ef; /* canvas general */
--surface: #ffffff; /* cards, tablas, inputs, modales */
--surface-alt: #f0ece0; /* filas alternas de tabla, hover sutil */
--border: #e7e1d3;
--text-primary: #211a26;
--text-secondary: #6b6355;
--text-muted: #a39c8c;

--sidebar-bg: #1d1720; /* fijo, igual en claro y oscuro */
--sidebar-text: #ede7dd;
--sidebar-text-muted: #948c7e;

--grape: #6e49a6; /* acento de marca / acción primaria */
--grape-soft: rgba(110, 73, 166, 0.12);
--flame: #ff5a36; /* acento de marca decorativo — NUNCA semántico */

--success: #3f9e76;
--success-soft: rgba(63, 158, 118, 0.12);
--warning: #e8a23d;
--warning-soft: rgba(232, 162, 61, 0.12);
--danger: #d14343;
--danger-soft: rgba(209, 67, 67, 0.12);
```

### 2.3 Modo oscuro

```css
--background: #17121b;
--surface: #1f1926;
--surface-alt: #241d2c;
--border: #332b3d;
--text-primary: #f1ece2;
--text-secondary: #a79fae;
--text-muted: #766e82;

--sidebar-bg: #1d1720; /* idéntico al modo claro, es el ancla */
--sidebar-text: #ede7dd;
--sidebar-text-muted: #948c7e;

--grape: #8b67c4;
--grape-soft: rgba(139, 103, 196, 0.18);
--flame: #ff7a57;

--success: #5cc498;
--success-soft: rgba(92, 196, 152, 0.16);
--warning: #f0b65e;
--warning-soft: rgba(240, 182, 94, 0.16);
--danger: #e9696b;
--danger-soft: rgba(233, 105, 107, 0.16);
```

### 2.4 Reglas de uso obligatorias

1. `--flame` solo aparece en: el logo, la ilustración de un estado vacío, una tarjeta de upgrade/promo, o el badge de "nueva funcionalidad". **Nunca** en un botón destructivo, badge de estado o KPI negativo.
2. Un badge de estado (confirmada/pendiente/cancelada) **siempre** combina un color semántico + texto + ícono pequeño — nunca solo un punto de color.
3. `--grape` es el único color de acción interactiva (links, botón primario, checkbox marcado, radio seleccionado, foco).
4. Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande/iconos) en ambos modos — verificar cada combinación antes de usarla.

---

## 3. Tipografía

| Uso                              | Fuente                | Tamaño / interlineado | Peso                                      |
| -------------------------------- | --------------------- | --------------------- | ----------------------------------------- |
| Título de página (H1)            | Bricolage Grotesque   | 28px / 1.2            | 600                                       |
| Título de sección (H2)           | Bricolage Grotesque   | 20px / 1.3            | 600                                       |
| Título de card (H3)              | Inter                 | 16px / 1.4            | 600                                       |
| Cuerpo                           | Inter                 | 14px / 1.5            | 400                                       |
| Texto secundario / ayuda         | Inter                 | 13px / 1.4            | 400                                       |
| Etiqueta de campo / label        | Inter                 | 12px / 1.4            | 500                                       |
| **Cifra de KPI (número grande)** | **Space Mono**        | 32px / 1.1            | 700, `font-variant-numeric: tabular-nums` |
| Números dentro de tablas         | Inter, `tabular-nums` | 14px                  | 500                                       |

**Por qué Space Mono en los KPI:** no es decoración — conecta directamente con el motivo de "contador de ticket" de la landing (el número que avanza) y, funcionalmente, el ancho fijo de sus caracteres alinea perfectamente las cifras en columnas. Es el único lugar del dashboard donde la marca y la función coinciden — por eso es el detalle de marca más importante de toda la interfaz.

**Prohibido:** etiquetas en mayúsculas sostenidas con tracking exagerado. Usa sentence case (`Citas de hoy`, no `CITAS DE HOY`).

---

## 4. Espaciado, grid y radios

### 4.1 Escala de espaciado (base 4px)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px — usar solo estos valores, nunca números intermedios arbitrarios.

### 4.2 Layout

- Sidebar expandido: **264px** · Sidebar colapsado (solo iconos): **72px**
- Topbar: **64px** de alto, fijo (`sticky top-0`)
- Padding de contenido: 24px (mobile/tablet) · 32px (desktop ≥1440px)
- Grid de contenido: 12 columnas, gap 24px

### 4.3 Breakpoints

| Nombre  | Rango           |
| ------- | --------------- |
| mobile  | < 640px         |
| tablet  | 640px – 1023px  |
| desktop | 1024px – 1439px |
| wide    | ≥ 1440px        |

### 4.4 Radios de esquina — regla estricta

| Token         | Valor | Uso                                         |
| ------------- | ----- | ------------------------------------------- |
| `--radius-sm` | 6px   | inputs, botones pequeños, badges            |
| `--radius-md` | 10px  | botones default, cards, filas seleccionadas |
| `--radius-lg` | 16px  | modales, paneles grandes, drawer            |

**Nunca mezcles radios distintos dentro del mismo tipo de componente.** Todos los botones "default" usan `--radius-md`, sin excepción. El motivo "muesca de ticket" (ver 5.6) es la única excepción autorizada a esta regla, y solo en los 4 lugares listados ahí.

---

## 5. Componentes base

### 5.1 Sidebar

- Fondo `--sidebar-bg` fijo (no cambia con el tema).
- Logo + nombre arriba (32px alto). Debajo, selector de sucursal (dropdown, relevante para negocios multi-sucursal) si el usuario tiene más de una.
- Ítems de navegación: ícono (20px) + label. Estado activo: fondo `--grape-soft`, barra izquierda de 3px sólida `--grape`, texto en `--sidebar-text` (no cambia de color, solo el fondo/barra lo indican).
- Estado hover (inactivo): fondo `rgba(255,255,255,0.04)`.
- Footer del sidebar: avatar + nombre de usuario + botón de logout, separado por `--border` a 10% opacidad sobre `--sidebar-bg`.
- Botón de colapsar/expandir al final, ícono `PanelLeftClose`/`PanelLeftOpen` de lucide.

**Orden de navegación (7 módulos confirmados):**

1. Inicio
2. Calendario
3. Servicios y sucursales
4. Personal
5. Pagos y facturación
6. Reportes
7. Configuración

### 5.2 Topbar

- Altura 64px, fondo `--surface`, borde inferior `--border`.
- Izquierda: breadcrumb o título de la página actual.
- Derecha, en este orden: buscador (ícono lupa, expande a input al click), selector de sucursal (si no está en el sidebar), toggle claro/oscuro, campana de notificaciones (badge `--flame` solo si hay notificaciones sin leer — es uno de los 4 usos autorizados de flame), menú de usuario.

### 5.3 KPI Cards

Anatomía: label pequeño (`text-secondary`, 12px) → cifra grande (Space Mono, 32px, tabular-nums) → indicador de tendencia (ícono flecha + porcentaje, color `--success` si sube y es positivo para el negocio, `--danger` si baja y es negativo — nunca `--flame`).

**Jerarquía obligatoria:** en una fila de 4 KPI cards, la primera (la métrica más importante de esa vista, ej. "Citas de hoy") debe tener un tratamiento ligeramente distinto — puede ocupar 1.5x el ancho de las otras tres, o llevar un fondo `--grape-soft` sutil mientras las demás usan `--surface` plano. Nunca 4 tarjetas idénticas en jerarquía visual — eso es la marca de un dashboard genérico.

Ejemplo para Inicio: Citas de hoy (destacada) · Ingresos del mes · Tasa de ocupación · Tasa de inasistencia.

### 5.4 Cards genéricas

Header (título + acción opcional a la derecha) → body → footer opcional. Fondo `--surface`, borde `--border` 1px, `--radius-md`, sin sombra difusa pesada — usar `box-shadow: 0 1px 2px rgba(0,0,0,0.04)` como máximo, casi imperceptible. La separación entre cards se logra con espacio, no con sombra.

### 5.5 Tablas

- Header de columna: `text-secondary`, 12px, peso 500, fondo `--surface-alt`, sticky al hacer scroll vertical.
- Fila: 48px alto (densidad "balanceada"), hover `--surface-alt`.
- Ordenamiento: ícono de flecha junto al header de columna activa, en `--grape`.
- Acciones de fila: menú de tres puntos a la derecha, se revela en hover (desktop) o siempre visible (mobile/touch).
- Paginación: al pie, formato "Mostrando 1–10 de 84" + controles prev/next, nunca números de página infinitos.
- **Cada tabla debe implementar 4 estados: loading (skeleton, ver 5.7), vacío (ver 5.8), error (mensaje + botón reintentar), con datos.**

### 5.6 Los 4 usos autorizados del motivo "ticket / perforado / riso" fuera de la landing

Esto es exhaustivo — si no está en esta lista, no lleva el motivo:

1. **Checklist de onboarding** (primeros pasos al crear cuenta): tarjeta con borde perforado y sello circular de progreso ("3/5 pasos").
2. **Estados vacíos** (ej. "Aún no tienes citas agendadas"): ilustración ligera con el ticket como elemento gráfico central.
3. **Badge de notificación nueva / feature nueva**: pequeño círculo tipo sello en `--flame`.
4. **Tarjeta de upgrade de plan**: única tarjeta del dashboard con la muesca semicircular en una esquina, como recordatorio sutil de la identidad de marca en un momento comercial.

Todo lo demás (botones, inputs, filas, KPI cards, modales de uso diario) usa el sistema de radios estándar de la sección 4.4.

### 5.7 Skeletons (loading states)

Bloques grises `--surface-alt` con animación de shimmer (barrido de brillo, 1.4s, loop, `ease-in-out`) — sobrio y funcional, sin patrón decorativo de puntos/perforación (eso rompería la regla de "eficiente, detalle en segundo plano"). Cada tipo de contenido tiene su esqueleto correspondiente: skeleton de KPI card (rectángulo + línea), skeleton de fila de tabla (varias líneas de distinto ancho), skeleton de gráfica (rectángulo con leve pulso).

### 5.8 Estados vacíos

Ilustración simple (ver 5.6.2) + título corto + una frase de ayuda + botón de acción primaria (`--grape`). Nunca dejar una tabla o sección simplemente en blanco.

### 5.9 Formularios

Inputs `--radius-sm`, borde `--border`, foco: borde `--grape` + anillo `0 0 0 3px var(--grape-soft)`. Errores de validación: borde `--danger` + texto de ayuda en `--danger` debajo del campo (nunca solo el borde rojo sin texto). Selects, checkboxes y radios usan los componentes nativos de Preline UI; date pickers usan `vanilla-calendar-pro` (sugerencia de Preline para este caso puntual) — todos restyleados con los tokens de este documento.

### 5.10 Modales y drawers

Modal: overlay `rgba(23,18,27,0.5)`, panel `--radius-lg`, entra con fade + scale de 95% a 100% (200ms, ease-out). Drawer (usado para detalle de cita, ficha de cliente): entra deslizando desde la derecha (250ms, ease-out), ancho 420px en desktop / pantalla completa en mobile. Implementación: plugin `Overlay` de Preline (`HSOverlay`) para apertura/cierre y manejo de foco; la animación la controla Framer Motion con los tokens de 7.1.

### 5.11 Toasts / notificaciones

Esquina superior derecha, entran con slide-in + fade (200ms). Color del borde izquierdo según tipo (`--success`/`--warning`/`--danger`/`--grape` para info). Barra de progreso lineal para auto-dismiss. Preline no incluye un componente de toast nativo — se construye a la medida con la tarjeta base (`--surface`, `--radius-md`, sombra sutil de 5.4) + Framer Motion para la animación.

### 5.12 Badges de estado (citas, pagos)

| Estado              | Color                                | Ejemplo de uso                    |
| ------------------- | ------------------------------------ | --------------------------------- |
| Confirmada / Pagado | `--success` + fondo `--success-soft` | citas, pagos completados          |
| Pendiente           | `--warning` + fondo `--warning-soft` | por confirmar, anticipo pendiente |
| Cancelada           | `--danger` + fondo `--danger-soft`   | citas canceladas                  |
| Completada          | `--grape` + fondo `--grape-soft`     | historial de citas atendidas      |

Siempre: punto de color + texto. Nunca solo el punto.

### 5.13 Botones

| Variante    | Fondo                         | Texto              | Uso                                   |
| ----------- | ----------------------------- | ------------------ | ------------------------------------- |
| Primario    | `--grape` sólido              | blanco             | acción principal de la vista          |
| Secundario  | `--surface`, borde `--border` | `--text-primary`   | acciones alternas                     |
| Ghost       | transparente                  | `--text-secondary` | acciones terciarias, dentro de tablas |
| Destructivo | `--danger` sólido             | blanco             | eliminar, cancelar (con confirmación) |

Todos `--radius-md`, altura 40px (default) / 32px (small, dentro de tablas). Estado activo/press: `scale(0.98)`, 100ms.

---

## 6. Gráficas (Recharts)

| Vista                                       | Tipo de gráfica  | Serie/color                                                                                                          |
| ------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Inicio → citas por día (últimos 30 días)    | Línea            | `--grape`                                                                                                            |
| Inicio → ingresos por mes (últimos 6 meses) | Barra            | `--grape` con hover `--flame` en la barra activa (único uso decorativo de flame en una gráfica, solo al hacer hover) |
| Reportes → ocupación por sucursal           | Barra horizontal | `--grape`, `--success`, `--warning` por sucursal (paleta rotativa fija, no aleatoria)                                |
| Reportes → servicios más vendidos           | Donut            | paleta rotativa: `--grape`, `--success`, `--warning`, `--flame`, `--text-muted`                                      |
| Reportes → tasa de inasistencias            | Área             | `--danger` al 12% de opacidad de relleno, línea sólida                                                               |

**Regla de animación:** entrada única al montar el componente (barras crecen desde la base / línea se dibuja de izquierda a derecha), `duration: 600ms`, `ease-out`, sin repetir la animación en updates posteriores de datos (solo transición suave de valores, no la animación completa de entrada otra vez). Tooltip: fondo `--surface`, borde `--border`, sombra sutil, `--radius-sm`.

---

## 7. Animación — tokens y catálogo completo

### 7.1 Tokens de tiempo y easing

```css
--motion-fast: 120ms; /* hover, cambios de color */
--motion-base: 200ms; /* aparición de elementos, toggles */
--motion-slow: 320ms; /* modales, drawers */
--motion-page: 400ms; /* transición de página */

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 7.2 Catálogo (nivel "moderado" — micro-interacciones + entrada de datos, sin exagerar)

| Elemento                  | Animación                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Sidebar colapsar/expandir | `width` transición `--motion-base`, `--ease-in-out`                                                         |
| Ítem de nav hover         | fondo fade `--motion-fast`                                                                                  |
| Ítem de nav activo        | barra indicadora se desliza a la posición nueva, `--motion-base`                                            |
| KPI card al montar        | fade + translateY(8px→0) escalonado 60ms entre tarjetas; cifra hace count-up de 0 al valor final en 700ms   |
| Gráficas al montar        | ver sección 6                                                                                               |
| Fila de tabla hover       | fondo fade `--motion-fast`                                                                                  |
| Botón press               | `scale(0.98)`, 100ms                                                                                        |
| Modal                     | fade + scale 95%→100%, `--motion-slow`, `--ease-out`                                                        |
| Drawer                    | slide-in desde la derecha, `--motion-slow`, `--ease-out`                                                    |
| Toast                     | slide-in + fade, `--motion-base`                                                                            |
| Skeleton shimmer          | barrido de brillo, loop 1.4s, `--ease-in-out`                                                               |
| Cambio de página (ruta)   | fade simple `--motion-page`, sin slide — el dashboard se navega muchas veces al día, no debe sentirse lento |

**No animar:** cada carácter de texto, cada ícono por separado, ni repetir la animación de entrada de una tabla/gráfica cada vez que sus datos cambian (solo en el montaje inicial de la vista).

---

## 8. Responsive (dashboard completo, mobile incluido)

| Breakpoint   | Sidebar                                                                                                                                                       | KPI cards                      | Tablas                                                                                 | Gráficas                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Desktop/Wide | fijo, expandido/colapsable                                                                                                                                    | fila de 4                      | tabla completa                                                                         | tamaño completo                                                                |
| Tablet       | colapsado a solo íconos por defecto, expandible con overlay                                                                                                   | fila de 2                      | tabla completa con scroll horizontal si es necesario                                   | tamaño completo                                                                |
| Mobile       | oculto → drawer deslizable desde topbar (ícono hamburguesa) + **bottom tab bar fija** con los 5 accesos más usados (Inicio, Calendario, Pagos, Reportes, Más) | columna única, scroll vertical | se transforman en lista de cards (cada fila → una card con pares label:valor apilados) | altura reducida, menos marcas en eje X, scroll horizontal si la serie es larga |

En mobile, el FAB (botón flotante) para "Nueva cita" aparece fijo abajo a la derecha, sobre la bottom tab bar, en `--grape`.

---

## 9. Accesibilidad (obligatorio, no opcional)

1. Contraste mínimo AA en cada combinación texto/fondo de este documento (ya verificado en el diseño de tokens, pero revalida si se crean combinaciones nuevas).
2. Anillo de foco visible en todo elemento interactivo: `2px solid var(--grape)` con `2px` de offset — incluso en botones con forma no convencional (sección 5.6).
3. Todo botón de solo-ícono lleva `aria-label`.
4. El color nunca es el único indicador de estado (ver regla de badges, 5.12).
5. Gráficas con un resumen accesible (`aria-describedby` con el dato clave en texto) para lectores de pantalla.
6. Navegación completa por teclado: sidebar, tabs, filas de tabla con acciones, y trampa de foco dentro de modales/drawers.

---

## 10. Mapa de módulos (contenido y componentes por pantalla)

| Módulo                     | Contiene                                                                                                                                                                               | Componentes clave                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Inicio**                 | 4 KPI cards (citas hoy destacada, ingresos del mes, ocupación, inasistencias) · gráfica de citas por día · gráfica de ingresos por mes · lista de próximas citas de hoy                | KPI card, chart, tabla compacta         |
| **Calendario**             | Vista día/semana/mes · filtro por sucursal y por staff · al hacer clic en una cita, drawer con detalle + ficha del cliente embebida (nombre, historial, contacto) · botón "Nueva cita" | Calendar grid, drawer, badges de estado |
| **Servicios y sucursales** | Tabla de sucursales (dirección, horario, staff asignado) · tabla de servicios (nombre, duración, precio, sucursales donde aplica) · modales de creación/edición                        | Tabla, modal, form                      |
| **Personal**               | Lista de empleados · horario semanal por persona (grid tipo calendario) · roles y permisos                                                                                             | Tabla, grid horario, form               |
| **Pagos y facturación**    | Tabla de transacciones (fecha, cliente, servicio, monto, estado) · KPI de ingresos y anticipos pendientes · estado de la suscripción de Agendur                                        | Tabla, KPI card, badge                  |
| **Reportes**               | Filtro de rango de fechas · gráficas: ocupación por sucursal, servicios más vendidos, tasa de inasistencias · botón exportar CSV/PDF                                                   | Chart, filtros, botón export            |
| **Configuración**          | Perfil del negocio · usuarios y roles · plantillas de recordatorios WhatsApp/SMS · plan y facturación de Agendur · toggle claro/oscuro                                                 | Form, tabla de usuarios, toggle         |

_Nota: la gestión de "Clientes" no es un módulo de sidebar independiente — vive embebida dentro del drawer de detalle de cita en Calendario, y en la tabla de transacciones en Pagos. Si más adelante se necesita una base de clientes independiente con historial completo, se agrega como módulo 8 sin romper este sistema._

---

## 11. Checklist de consistencia (regla de auto-verificación para el agente)

Antes de dar por terminado cualquier componente o pantalla, verifica:

- [ ] `--flame` no se usa como color de badge de estado, botón destructivo ni KPI negativo.
- [ ] El motivo de muesca/perforación solo aparece en uno de los 4 lugares autorizados (sección 5.6).
- [ ] Todos los botones del mismo tipo (primario/secundario/ghost) tienen exactamente el mismo radio, altura y tipografía en toda la app.
- [ ] Toda vista con datos tiene sus 4 estados implementados: loading, vacío, error, con datos.
- [ ] Las cifras de KPI usan Space Mono + `tabular-nums`.
- [ ] Cada badge de estado combina color + texto (+ ícono si aplica), nunca solo color.
- [ ] El sidebar usa `--sidebar-bg` fijo, sin importar el tema claro/oscuro activo.
- [ ] Todo elemento interactivo tiene estado de foco visible y, si es solo-ícono, `aria-label`.
- [ ] La fila de KPI cards de cada vista tiene jerarquía (una tarjeta destacada), no 4 tarjetas idénticas.
- [ ] En mobile, las tablas se ven como lista de cards, no como tabla comprimida ilegible.
- [ ] Magic UI y React Bits solo aparecen en login/registro o en los momentos de marca autorizados (sección 1.2) — nunca dentro del dashboard interior.
- [ ] Las tablas se construyen con TanStack Table + tokens propios, nunca con DataTables.net.
- [ ] `HSStaticMethods.autoInit()` se vuelve a ejecutar después de cada navegación de ruta — Preline no se reinicializa solo.

---

## 12. Pantallas de autenticación — Login y Registro

### 12.1 Principio compartido

Ambas pantallas usan el mismo "shell" de dos columnas: izquierda = formulario sobre `--surface`/`--background`, derecha = panel visual de marca, visible solo en desktop/tablet (oculto en mobile, el formulario pasa a 100% de ancho). Junto con la landing, este es el único lugar del producto donde Magic UI y React Bits tienen luz verde (ver 1.2).

### 12.2 Login

**Layout desktop (≥1024px):** dos columnas 50/50. Izquierda: contenido centrado verticalmente, ancho máximo 380px. Derecha: panel full-bleed fondo `--ink` con el Bento Grid descrito abajo.

**Columna izquierda, de arriba a abajo:**

1. Logo "Agendur" (32px alto), esquina superior izquierda.
2. Título: "Inicia sesión en tu cuenta" (H1, Bricolage Grotesque, 28px).
3. Subtítulo: "Ingresa tu correo para entrar a tu panel." (`--text-secondary`, 14px).
4. Campo Correo electrónico (placeholder "tu@negocio.com").
5. Campo Contraseña + link "¿Olvidaste tu contraseña?" alineado a la derecha del label (igual que tu referencia).
6. Botón primario "Iniciar sesión", ancho completo — **sin muesca de ticket**, es un botón de uso diario, sigue la regla de 5.13.
7. Divisor con texto "O continúa con".
8. Botón secundario "Continuar con Google" — no GitHub: la audiencia son dueños de negocio, no desarrolladores.
9. Pie: "¿No tienes cuenta? Regístrate" (link `--grape`).

**Columna derecha — Bento Grid con Magic UI:**
4 tarjetas sobre fondo `--ink`, mostrando producto y prueba social en movimiento — nunca una captura real del dashboard:

| Tarjeta               | Contenido                                                                                                       | Componente Magic UI                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Grande (2 filas)      | Feed simulado: "Cita confirmada — Spa Aurora", "Recordatorio enviado — Barbería Norte", entradas nuevas cada 3s | `AnimatedList`                                                                   |
| Mediana               | "+500 negocios confían en Agendur", cifra animada de 0 al valor final                                           | `NumberTicker` (Space Mono, tabular — mismo principio que los KPI del dashboard) |
| Mediana               | "-30% inasistencias en promedio" + ícono de tendencia                                                           | tarjeta estática con entrada `BlurFade`                                          |
| Ancho completo, abajo | Franja de logos de negocios clientes desplazándose                                                              | `Marquee`                                                                        |

Fondo de tarjetas: `--surface` al 6% de opacidad sobre `--ink`. Acentos `--grape` y, como máximo, un solo `--flame` en toda la columna (el ícono de tendencia).

**Mobile (<640px):** solo la columna izquierda, ancho completo. El bento no se apila debajo — en mobile prioriza velocidad de login, no la marca.

### 12.3 Registro — flujo de 3 pasos

Mismo shell de dos columnas. La columna derecha reutiliza el Bento Grid del login pero cambia el copy según el paso activo (transición con `BlurFade`):

- Paso 1: "Únete a +500 negocios que ya organizan su agenda."
- Paso 2: "Cuéntanos quién va a estar del otro lado."
- Paso 3: "Personaliza tu negocio en menos de 2 minutos."

**Indicador de progreso** (arriba del formulario, columna izquierda): stepper horizontal de 3 segmentos con etiqueta debajo — "Cuenta" · "Perfil" · "Negocio". Paso activo: círculo relleno `--grape`. Completado: círculo con check + línea conectora `--grape`. Futuro: círculo vacío, borde `--border`, texto `--text-muted`.

**Paso 1 — Cuenta**

- Correo electrónico
- Contraseña + indicador de fortaleza (barra de 3 segmentos: `--danger` / `--warning` / `--success`)
- Checkbox "Acepto los términos y condiciones"
- Botón "Continuar"

**Paso 2 — Datos personales**

- Nombre, Apellido (misma fila en desktop, apilados en mobile)
- Teléfono con selector de código de país (se reutiliza luego para configurar recordatorios por WhatsApp)
- Rol en el negocio: select — Dueño / Gerente / Recepcionista / Otro
- Botones "Atrás" (ghost, izquierda) y "Continuar" (primario, derecha)

**Paso 3 — Datos de la empresa**

- Nombre del negocio
- Tipo de industria: select — Clínica / Barbería / Spa / Nutriólogo / Salón de belleza / Consultorio / Otro
- Número de sucursales al iniciar: 1 / 2–3 / 4+ (grupo de pills, no dropdown — son solo 3 opciones)
- Ciudad
- Botones "Atrás" y **"Crear mi cuenta"** (el texto cambia, ya no dice "Continuar")

**Transición entre pasos:** el contenido del formulario (no el stepper ni el panel derecho) sale deslizando a la izquierda y el paso nuevo entra desde la derecha al avanzar, viceversa al retroceder — 280ms, `--ease-out`. Usar `AnimatedContent` de React Bits, o su equivalente en Framer Motion si no se quiere sumar la dependencia solo para esto.

**Al completar el paso 3:** dispara `Confetti` de Magic UI una sola vez (2s, colores `--grape`/`--flame`/`--success`) antes de redirigir al dashboard — es uno de los momentos de marca autorizados en 1.2, y el único punto de todo el producto donde el motivo festivo tiene sentido.

**Validación:** cada paso valida sus propios campos antes de habilitar "Continuar" — nunca se avanza con campos vacíos, con mensaje de error `--danger` debajo del campo (mismo patrón de 5.9).
