<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Package Manager

**Bun** only (`packageManager: "bun@1.3.14"` in `package.json`, lockfile is `bun.lock`). Do not use npm/yarn/pnpm.

## Commands

- `bun run dev` — dev server on :3000
- `bun run build` — production build
- `bun run lint` — ESLint (flat config, no separate typecheck script)
- No test runner is configured.

## Stack

- **Next.js 16.3.4** — APIs differ from training data; read `node_modules/next/dist/docs/` before modifying framework code.
- **React 19** — `params` in dynamic routes is a `Promise` (see `app/blog/[slug]/page.tsx:5`).
- **Tailwind CSS v4** — no `tailwind.config.js`. Config lives in `app/globals.css` via `@theme inline`. Import with `@import "tailwindcss"`.
- **ESLint 9 flat config** — `eslint.config.mjs` uses `defineConfig`/`globalIgnores`, not `.eslintrc`.
- **`LayoutProps` type** — layout components use `LayoutProps<"/">` for typing, not `{ children: React.ReactNode }`.
- **`sharp` and `unrs-resolver`** must remain in both `ignoreScripts` and `trustedDependencies` in `package.json`.

## Structure

- `app/` — App Router pages
- `lib/` — shared data/logic
- `public/` — static assets
- `@/*` path alias → project root
