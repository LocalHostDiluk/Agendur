# agendur — Skeletons, Pantallas de Carga y Confirmaciones
### Complemento de `sistema-diseno-agendur-dashboard.md` y `errores-y-portal-reservas-agendur.md`

Todo token no redefinido aquí (colores, radios, tiempos, fuentes) se hereda de esos dos documentos. No los repito completos, solo lo nuevo.

---

# 0. ALCANCE DE ESTE DOCUMENTO

| Sección | Cubre |
|---|---|
| 1 | Sistema base de skeleton (piezas reutilizables) |
| 2 | Skeletons específicos: Dashboard interior, Portal de reservas, Landing |
| 3 | Pantallas de carga para procesos que tardan (pago, reporte, reserva) |
| 4 | Diálogos de confirmación con personalidad (logout, eliminar, cancelar, descartar cambios) |

**Fuera de alcance a propósito:** pantalla de carga de verificación de sesión y barra de transición entre rutas — no se pidieron en esta ronda. Cuando se necesiten, el patrón de `loading.tsx` de la sección 1.3 ya cubre la base técnica.

---

# 1. SISTEMA BASE DE SKELETON

## 1.1 Piezas reutilizables

Construye 3 componentes base y arma todo lo demás combinándolos. No construyas un skeleton distinto para cada pantalla desde cero.

```css
.skel-block, .skel-text, .skel-circle {
  background: var(--surface-alt); /* #F0ECE0 claro / #241D2C oscuro */
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-sm);
}
.skel-circle { border-radius: 50%; }

.skel-block::after, .skel-text::after, .skel-circle::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.35) 50%,
    transparent 100%
  );
  animation: skel-shimmer 1.4s ease-in-out infinite;
}
/* Sobre fondo oscuro, cambia el gradiente a: rgba(255,255,255,0.08) */

@keyframes skel-shimmer {
  100% { transform: translateX(100%); }
}
```

| Pieza | Uso |
|---|---|
| `.skel-block` | Cualquier rectángulo: tarjeta, gráfica, imagen, botón |
| `.skel-text` | Línea de texto. Alto 12–16px según el texto que reemplaza, ancho variable (nunca 100% en todas las líneas — varía 60–90% para que se vea como texto real) |
| `.skel-circle` | Avatar, ícono, logo |

## 1.2 Reglas de tiempo (obligatorias)

**REGLA S.1** — Si los datos llegan en menos de 200ms, NO muestres el skeleton en absoluto. Renderiza el contenido directo. Un skeleton que aparece y desaparece en un parpadeo es peor que no tener skeleton.

**REGLA S.2** — Si el skeleton ya se mostró, debe quedarse visible un MÍNIMO de 400ms aunque los datos lleguen antes. Evita el parpadeo contrario (skeleton que se ve una fracción de segundo).

**REGLA S.3** — Implementación: un `setTimeout` de 200ms antes de mostrar el skeleton, y si se muestra, un `setTimeout` de 400ms mínimo antes de poder ocultarlo. Son dos temporizadores independientes, no uno solo.

## 1.3 Patrón técnico en Next.js

| Situación | Mecanismo |
|---|---|
| Primera carga de una página completa (ej. entrar a "Reportes" por primera vez) | Archivo `loading.tsx` en la carpeta de la ruta — Next.js lo muestra automáticamente mientras el Server Component carga |
| Recarga parcial de un solo componente (ej. refrescar una sola KPI card sin recargar la página) | Estado local `isLoading` en el componente, con las REGLAS S.1–S.3 aplicadas manualmente vía los dos `setTimeout` |

**REGLA S.4** — Cada `loading.tsx` de ruta debe replicar la ESTRUCTURA real de esa página (mismo grid, mismo número de tarjetas), no un spinner genérico centrado. El objetivo es que el layout no salte cuando el contenido real reemplaza al skeleton.

---

# 2. SKELETONS POR SUPERFICIE

## 2.1 Dashboard interior

| Componente | Skeleton |
|---|---|
| KPI card | `.skel-text` de 60px×12px (label) + `.skel-block` de 120px×32px (cifra grande) + `.skel-block` de 50px×16px (indicador de tendencia) |
| Fila de tabla | Una fila de 48px de alto con 4–5 `.skel-text` de anchos distintos (40%, 70%, 30%, 50%), simulando columnas |
| Gráfica | Un solo `.skel-block` del tamaño exacto del contenedor de la gráfica (sin intentar simular barras o líneas) |
| Calendario de Agenda | Igual que el calendario del portal (ver 2.2): números normales, puntos de disponibilidad en `.skel-circle` de 4px |
| Selector de sucursal (sidebar) | Solo si la lista de sucursales aún no cargó: `.skel-text` de 80px×14px reemplazando el nombre. El resto del sidebar NUNCA lleva skeleton — es contenido estático que ya se conoce al autenticar |

**REGLA S.5** — El sidebar, salvo el selector de sucursal, NUNCA muestra skeleton. Su contenido es fijo y ya se conoce apenas hay sesión.

## 2.2 Portal de reservas del cliente final

Ya cubierto parcialmente en `errores-y-portal-reservas-agendur.md` (tabla B.8, filas 1–2). Lo único que faltaba:

| Momento | Skeleton |
|---|---|
| Cargando el negocio (antes de saber si existe — primer instante al abrir el link) | En el lugar del logo: `.skel-circle` 48px. En el lugar del nombre: `.skel-text` 140px×20px. La Zona fija (calendario) se muestra ya con su estructura completa pero sin puntos, en skeleton, para que la página nunca se sienta vacía mientras se resuelve si el negocio existe |
| Calendario cargando disponibilidad del mes | Números del calendario visibles y normales, solo los puntos de disponibilidad en `.skel-circle` de 4px |
| Servicios cargando | 3 `.skel-block` con la forma exacta de la tarjeta de servicio (mismo alto, mismo padding) |

**REGLA S.6** — Si tras cargar resulta que el negocio no existe, el skeleton del encabezado se reemplaza por la página `[negocio]/not-found.tsx` ya definida — nunca se queda el skeleton congelado.

## 2.3 Landing page

La landing es mayormente contenido estático (copy fijo, imágenes del build). Solo necesita skeleton en 2 puntos, y solo si esos datos vienen de una consulta en vivo:

| Elemento | ¿Cuándo aplica el skeleton? | Skeleton |
|---|---|---|
| Cifras de la franja de métricas (`+500 negocios`, `-30% inasistencias`) | Solo si estos números se consultan en vivo a la base de datos. Si están hardcodeados en el build, **omite esta fila por completo** | `.skel-text` de 80px×32px reemplazando el número, antes de que entre el `NumberTicker` |
| Tarjetas de testimonios | Solo si los testimonios vienen de un CMS externo. Si están hardcodeados, **omite esta fila** | 3 `.skel-circle` (avatar) + 2 `.skel-text` por tarjeta |

**REGLA S.7** — No agregues skeleton a ninguna otra parte de la landing. El hero, el bento de diferenciadores, la tabla de precios y el FAQ son contenido estático — un skeleton ahí sería una animación sin ningún propósito real.

---

# 3. PANTALLAS DE CARGA PARA PROCESOS QUE TARDAN

Esto es distinto al skeleton: aquí no hay nada que "previsualizar" en forma, porque no es contenido que se está cargando — es un proceso que está ocurriendo (un pago, un reporte generándose, una reserva confirmándose). Por eso el tratamiento es otro: un componente único, reutilizado en los 3 casos, con personalidad de marca — porque son momentos poco frecuentes.

## 3.1 Componente `ProcessingOverlay` — especificación única

**Estructura, de arriba a abajo, dentro de una tarjeta con clase `.ticket`:**

1. Fondo del overlay: `rgba(29,23,32,0.85)` (--ink al 85%) cubriendo toda la pantalla o todo el modal contenedor
2. Tarjeta `.ticket`, `--paper-pure`, ancho 320px, centrada
3. Indicador de actividad: 3 cuadrados redondeados de 8×8px, `border-radius: 3px`, color `--grape`, en fila con gap 6px. Cada uno pulsa opacidad `0.3 → 1 → 0.3` en 900ms, con un desfase de 200ms entre cuadrado y cuadrado (el segundo empieza 200ms después que el primero, el tercero 400ms después). Loop infinito
4. Texto de estado, Inter 14px, color `--text-secondary`, centrado, margen superior 16px — este texto CAMBIA cada 1800ms, recorriendo la lista de mensajes de la tabla 3.2, con un crossfade de 200ms entre uno y otro
5. `.perforacion`
6. Texto de ayuda fijo: ES `Esto puede tardar unos segundos.` / EN `This may take a few seconds.` — Inter 12px, `--text-muted`

**Dos variantes de contenedor:**
- **Modal** (dashboard: pago, reporte): la tarjeta aparece centrada sobre un overlay que cubre solo el viewport, con fade + scale 95%→100% en 200ms (mismo patrón que los modales del dashboard)
- **Pantalla completa** (portal: procesar reserva): la tarjeta aparece centrada sobre fondo `--ink` a pantalla completa, sin mostrar el contenido de atrás

## 3.2 Mensajes por proceso (ES / EN)

| Proceso | Contexto | Mensajes (en orden, se repiten en loop si el proceso tarda más) |
|---|---|---|
| Confirmar pago | Modal, dashboard | ES: "Verificando datos de pago…" → "Procesando con la pasarela…" → "Confirmando transacción…" / EN: "Verifying payment details…" → "Processing with the gateway…" → "Confirming transaction…" |
| Generar reporte | Modal, dashboard | ES: "Recopilando datos…" → "Calculando métricas…" → "Preparando tu archivo…" / EN: "Gathering data…" → "Calculating metrics…" → "Preparing your file…" |
| Procesar reserva | Pantalla completa, portal | ES: "Verificando disponibilidad…" → "Confirmando con el negocio…" → "Enviando tu confirmación…" / EN: "Checking availability…" → "Confirming with the business…" → "Sending your confirmation…" |

## 3.3 Reglas de comportamiento

**REGLA C.1** — Duración mínima total: 1200ms, aunque el proceso real termine antes. Evita que el overlay aparezca y desaparezca como un parpadeo — rompe la sensación de "algo importante está pasando".

**REGLA C.2** — Si el proceso tarda más de 8 segundos, deja de recorrer la lista de mensajes normales y muestra de forma fija: ES `Esto está tardando más de lo normal, pero seguimos en eso.` / EN `This is taking longer than usual, but we're still on it.` — nunca dejes al usuario viendo el mismo mensaje sin explicación cuando algo se sale de lo esperado.

**REGLA C.3** — Al terminar con éxito: el contenido de la tarjeta hace crossfade (200ms) hacia un ícono `CircleCheck` en `--mint` + texto ES `¡Listo!` / EN `Done!`, se mantiene 800ms, y luego el overlay se cierra o navega al siguiente paso (ej. la pantalla de confirmación del portal).

**REGLA C.4** — Al fallar: crossfade hacia ícono `CircleAlert` en `--danger` + mensaje de error específico + botón `Reintentar`, que relanza el mismo proceso sin perder los datos ya capturados (mismo principio que el caso 8 de la tabla B.8 del portal).

**REGLA C.5** — Si `prefers-reduced-motion: reduce` está activo, los 3 cuadrados no pulsan — se muestran estáticos en opacidad 0.6, y el texto de estado sigue cambiando (eso es información, no decoración, así que no se desactiva).

---

# 4. DIÁLOGOS DE CONFIRMACIÓN — sistema de 2 niveles

Regla general de cuándo cada nivel aplica: si la acción es rara Y tiene consecuencias reales, se gana el derecho a tener personalidad y peso visual — es la misma lógica que ya usamos en las páginas de error y el registro. Pero "personalidad" no significa lo mismo en los dos niveles.

## 4.1 Clasificación de las 6 acciones pedidas

| Acción | Nivel | Por qué |
|---|---|---|
| Cerrar sesión | 1 — Simple | Reversible en un clic, cero pérdida de datos |
| Cancelar una cita | 1 — Simple, pero con consecuencia hacia un tercero | Afecta al cliente final, por eso el botón de confirmar sí es `--danger` aunque el diálogo sea Nivel 1 |
| Descartar cambios sin guardar | 1 — Simple | Reversible: basta con no salir y volver a editar |
| Eliminar sucursal / servicio / personal | 2 — Crítica | Pérdida de datos y efectos en cascada (citas, accesos) |
| Eliminar cuenta completa del negocio | 2 — Crítica | Irreversible, pérdida total |
| Cancelar el plan de suscripción | 2 — Crítica en el contenido, pero SIN fricción de escritura | Tiene consecuencias reales de funcionalidad, pero es reversible (se puede volver a suscribir) |

**REGLA D.1** — Subir de plan (upgrade) NUNCA usa estos diálogos — no tiene consecuencias negativas que confirmar.

## 4.2 Nivel 1 — Confirmación simple

**Estructura:** modal `max-width: 400px`, construido sobre el plugin `Overlay` de Preline (`HSOverlay`), entrada fade + scale 95%→100% en 200ms (mismo patrón de `sistema-diseno-agendur-dashboard.md`, sección 5.10).

1. Ícono ilustrativo arriba, 40px, relacionado a la acción, color `--grape` (o `--danger` si el botón de confirmar es `--danger`)
2. Título con personalidad — texto específico, nunca "¿Estás seguro?"
3. Descripción de una línea
4. Dos botones en fila: `Cancelar` (ghost, es el foco por defecto) + botón de acción

### Copy exacto:

**Cerrar sesión**
- Ícono: `LogOut`
- Título ES: `¿Ya te vas?` / EN: `Heading out?`
- Descripción ES: `Vas a cerrar tu sesión. Puedes volver cuando quieras.` / EN: `You're about to log out. Come back anytime.`
- Botón confirmar: ES `Cerrar sesión` / EN `Log out` — color `--grape` (NO es destructivo)

**Cancelar una cita**
- Ícono: `CalendarX`
- Título ES: `¿Cancelar esta cita?` / EN: `Cancel this appointment?`
- Descripción ES: `Le avisaremos al cliente por WhatsApp que su cita fue cancelada.` / EN: `We'll let the client know via WhatsApp that their appointment was canceled.`
- Botón confirmar: ES `Sí, cancelar cita` / EN `Yes, cancel it` — color `--danger` (afecta a un tercero)

**Descartar cambios sin guardar**
- Ícono: `FileWarning`
- Título ES: `Tienes cambios sin guardar` / EN: `You have unsaved changes`
- Descripción ES: `Si sales ahora, vas a perder lo que modificaste.` / EN: `If you leave now, you'll lose what you changed.`
- Botones: ES `Seguir editando` (ghost, foco por defecto) / `Descartar cambios` (texto `--danger`, sin fondo)

## 4.3 Nivel 2 — Confirmación crítica

**Estructura:** modal `max-width: 460px`, borde superior de 3px sólido `--danger`.

1. Ícono `TriangleAlert` de lucide, 40px, color `--danger`
2. Título directo — aquí NO va personalidad juguetona. Misma lógica que la página de error 403: la seriedad es intencional
3. Lista de consecuencias específicas (bullets), nunca un genérico "esta acción no se puede deshacer"
4. Campo de texto: el usuario debe escribir un valor EXACTO para habilitar el botón de confirmar
5. Dos botones: `Cancelar` (ghost, foco por defecto) + botón de confirmar (`--danger`, DESHABILITADO hasta que el texto coincida)

**REGLA D.2** — El botón de confirmar de un diálogo Nivel 2 puede llevar la clase `.btn-ticket` (la muesca semicircular). Esto AMPLÍA la lista de usos autorizados de la Técnica 4 en `errores-y-portal-reservas-agendur.md` (antes solo páginas de error + confirmación del portal) — se justifica porque son acciones igual de raras e importantes.

**REGLA D.3** — El foco por defecto al abrir el diálogo SIEMPRE va en el botón `Cancelar`, nunca en el de confirmar — para que presionar Enter por accidente no dispare la acción destructiva.

### Copy exacto:

**Eliminar sucursal**
- Título ES: `Vas a eliminar [nombre de la sucursal]` / EN: `You're about to delete [branch name]`
- Consecuencias:
  - ES `Se cancelarán todas las citas futuras de esta sucursal` / EN `All future appointments at this location will be canceled`
  - ES `El personal asignado perderá acceso a este panel` / EN `Assigned staff will lose access to this dashboard`
  - ES `No podrás recuperar el historial de esta sucursal` / EN `You won't be able to recover this location's history`
- Campo: ES `Escribe el nombre de la sucursal para confirmar` / EN `Type the location's name to confirm` — debe coincidir exacto con el nombre real
- Botón: ES `Eliminar sucursal` / EN `Delete location`

**Eliminar servicio**
- Título ES: `Vas a eliminar [nombre del servicio]`
- Consecuencias:
  - ES `Las citas futuras con este servicio deberán reasignarse manualmente`
  - ES `Los clientes ya no podrán reservarlo en tu portal público`
- Campo: nombre del servicio
- Botón: ES `Eliminar servicio` / EN `Delete service`

**Eliminar miembro del personal**
- Título ES: `Vas a eliminar a [nombre] del equipo`
- Consecuencias:
  - ES `Perderá acceso inmediato al panel`
  - ES `Sus citas futuras deberán reasignarse a otro miembro del equipo`
- Campo: nombre de la persona
- Botón: ES `Eliminar del equipo` / EN `Remove from team`

**Eliminar cuenta completa del negocio** (la más grave de las 6)
- Título ES: `Vas a eliminar tu cuenta de [nombre del negocio]` / EN: `You're about to delete your [business name] account`
- Consecuencias:
  - ES `Se eliminarán todas tus sucursales, servicios y el historial completo de citas`
  - ES `Tu portal de reservas dejará de funcionar de inmediato`
  - ES `Esta acción no se puede deshacer`
- Campo: ES `Escribe el nombre completo de tu negocio para confirmar` — usa el nombre real del negocio, NUNCA una palabra genérica como "ELIMINAR" — es más específico y evita confirmaciones accidentales por copiar y pegar
- Botón: ES `Eliminar mi cuenta` / EN `Delete my account`

**Cancelar plan de suscripción**
- Título ES: `Vas a cancelar tu plan [nombre del plan]` / EN: `You're about to cancel your [plan name] plan`
- Consecuencias (dinámicas según el plan actual, ejemplo con Pro):
  - ES `Perderás acceso a gestión multi-sucursal y pagos en línea`
  - ES `Tu cuenta pasará al plan gratuito el [fecha de fin del periodo actual]`
- **Sin campo de escritura** — es reversible, el usuario puede volver a suscribirse cuando quiera. Solo dos botones claros: ES `Seguir con mi plan` (ghost, foco por defecto) / `Cancelar plan` (`--danger`)

---

# 5. CHECKLIST FINAL

**Skeletons:**
- [ ] Ningún skeleton aparece si los datos llegan en menos de 200ms
- [ ] Todo skeleton que se muestra dura mínimo 400ms
- [ ] Cada `loading.tsx` de ruta replica la estructura real de esa página, no un spinner genérico
- [ ] El sidebar del dashboard nunca lleva skeleton, salvo el selector de sucursal
- [ ] La landing solo tiene skeleton en métricas/testimonios SI esos datos son dinámicos — si son estáticos, no hay skeleton ahí

**Pantallas de carga:**
- [ ] El `ProcessingOverlay` dura mínimo 1200ms aunque el proceso real sea más rápido
- [ ] Pasados 8 segundos, cambia a un mensaje fijo de "esto está tardando más de lo normal"
- [ ] El estado de éxito y el de error están implementados, no solo el de carga
- [ ] El botón de reintentar en caso de error conserva los datos ya capturados
- [ ] `prefers-reduced-motion` detiene el pulso de los cuadrados pero el texto de estado sigue cambiando

**Confirmaciones:**
- [ ] Las 6 acciones están clasificadas en su nivel correcto (tabla 4.1)
- [ ] Ningún diálogo usa el texto genérico "¿Estás seguro?"
- [ ] El foco por defecto en TODOS los diálogos va en "Cancelar", nunca en la acción destructiva
- [ ] El botón de confirmar de los diálogos Nivel 2 está deshabilitado hasta que el texto escrito coincida exactamente
- [ ] "Eliminar cuenta" pide el nombre real del negocio, no una palabra genérica
- [ ] "Cancelar plan" no pide campo de escritura, por ser reversible
- [ ] Los diálogos Nivel 2 no llevan personalidad juguetona en el copy — la seriedad es intencional
