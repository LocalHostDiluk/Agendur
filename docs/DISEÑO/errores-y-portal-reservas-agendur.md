# agendur — Páginas de error + Portal público de reservas
### Especificación ejecutable para agentes de IA

---

# 00. CÓMO USAR ESTE DOCUMENTO

**Lee esta sección antes de escribir código.**

1. Este documento es **autocontenido**. Todos los colores, medidas y textos que necesitas están aquí. No necesitas consultar otro archivo.
2. Las **REGLAS** están numeradas y son obligatorias. Si una regla dice "NUNCA" o "SIEMPRE", no hay excepciones ni casos especiales.
3. Los valores exactos (colores en hex, píxeles, milisegundos) se usan **tal cual están escritos**. No los aproximes ni los "mejores".
4. Cuando veas `[NOMBRE_NEGOCIO]` o similar entre corchetes, es una variable que viene de la base de datos.
5. Si algo no está especificado aquí, usa el valor más simple y conservador posible. No inventes funcionalidad nueva.

**Stack obligatorio del proyecto:**
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Preline UI (componentes base) — se inicializa con `HSStaticMethods.autoInit()` en cada cambio de ruta
- Framer Motion (`npm i motion`) para animaciones
- React Bits y Magic UI **solo** donde este documento lo indique explícitamente
- `date-fns` para todo cálculo de fechas
- Iconos: `lucide-react`

---

# 0. TOKENS — cópialos tal cual

Pega este bloque en tu CSS global. Usa siempre `var(--nombre)`, nunca el hex directo en los componentes.

```css
:root {
  /* Base riso (tema de la landing) */
  --paper:        #F3EEDF;  /* fondo papel */
  --paper-pure:   #FFFFFF;  /* tarjetas sobre papel */
  --ink:          #1D1720;  /* fondo oscuro / texto principal */
  --ink-soft:     #2A2130;  /* superficies sobre fondo oscuro */

  /* Acentos de marca */
  --grape:        #6E49A6;  /* acento primario, acciones */
  --grape-soft:   rgba(110, 73, 166, 0.12);
  --flame:        #FF5A36;  /* acento decorativo de marca */
  --mint:         #46B88A;  /* confirmado / disponible */

  /* Texto */
  --text-primary:   #211A26;
  --text-secondary: #6B6355;
  --text-muted:     #A39C8C;
  --text-on-ink:        #F3EEDF;
  --text-on-ink-soft:   rgba(243, 238, 223, 0.65);
  --text-on-ink-muted:  rgba(243, 238, 223, 0.40);

  /* Estructura */
  --border:       #E7E1D3;
  --border-ink:   rgba(243, 238, 223, 0.15);
  --danger:       #D14343;
  --warning:      #E8A23D;

  /* Radios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Tiempos */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Fuentes (las tres, obligatorias):**

| Fuente | Se usa SOLO para |
|---|---|
| `Bricolage Grotesque` | Títulos (h1, h2, h3) |
| `Inter` | Todo el texto de interfaz, párrafos, botones, labels |
| `Space Mono` | Números: código de error, fecha y hora de la cita, número de confirmación, número de paso |

**REGLA 0.1** — NUNCA uses Space Mono para texto corrido. SOLO para números y códigos cortos.
**REGLA 0.2** — NUNCA uses Bricolage Grotesque para texto de párrafo. SOLO para títulos.

---

# 0.B EL MOTIVO "TICKET" — CSS listo para copiar

Todo el sistema visual imita un **ticket de turno de papel**. Estas son las 3 técnicas. Cópialas exactamente.

### Técnica 1 — Muesca lateral (las dos mordidas de los costados)

```css
.ticket {
  position: relative;
  background: var(--paper-pure);
  border-radius: var(--radius-lg);
}
.ticket::before,
.ticket::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: var(--paper); /* ← DEBE ser el color del fondo que está DETRÁS del ticket */
}
.ticket::before { left: -12px; }
.ticket::after  { right: -12px; }
```

**REGLA 0.3** — El `background` de `::before` y `::after` DEBE ser idéntico al color del fondo que está detrás del ticket. Si el ticket está sobre `--paper`, usa `--paper`. Si está sobre `--ink`, usa `--ink`. Si no coinciden, la muesca se ve como dos círculos pegados y el efecto se rompe.

### Técnica 2 — Línea de perforación (donde se rasga el ticket)

```css
.perforacion {
  border-top: 2px dashed var(--border);
  width: 100%;
  height: 0;
}
/* Sobre fondo oscuro usa: border-top: 2px dashed var(--border-ink); */
```

### Técnica 3 — Sello circular (estampado)

```css
.sello {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-align: center;
  line-height: 1.2;
  transform: rotate(-12deg);
}
```

### Técnica 4 — Botón con muesca (solo páginas de marca)

```css
.btn-ticket {
  position: relative;
  border-radius: var(--radius-md);
  overflow: visible;
}
.btn-ticket::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: var(--ink); /* color del fondo detrás */
}
```

**REGLA 0.4** — La Técnica 4 (botón con muesca) se usa ÚNICAMENTE en: las 4 páginas de error, y el botón final de confirmación del portal de reservas. En NINGÚN otro lugar. Todos los demás botones son rectángulos con `--radius-md` normal.

---

# PARTE A — PÁGINAS DE ERROR

## A.1 REGLAS DE LAS PÁGINAS DE ERROR

**REGLA A.1** — Las 4 páginas de error tienen fondo `--ink` SIEMPRE, sin importar si el usuario tiene modo claro u oscuro activado. No implementes toggle de tema en estas páginas.

**REGLA A.2** — Las 4 páginas usan exactamente la misma estructura (el "shell" de A.2). Lo único que cambia entre ellas es: la animación central, el título, la descripción, los botones y el código del pie.

**REGLA A.3** — Toda página de error DEBE tener al menos un botón de salida visible. NUNCA dejes al usuario sin ruta de escape.

**REGLA A.4** — Las 4 páginas llevan `<meta name="robots" content="noindex">`.

**REGLA A.5** — Si `prefers-reduced-motion: reduce` está activo, renderiza el estado FINAL de la animación de forma estática. No animes nada.

**REGLA A.6** — El logo "agendur" va en la esquina superior izquierda, a 24px de cada borde, color `--text-on-ink`, y es un link a `/`. Excepción: en la página "Negocio no encontrado" el logo NO es link (ver REGLA A.10).

## A.2 SHELL COMPARTIDO — estructura exacta

Contenedor: `min-height: 100vh`, fondo `--ink`, flex column, centrado vertical y horizontalmente, padding 24px.

Orden vertical de los elementos:

| # | Elemento | Especificación |
|---|---|---|
| 1 | Logo "agendur" | Posición absoluta, top 24px, left 24px. Bricolage Grotesque, 20px, peso 700, color `--text-on-ink` |
| 2 | Animación central | Alto máximo 280px (desktop) / 180px (mobile). Contenido según la página |
| 3 | Título | Bricolage Grotesque, 32px desktop / 24px mobile, peso 700, color `--text-on-ink`, margen superior 32px, centrado |
| 4 | Descripción | Inter, 16px, color `--text-on-ink-soft`, `max-width: 420px`, centrado, margen superior 12px |
| 5 | Botones | Fila horizontal con gap 12px, margen superior 32px. En mobile (<640px): columna, ancho 100% |
| 6 | Perforación | `.perforacion` con `--border-ink`, ancho 240px, margen superior 48px |
| 7 | Código de error | Space Mono, 12px, color `--text-on-ink-muted`, margen superior 16px, `letter-spacing: 0.1em` |

**Botón primario:** fondo `--grape`, texto `#FFFFFF`, padding 14px 28px, `--radius-md`, clase `.btn-ticket` aplicada.
**Botón secundario:** fondo transparente, borde 1px `--border-ink`, texto `--text-on-ink`, mismo padding y radio, SIN muesca.

## A.3 PÁGINA 404 — Página no encontrada

**Archivo:** `app/not-found.tsx`

| Campo | Valor |
|---|---|
| Animación central | Componente `FuzzyText` de React Bits. Texto: `404`. Fuente Space Mono. Tamaño 120px desktop / 72px mobile. Color `--flame`. Props: `baseIntensity={0.18}`, `hoverIntensity={0.45}`, `enableHover={true}` |
| Fondo adicional | Componente `DotGrid` de React Bits. Color de puntos: `rgba(110,73,166,0.25)`. Tamaño de punto: 2px. Espaciado: 28px. Sin interacción de cursor |
| Título ES | Ese turno no existe. |
| Título EN | That ticket doesn't exist. |
| Descripción ES | La página que buscas no está aquí. Puede que el enlace esté mal escrito o que la página se haya movido. |
| Descripción EN | The page you're looking for isn't here. The link may be misspelled or the page may have moved. |
| Botón primario | ES: `Volver al inicio` / EN: `Back to home` → link a `/` |
| Botón secundario | ES: `Ir a mi panel` / EN: `Go to my dashboard` → link a `/dashboard` |
| Código de pie | `ERROR 404` |

**REGLA A.7** — El botón secundario ("Ir a mi panel") se renderiza ÚNICAMENTE si hay una sesión de usuario activa. Si no hay sesión, ese botón no existe en el DOM.

## A.4 PÁGINA 403 — Sin acceso

**Archivo:** `app/403/page.tsx` (redirige aquí desde tu middleware de permisos)

| Campo | Valor |
|---|---|
| Animación central | SVG de un ticket vacío (rectángulo 240×120px, borde 1px dashed `rgba(243,238,223,0.3)`, radio 12px) con un `.sello` encima, centrado y superpuesto. Texto del sello: `SIN ACCESO` (EN: `NO ACCESS`). Color del sello: `--danger` |
| Animación del sello | Con Framer Motion: `scale` de `1.8` a `1`, `opacity` de `0` a `1`, `duration: 450ms`, `ease-out`, `delay: 200ms`. Después queda estático. NO se repite |
| Fondo adicional | NINGUNO. Esta página va limpia |
| Título ES | No tienes acceso a esta sección. |
| Título EN | You don't have access to this section. |
| Descripción ES | Tu rol actual no incluye permisos para ver esta página. Si crees que es un error, contacta al dueño de la cuenta. |
| Descripción EN | Your current role doesn't include permission to view this page. If you think this is a mistake, contact the account owner. |
| Botón primario | ES: `Volver a mi panel` / EN: `Back to my dashboard` → link a `/dashboard` |
| Botón secundario | ES: `Contactar soporte` / EN: `Contact support` → `mailto:soporte@agendur.app` |
| Código de pie | `ERROR 403` |

**REGLA A.8** — Esta página NO lleva fondo animado. El usuario está frustrado porque no puede entrar; la sobriedad es intencional.

## A.5 PÁGINA 500 — Error del servidor

**Archivos:** `app/error.tsx` (debe empezar con `"use client"`) y `app/global-error.tsx` (debe incluir sus propias etiquetas `<html>` y `<body>`).

| Campo | Valor |
|---|---|
| Animación central | Componente `DecryptedText` de React Bits. Texto: `500`. Fuente Space Mono. Tamaño 120px desktop / 72px mobile. Color `--flame`. Props: `animateOn="view"`, `speed={45}`, `sequential={true}` |
| Segunda línea | Componente `ScrambledText` de React Bits. Texto: `SYSTEM ERROR`. Space Mono 14px, color `--text-on-ink-muted`, margen superior 12px |
| Fondo adicional | Componente `Squares` de React Bits. Props: `speed={0.15}`, `borderColor="rgba(110,73,166,0.18)"`, `squareSize={40}` |
| Título ES | Algo se atascó de nuestro lado. |
| Título EN | Something jammed on our end. |
| Descripción ES | No es culpa tuya. Ya nos enteramos del problema y lo estamos revisando. Intenta de nuevo en un momento. |
| Descripción EN | This isn't your fault. We've been notified and we're looking into it. Try again in a moment. |
| Botón primario | ES: `Reintentar` / EN: `Try again` → ejecuta la función `reset()` que Next.js pasa como prop. NO es un link |
| Botón secundario | ES: `Volver al inicio` / EN: `Back to home` → link a `/` |
| Código de pie | `ERROR 500` |

**REGLA A.9** — Esta página DEBE reportar el error a tu servicio de monitoreo (Sentry o equivalente) dentro de un `useEffect` al montarse. Importa `DecryptedText`, `ScrambledText` y `Squares` con `next/dynamic` y `ssr: false`, con un fallback de texto plano — si el servidor está caído, una página pesada empeora el problema.

## A.6 PÁGINA "NEGOCIO NO ENCONTRADO"

**Archivo:** `app/[negocio]/not-found.tsx`

**Contexto crítico:** esta página la ve un **cliente final** que intentó reservar una cita (una persona que quería un corte de cabello), NO un dueño de negocio. No tiene cuenta en agendur y no la necesita.

| Campo | Valor |
|---|---|
| Animación central | SVG de un ticket vacío (240×120px, borde 1px dashed `rgba(243,238,223,0.3)`) con 3 líneas punteadas horizontales adentro simulando campos sin llenar. En el centro, el texto `¿…?` en Space Mono 48px, color `rgba(243,238,223,0.35)`, entrando con `BlurText` de React Bits |
| Fondo adicional | Componente `Noise` de React Bits, `opacity={0.04}`. Da textura de papel |
| Título ES | No encontramos este negocio. |
| Título EN | We couldn't find this business. |
| Descripción ES | El enlace de reservas no existe o el negocio ya no está activo en agendur. Te recomendamos contactar al negocio directamente para confirmar su enlace. |
| Descripción EN | This booking link doesn't exist or the business is no longer active on agendur. We recommend contacting the business directly to confirm their link. |
| Botón primario | ES: `Conocer agendur` / EN: `Discover agendur` → link a `/` |
| Botón secundario | NINGUNO |
| Código de pie | `NEGOCIO NO ENCONTRADO` (EN: `BUSINESS NOT FOUND`) |

**REGLA A.10** — Esta página NUNCA debe mostrar links a `/dashboard`, `/login`, `/registro` ni a ninguna sección interna del producto. Quien la ve no tiene cuenta. El único link permitido es a la landing (`/`).

## A.7 INSTALACIÓN DE COMPONENTES DE REACT BITS

```bash
npx jsrepo add https://reactbits.dev/ts/tailwind/TextAnimations/FuzzyText
npx jsrepo add https://reactbits.dev/ts/tailwind/TextAnimations/DecryptedText
npx jsrepo add https://reactbits.dev/ts/tailwind/TextAnimations/ScrambledText
npx jsrepo add https://reactbits.dev/ts/tailwind/TextAnimations/BlurText
npx jsrepo add https://reactbits.dev/ts/tailwind/Backgrounds/DotGrid
npx jsrepo add https://reactbits.dev/ts/tailwind/Backgrounds/Squares
npx jsrepo add https://reactbits.dev/ts/tailwind/Animations/Noise
npx jsrepo add https://reactbits.dev/ts/tailwind/Animations/AnimatedContent
```

**REGLA A.11** — Verifica que cada componente exista en `reactbits.dev` antes de instalarlo. La librería cambia con frecuencia. Si un componente ya no existe, sustitúyelo por una animación equivalente hecha con Framer Motion — NO inventes un nombre de componente.

---

# PARTE B — PORTAL PÚBLICO DE RESERVAS

## B.0 QUÉ CAMBIÓ RESPECTO A LA VERSIÓN ANTERIOR

La versión anterior usaba secciones que se revelaban en una sola página larga. **Eso queda anulado.** Ahora el portal funciona como un **wizard de pasos**, igual que el registro: un paso a la vez, el contenido anterior sale deslizando y el nuevo entra, con un indicador de progreso arriba.

El calendario ya no está permanentemente visible — vive en su propio paso. El contexto se mantiene mediante el **ticket de resumen** (B.4), que muestra siempre lo que el cliente lleva seleccionado.

## B.1 REGLAS DEL PORTAL DE RESERVAS

**REGLA B.1** — El orden de los pasos es FIJO: Sucursal → Fecha → Servicio → Hora → Datos → Confirmación. No lo alteres.

**REGLA B.2** — Si el negocio tiene exactamente 1 sucursal, el Paso 1 NO se muestra y NO aparece en el indicador de progreso. El wizard empieza directamente en Fecha y muestra 4 pasos en lugar de 5. La sucursal se autoselecciona en segundo plano.

**REGLA B.3** — El selector de profesional va DENTRO del paso de Hora, nunca como paso propio, y viene siempre con la opción "Cualquier profesional disponible" preseleccionada.

**REGLA B.4** — El cliente SIEMPRE puede regresar a un paso anterior, tocando el paso en el indicador de progreso o el botón "Atrás". Regresar NO borra lo que ya había seleccionado en pasos posteriores, a menos que el cambio lo invalide (ver REGLA B.5).

**REGLA B.5** — Si el cliente cambia la SUCURSAL o la FECHA, borra automáticamente las selecciones de Servicio y Hora, porque la disponibilidad cambió. Si cambia el SERVICIO, borra solo la Hora. Muestra un aviso breve: "Actualizamos los horarios disponibles."

**REGLA B.6** — Un paso NO puede avanzar si su campo obligatorio está vacío. El botón "Continuar" permanece deshabilitado (opacidad 0.4, `cursor: not-allowed`) hasta que haya una selección válida.

**REGLA B.7** — NUNCA muestres un paso vacío sin explicación. Todo estado sin datos debe tener un mensaje y una acción (ver tabla B.8).

**REGLA B.8** — Toda área táctil (celda de calendario, chip de horario, pill de sucursal, tarjeta de servicio) mide mínimo 44×44 píxeles.

**REGLA B.9** — El calendario NUNCA permite navegar a meses anteriores al actual. La flecha izquierda se deshabilita cuando estás en el mes actual.

**REGLA B.10** — El calendario renderiza la cantidad REAL de días de cada mes (28, 29, 30 o 31) usando `date-fns`. NUNCA asumas 30 días fijos.

## B.2 PERSONALIZACIÓN POR NEGOCIO

Cada negocio puede configurar exactamente 2 cosas:

1. **Su logo** (imagen cuadrada, máximo 200×200px)
2. **Un color de acento**, elegido de un set cerrado de 12 opciones predefinidas

**REGLA B.11** — El color de acento del negocio reemplaza a `--grape` ÚNICAMENTE en estos 4 lugares: botón primario, día seleccionado del calendario, chip de horario seleccionado, barra de progreso del wizard. En ningún otro elemento.

**REGLA B.12** — NUNCA implementes un selector de color libre (color picker). Solo el set cerrado de 12 colores, todos ya validados con contraste AA sobre blanco.

**REGLA B.13** — Si el negocio no configuró logo ni color, usa `--grape` como acento y muestra el nombre del negocio como texto en Bricolage Grotesque 20px. La página NUNCA se ve rota por falta de configuración.

**REGLA B.14** — Al pie de todas las pantallas del portal va el texto `Reservas con agendur`, con "agendur" en `--grape` y enlazado a la landing. Inter 13px, color `--text-muted`.

## B.3 LAYOUT

### Desktop (≥1024px) — dos columnas

**Columna izquierda (fija, 380px, fondo `--ink`):**
- Logo del negocio (o wordmark de texto), 48px de alto
- Nombre del negocio: Bricolage Grotesque 24px, color `--text-on-ink`
- Dirección de la sucursal activa: Inter 14px, color `--text-on-ink-soft`
- Debajo: el **ticket de resumen** (ver B.4)
- Al pie: `Reservas con agendur`

**Columna derecha (`flex-1`, fondo `--paper`):**
- Indicador de progreso arriba (ver B.5)
- Contenido del paso activo, `max-width: 560px`, centrado
- Botones de navegación al pie del paso

### Mobile (<1024px) — una columna

- Encabezado compacto arriba: logo 32px + nombre del negocio, fondo `--ink`, alto 72px
- Indicador de progreso debajo del encabezado
- Contenido del paso, ancho completo con padding 20px
- **Barra fija inferior** (`position: fixed; bottom: 0`) con: resumen en una línea (ej. `Corte · Mar 14 · 10:30`) + botón "Continuar" a ancho completo
- El ticket de resumen completo NO se muestra en mobile hasta la confirmación

## B.4 EL TICKET DE RESUMEN (columna izquierda, desktop)

Es la pieza temática más importante del portal: **un ticket que se va imprimiendo conforme el cliente avanza.**

Estructura: aplica la clase `.ticket` (Técnica 1 de la sección 0.B) con fondo `--paper-pure` y muescas en color `--ink` (porque está sobre fondo oscuro).

Contenido, de arriba a abajo:
1. Encabezado: `TU RESERVA` en Space Mono 11px, `letter-spacing: 0.1em`, color `--text-muted`
2. `.perforacion`
3. Filas de datos, una por cada selección confirmada. Cada fila: label en Inter 12px color `--text-muted` + valor en Inter 15px peso 600 color `--text-primary`
   - Sucursal
   - Fecha (el valor en Space Mono)
   - Servicio
   - Hora (el valor en Space Mono)
   - Profesional
4. `.perforacion`
5. Pie: duración total y precio, si ya se eligió servicio

**REGLA B.15** — Las filas de datos aún NO seleccionadas se muestran como líneas punteadas vacías (`border-bottom: 1px dashed var(--border)`, alto 20px), NO se ocultan. Así el cliente ve cuánto falta, igual que un formulario de papel a medio llenar.

**REGLA B.16** — Cuando un dato se confirma, su fila entra con el componente `BlurText` de React Bits. Es el efecto de "impresión". Cada fila se anima UNA sola vez, cuando pasa de vacía a llena.

## B.5 INDICADOR DE PROGRESO

Stepper horizontal en la parte superior de la columna derecha.

| Estado | Apariencia |
|---|---|
| Paso completado | Círculo de 32px relleno con el color de acento, ícono `Check` blanco de 16px adentro. Etiqueta en Inter 13px, color `--text-primary`. **Es clickeable** (regresa a ese paso) |
| Paso activo | Círculo de 32px, borde 2px color de acento, fondo transparente, número del paso adentro en Space Mono 14px color de acento. Etiqueta en Inter 13px peso 600 |
| Paso futuro | Círculo de 32px, borde 1px `--border`, número en Space Mono 14px color `--text-muted`. Etiqueta color `--text-muted`. **No clickeable** |
| Línea conectora | 2px de alto. Color de acento si el tramo está completado, `--border` si no |

**Etiquetas de los pasos (ES):** `Sucursal` · `Fecha` · `Servicio` · `Hora` · `Datos`
**Etiquetas de los pasos (EN):** `Location` · `Date` · `Service` · `Time` · `Details`

**REGLA B.17** — En mobile (<640px) oculta las etiquetas de texto y muestra solo los círculos con los números, centrados.

## B.6 LOS PASOS — especificación exacta

### PASO 1 — Sucursal
*(Se omite completamente si el negocio tiene 1 sola sucursal — REGLA B.2)*

- Título del paso (ES): `¿En qué sucursal?` / (EN): `Which location?`
- Contenido: lista vertical de tarjetas, una por sucursal. Cada tarjeta muestra: nombre de la sucursal (Inter 16px peso 600), dirección (Inter 14px color `--text-secondary`), y horario de hoy (Inter 13px color `--text-muted`)
- Tarjeta seleccionada: borde 2px color de acento + fondo `--grape-soft`
- Tarjeta no seleccionada: borde 1px `--border`, fondo `--paper-pure`
- Si una sucursal está temporalmente cerrada: badge en `--warning` con el texto `Cerrada temporalmente`, tarjeta no seleccionable
- Botones al pie: solo `Continuar` (no hay "Atrás" en el primer paso)

### PASO 2 — Fecha

- Título del paso (ES): `Elige el día` / (EN): `Pick a day`
- Contenido: calendario de mes completo. Especificación exacta en B.7

### PASO 3 — Servicio

- Título del paso (ES): `¿Qué servicio necesitas?` / (EN): `What service do you need?`
- Subtítulo: muestra la fecha elegida, ej. `Disponibles el martes 14 de octubre`
- Contenido: lista vertical de tarjetas de servicio. Cada tarjeta:
  - Nombre del servicio: Inter 16px peso 600
  - Descripción corta: Inter 14px color `--text-secondary`, máximo 2 líneas
  - Duración: badge con ícono `Clock` 14px + texto, ej. `45 min`
  - Precio: Space Mono 16px peso 700, alineado a la derecha
- Si hay más de 8 servicios, agrúpalos por categoría con un encabezado por grupo (Bricolage Grotesque 16px)
- Botones al pie: `Atrás` (ghost) y `Continuar` (primario)

**REGLA B.18** — Solo se listan los servicios que la sucursal elegida ofrece Y que tienen al menos un hueco disponible en la fecha elegida. Un servicio sin disponibilidad ese día se muestra atenuado (opacidad 0.4) con la etiqueta `Sin horarios este día` y NO es seleccionable.

### PASO 4 — Hora

- Título del paso (ES): `Elige tu horario` / (EN): `Pick your time`
- **Primero:** selector de profesional. Dropdown de Preline UI. Primera opción, preseleccionada: `Cualquier profesional disponible`. Después, la lista de profesionales que ofrecen ese servicio en esa sucursal
- **Después:** los horarios, agrupados en 3 franjas con un encabezado cada una:
  - `Mañana` (antes de 12:00)
  - `Tarde` (12:00 a 18:00)
  - `Noche` (18:00 en adelante)
- Cada horario es un chip: Space Mono 15px, padding 12px 16px, `--radius-md`, borde 1px `--border`, fondo `--paper-pure`. Mínimo 44px de alto
- Chip seleccionado: fondo del color de acento, texto blanco, borde del mismo color
- Grid de chips: 4 columnas en desktop, 3 en mobile, gap 8px
- **REGLA B.19** — Si una franja no tiene horarios, NO muestres su encabezado vacío. Omite la franja completa
- Botones al pie: `Atrás` y `Continuar`

### PASO 5 — Tus datos

- Título del paso (ES): `Solo faltan tus datos` / (EN): `Just your details`
- Campos, en este orden:
  1. `Nombre completo` — obligatorio, Inter, input de Preline
  2. `Teléfono` — obligatorio, con `inputmode="tel"` y selector de código de país. Texto de ayuda debajo: `Aquí te enviaremos el recordatorio de tu cita.`
  3. `Correo electrónico` — opcional. Texto de ayuda: `Opcional, para enviarte el comprobante.`
  4. `Notas para el negocio` — opcional, textarea de 3 líneas
  5. Checkbox obligatorio: `Acepto el aviso de privacidad` con link
- Botones al pie: `Atrás` y `Confirmar mi cita` (primario, con clase `.btn-ticket`)

**REGLA B.20** — El campo de teléfono es obligatorio SIEMPRE, porque es el canal de los recordatorios de WhatsApp/SMS, que es el valor central del producto.

**REGLA B.21** — Los labels de los campos son SIEMPRE visibles encima del input. NUNCA uses solo el placeholder como label.

## B.7 EL CALENDARIO — especificación exacta

| Aspecto | Valor obligatorio |
|---|---|
| Vista | Mes completo, cuadrícula de 7 columnas |
| Mes inicial | El mes actual |
| Primer día de la semana | Lunes |
| Navegación | Flechas `‹` y `›` a los lados del nombre del mes. La flecha `‹` se deshabilita en el mes actual (REGLA B.9) |
| Límite hacia adelante | 90 días desde hoy. Al llegar, la flecha `›` se deshabilita |
| Tamaño de celda | Mínimo 44×44px. En desktop, 56×56px |
| Encabezados de columna | `L M M J V S D`, Inter 12px, color `--text-muted` |

**Estados de cada día:**

| Estado | Apariencia exacta |
|---|---|
| Disponible | Número en Inter 15px color `--text-primary`. Debajo del número, un punto de 4px de diámetro en el color de acento |
| Sin disponibilidad | Número en color `--text-muted`. Sin punto. `cursor: not-allowed`. No clickeable |
| Día pasado | Número en `--text-muted` con `opacity: 0.4`. Sin punto. No clickeable |
| Hoy | Número en peso 700 + borde 1px del color de acento alrededor de la celda |
| Seleccionado | Fondo sólido del color de acento, número en blanco peso 600, `--radius-md` |
| Cargando | Número visible normal + punto en skeleton shimmer gris |

**REGLA B.22** — Pide la disponibilidad de TODO el mes en una sola petición al backend. NUNCA hagas una petición por día.

**REGLA B.23** — Recarga la disponibilidad del mes cuando: (a) el cliente cambia de mes, o (b) el cliente cambia de sucursal. En ningún otro caso.

## B.8 ESTADOS OBLIGATORIOS — tabla de casos

Implementa los 8 casos. No omitas ninguno.

| # | Situación | Qué mostrar exactamente |
|---|---|---|
| 1 | Cargando disponibilidad del mes | Calendario completo visible, con los puntos de disponibilidad en skeleton shimmer |
| 2 | Cargando servicios u horarios | 3 filas de skeleton con la forma de la tarjeta correspondiente |
| 3 | El mes completo no tiene disponibilidad | Mensaje: `Sin horarios disponibles en [mes]` + botón `Ver [mes siguiente]` |
| 4 | El día elegido no tiene horarios para el servicio elegido | Mensaje: `No hay horarios para este servicio el [día]` + 3 chips con los próximos días disponibles, formato `Mié 15 · 4 horarios`. Tocar un chip cambia la fecha y avanza al Paso 4 |
| 5 | El negocio no tiene servicios configurados | Mensaje: `Este negocio aún no tiene servicios disponibles para reservar en línea` + su número de teléfono como link `tel:` |
| 6 | La sucursal está temporalmente cerrada | Banner arriba del contenido, fondo `--warning` al 12%, borde izquierdo 3px `--warning`, texto explicativo |
| 7 | El horario se ocupó mientras el cliente llenaba sus datos | Al enviar: mensaje en `--danger` con texto `Ese horario acaba de ocuparse. Elige otro, por favor.` + regresa automáticamente al Paso 4 con los horarios recargados. **Este caso ocurre en producción con frecuencia — impleméntalo obligatoriamente** |
| 8 | Error de red al confirmar | Mensaje de error + botón `Reintentar` que CONSERVA todos los datos ya capturados. NUNCA vacíes el formulario |

## B.9 ANIMACIONES DEL PORTAL

| Elemento | Animación exacta |
|---|---|
| Transición entre pasos (avanzar) | El paso actual sale con `x: 0 → -40px` y `opacity: 1 → 0`. El nuevo entra con `x: 40px → 0` y `opacity: 0 → 1`. Duración 280ms, `--ease-out`. Usa Framer Motion `AnimatePresence` con `mode="wait"` |
| Transición entre pasos (retroceder) | Igual pero con los signos invertidos (sale hacia +40px, entra desde -40px) |
| Fila del ticket de resumen al llenarse | Componente `BlurText` de React Bits, una sola vez por fila |
| Chips de horario al aparecer | Stagger de 30ms entre chips. Cada uno: `opacity 0→1` y `y: 6px→0` |
| Puntos del calendario al cargar | Stagger de 15ms. Fade-in simple |
| Seleccionar día u horario | `scale: 0.96 → 1` en 120ms. SIN rebote |
| Cambio de sucursal | Los puntos del calendario hacen fade-out y fade-in (200ms). La cuadrícula NO se mueve |
| Barra de progreso del stepper | La línea conectora se llena de izquierda a derecha, 300ms |
| Pantalla de confirmación | Componente `Confetti` de Magic UI, UNA sola vez, 2 segundos |

**REGLA B.24** — NUNCA animes: el calendario completo al cambiar de mes (solo los puntos), ni las tarjetas de servicio con transformaciones 3D o rotaciones en hover. Este portal lo usan personas desde celulares modestos.

**REGLA B.25** — Si `prefers-reduced-motion: reduce` está activo: todas las transiciones se reducen a un fade de 100ms, y el confetti NO se dispara.

## B.10 PANTALLA DE CONFIRMACIÓN

Es el clímax temático: **el ticket finalmente impreso y emitido.**

Ocupa la pantalla completa (ya no hay wizard ni columnas). Fondo `--ink`.

Contenido, en orden vertical:

1. Ícono `CircleCheck` de lucide, 56px, color `--mint`. Entra con `scale: 0.6 → 1`, 400ms
2. Título: ES `¡Listo! Tu cita está confirmada.` / EN `Done! Your appointment is confirmed.` — Bricolage Grotesque 28px, color `--text-on-ink`
3. **El ticket** — clase `.ticket`, fondo `--paper-pure`, muescas en color `--ink`, ancho 400px (100% en mobile):
   - Encabezado: nombre del negocio (Bricolage Grotesque 18px) + sucursal (Inter 13px, `--text-muted`)
   - `.perforacion`
   - Servicio + duración
   - **Fecha y hora en Space Mono 22px peso 700** — es el dato más grande del ticket
   - Profesional asignado
   - Dirección, con link a Google Maps
   - `.perforacion`
   - Número de confirmación en Space Mono 13px, color `--text-muted`, formato `#AG-XXXXXX`
4. Botones, apilados con gap 8px, ancho 400px:
   - `Agregar a mi calendario` (primario) → genera y descarga un archivo `.ics`
   - `Ver ubicación` (secundario) → abre Google Maps
   - `Cancelar cita` (ghost, texto en `--danger`)
5. Aviso: ES `Te enviaremos un recordatorio por WhatsApp antes de tu cita.` — Inter 14px, color `--text-on-ink-soft`
6. Pie: `Reservas con agendur`

**REGLA B.26** — El botón `Cancelar cita` DEBE existir y ser visible. Esconderlo solo provoca llamadas telefónicas al negocio.

**REGLA B.27** — La confirmación por WhatsApp y/o correo se envía INMEDIATAMENTE al confirmar, con el mismo contenido del ticket. El cliente no debe depender de esta pantalla para recordar su cita.

## B.11 ACCESIBILIDAD DEL PORTAL

Este portal lo usan personas de todas las edades, muchas desde la calle con una sola mano.

1. Áreas táctiles mínimo 44×44px en todo (REGLA B.8)
2. El calendario se navega con teclado: flechas para moverse entre días, Enter para seleccionar
3. Cada celda del calendario lleva `aria-label` completo, ej. `Martes 14 de octubre, 6 horarios disponibles`
4. Cada cambio de paso se anuncia con `aria-live="polite"`
5. Contraste mínimo AA en TODO, incluyendo el color de acento del negocio
6. NUNCA uses solo color para indicar disponibilidad — el punto del calendario siempre va acompañado del `aria-label`
7. Todos los inputs con label visible (REGLA B.21) y `inputmode` correcto

## B.12 RENDIMIENTO DEL PORTAL

**REGLA B.28** — Objetivo: interactivo en menos de 2.5 segundos en conexión 4G. Este es el punto de entrada de clientes finales, muchos desde datos móviles.

**REGLA B.29** — NO uses componentes de fondo pesados de React Bits (`Squares`, `DotGrid`, `Noise`, `Aurora`) en el portal de reservas. Esos quedan reservados para las páginas de error.

**REGLA B.30** — Importa `Confetti` de Magic UI con `next/dynamic` y `ssr: false`. Solo debe descargarse al llegar a la confirmación.

---

# C. CHECKLIST FINAL DE VERIFICACIÓN

Marca cada punto antes de dar el trabajo por terminado.

**Páginas de error:**
- [ ] Las 4 páginas tienen fondo `--ink` sin toggle de tema
- [ ] Las 4 tienen al menos un botón de salida
- [ ] El botón "Ir a mi panel" del 404 solo aparece si hay sesión activa
- [ ] La página 403 NO tiene fondo animado
- [ ] La página 500 reporta el error a Sentry en un `useEffect`
- [ ] La página "Negocio no encontrado" NO enlaza a ninguna ruta interna del producto
- [ ] Las 4 tienen `noindex`
- [ ] `prefers-reduced-motion` desactiva todas las animaciones

**Portal de reservas:**
- [ ] Si el negocio tiene 1 sucursal, el Paso 1 no existe y el stepper muestra 4 pasos
- [ ] El selector de profesional está dentro del Paso 4 con "Cualquier profesional" preseleccionado
- [ ] Cambiar sucursal o fecha borra servicio y hora; cambiar servicio borra solo la hora
- [ ] El botón "Continuar" está deshabilitado mientras el paso esté incompleto
- [ ] Se puede regresar a pasos anteriores desde el stepper
- [ ] El calendario no permite navegar a meses pasados
- [ ] El calendario usa la cantidad real de días del mes
- [ ] La disponibilidad se pide por mes completo, no día por día
- [ ] Los 8 casos de la tabla B.8 están implementados, incluido el caso 7
- [ ] Todas las áreas táctiles miden 44×44px mínimo
- [ ] El ticket de resumen muestra líneas punteadas vacías para lo que falta
- [ ] El botón "Cancelar cita" existe en la confirmación
- [ ] La confirmación por WhatsApp/correo se envía de inmediato
- [ ] No se usan fondos pesados de React Bits en el portal
- [ ] El color de acento del negocio sale de un set cerrado de 12, sin color picker