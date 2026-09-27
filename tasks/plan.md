# Plan: Fix Landing Page Navbar Language Selector

## Problem
In the landing page navbar, the language selector buttons do not show their active/selected state properly. Specifically, `.language-switch button` in `apps/web/app/globals.css` declares `background: transparent;` with specificity `(0, 1, 1)`, which unconditionally overrides the Tailwind utility classes `bg-ink` (or `bg-paper`) with specificity `(0, 1, 0)`. As a result, the active button (`ES` or `EN`) has a transparent background, causing its light text (`text-paper` / `#f3eedf`) to be completely invisible against the navbar's light background (`bg-paper` / `#f3eedf`).

## Solution (Ponytail Ultra)
Apply the minimal root-cause deletion fix:
1. In `apps/web/app/globals.css`, delete `background: transparent;` from `.language-switch button` and align padding with the landing design (`0.45rem 0.6rem`), allowing Tailwind background utility classes to apply unimpeded.
2. In `apps/web/components/landing/Navbar.tsx`, clean up any redundant or conflicting styles on `LanguageSwitch` to ensure high contrast, proper active pill indication (`bg-ink text-paper` for light mode, `bg-paper text-ink` when inverted), and proper alignment in mobile drawer.
3. Verify with existing suite (`bun test apps/web/tests/landing.test.ts`).

## Task List
- [ ] Task 1: Remove `background: transparent` override and adjust button padding in `apps/web/app/globals.css`
- [ ] Task 2: Refine `LanguageSwitch` styling in `apps/web/components/landing/Navbar.tsx` for desktop and mobile
- [ ] Task 3: Run test suite to verify no regressions in landing components

## Checkpoint: Verification
- [ ] All tests in `apps/web/tests/landing.test.ts` pass cleanly
- [ ] Language switch active state has visible background and high contrast text

