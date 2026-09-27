# Tasks: Fix Landing Page Navbar Language Selector

## Task 1: Remove `background: transparent` override from `apps/web/app/globals.css`

**Description:** Delete `background: transparent;` from `.language-switch button` in `apps/web/app/globals.css` so that Tailwind background utilities (`bg-ink`, `bg-paper`, hover states) can apply with normal specificity, and set padding to `0.45rem 0.6rem`.

**Acceptance criteria:**

- [x] `.language-switch button` no longer overrides active or hover background colors with `background: transparent`.
- [x] Button sizing matches the landing design specification.

**Verification:**

- [x] Manual check: CSS inspection confirms `.bg-ink` is applied and not overridden.
- [x] Build/lint succeeds without syntax errors in `globals.css`.

**Dependencies:** None

**Files likely touched:**

- `apps/web/app/globals.css`

**Estimated scope:** XS (1 file)

---

## Task 2: Validate and refine `LanguageSwitch` in `apps/web/components/landing/Navbar.tsx`

**Description:** Ensure `LanguageSwitch` in `apps/web/components/landing/Navbar.tsx` cleanly renders the active language pill with high-contrast text (`bg-ink text-paper` in regular navbar, `bg-paper text-ink` when inverted) and displays appropriately in both desktop and mobile views.

**Acceptance criteria:**

- [x] Active language button renders with visible contrasting background (`bg-ink text-paper`).
- [x] Inactive language button has visible text with hover styling.
- [x] Selector renders correctly in desktop navbar and mobile drawer.

**Verification:**

- [x] Tests pass: `bun test apps/web/tests/landing.test.ts`

**Dependencies:** Task 1

**Files likely touched:**

- `apps/web/components/landing/Navbar.tsx`

**Estimated scope:** XS (1 file)

---

## Task 3: Regression verification across landing test suite

**Description:** Run automated tests for all landing page components to ensure zero regressions across navigation, translations, and theme providers.

**Acceptance criteria:**

- [x] All 14 tests in `apps/web/tests/landing.test.ts` pass cleanly.

**Verification:**

- [x] Command: `bun test apps/web/tests/landing.test.ts`

**Dependencies:** Task 1, Task 2

**Files likely touched:**

- None (verification only)

**Estimated scope:** XS (0 files)

---

## Checkpoint: Done

- [x] All tasks completed
- [x] Language switch visually clear and readable
- [x] Automated tests pass
