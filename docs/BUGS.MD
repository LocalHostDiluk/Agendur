# lista de bugs encontrados a solucionar 

Bug 1 — el que te está bloqueando ahora
File name typo: BenifitCard.tsx should be BenefitCard.tsx.
- index.ts:5 exports "./BenefitCard" → module not found.
- BenefitsGrid.tsx imports "./BenifitCard" (resolves, but keeps the typo).
Fix: rename file, then fix both references.

Bug 2 — el siguiente que revienta en cuanto arregles el 1
BenefitsGrid.tsx line: const cards = t.benefits.card; → should be t.benefits.cards (plural). Otherwise cards is undefined and .map throws Cannot read properties of undefined (reading 'map').

Bug 3 — el más grave, y NO aparece en el log
The benefits object was only added to the en block (line 414). es (lines 4-318) has NO benefits. Default lang is es (LandingLanguageContext.tsx:21), so t.benefits.badge → Cannot read properties of undefined (reading 'badge') → whole landing 500s.
Also LandingLanguageContext.tsx:9 types t as (typeof landingCopy)["es"] → tsc will flag t.benefits as non-existent.

Bug 4 —EN nav en minúscula
Line 328: benefits: "benefits" → should be "Benefits".

Bug 5 — ${shape} literal en el DOM
BenifitCard.tsx:25 uses single quotes '... ${shape}' instead of backticks. The clip-path classes never get applied; instead the literal text ${shape} shows inside the class attribute. Fix to backticks.

Bug 6 — import sin usar que rompe lint
BenifitCard.tsx:3 imports { Icon, type LucideIcon } but Icon is shadowed by the destructured icon: Icon. The value import is unused → eslint error. Should be import type { LucideIcon } from "lucide-react";

Let me now write the fix plan with exact edits.

For Bug 3, I need to give them the ES benefits block to insert between features (ends line 134ish) and socialProof (line 136). Let me confirm where ES features ends. Line 63 features: {, line 136 socialProof: {. So ES benefits goes right before line 136, i.e., after the }, that closes features.
