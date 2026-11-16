# lista de bugs encontrados a solucionar 

- [x] **Bug 1 — el que te está bloqueando ahora (Resuelto)**
  File name typo: `BenifitCard.tsx` should be `BenefitCard.tsx`.
  - `index.ts:5` exports `"./BenefitCard"` → module not found.
  - `BenefitsGrid.tsx` imports `"./BenifitCard"` (resolves, but keeps the typo).
  - **Estado:** Archivo renombrado a `BenefitCard.tsx` y referencias unificadas en `index.ts` y `BenefitsGrid.tsx`.

- [x] **Bug 2 — el siguiente que revienta en cuanto arregles el 1 (Resuelto)**
  `BenefitsGrid.tsx` line: `const cards = t.benefits.card;` → should be `t.benefits.cards` (plural). Otherwise `cards` is `undefined` and `.map` throws `Cannot read properties of undefined (reading 'map')`.
  - **Estado:** Corregido a `const cards = t.benefits.cards;` en `BenefitsGrid.tsx`.

- [x] **Bug 3 — el más grave, y NO aparece en el log (Resuelto)**
  The `benefits` object was only added to the `en` block. `es` had NO `benefits` (o contenía textos placeholder de prueba). Default lang is `es` (`LandingLanguageContext.tsx:21`).
  - **Estado:** Bloque `es.benefits` completado en `apps/web/lib/landing-i18n.ts` con el copy profesional equivalente a `en.benefits` (sin textos de prueba `"dice DJ"` ni cuponera).

- [x] **Bug 4 — EN nav en minúscula (Resuelto)**
  Line 329: `benefits: "benefits"` → should be `"Benefits"`.
  - **Estado:** Corregido a `benefits: "Benefits"` en `en.nav` dentro de `apps/web/lib/landing-i18n.ts`.

- [x] **Bug 5 — `${shape}` literal en el DOM (Resuelto)**
  `BenefitCard.tsx:25` uses single quotes `'... ${shape}'` instead of backticks. The clip-path classes never get applied; instead the literal text `${shape}` shows inside the class attribute.
  - **Estado:** Convertido a template literal `` `flex min-h-[260px] flex-col justify-between bg-ink p-7 text-paper sm:p-8 ${shape}`.trim() `` en `BenefitCard.tsx`.

- [x] **Bug 6 — import sin usar que rompe lint (Resuelto)**
  `BenefitCard.tsx:3` imports `{ Icon, type LucideIcon }` but `Icon` is shadowed by the destructured `icon: Icon`. The value import is unused → eslint error.
  - **Estado:** Reemplazado por `import { type LucideIcon } from "lucide-react";` y eliminados comentarios informales `//DJ say:` en los archivos de `beneficios/`.
