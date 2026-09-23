# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)

There is no test setup in this project yet.

## Architecture

This is a freshly bootstrapped `create-next-app` project using **Next.js 16.3.2** (App Router) with React 19, TypeScript, and Tailwind CSS v4. Almost nothing has been customized yet:

- `app/layout.tsx` / `app/page.tsx` — root layout and home page, still the default template content.
- `app/globals.css` — Tailwind v4 is imported via `@import "tailwindcss"` (no `tailwind.config.js`); theme tokens are defined with `@theme inline` and CSS custom properties (`--background`, `--foreground`, Geist fonts).
- Path alias `@/*` maps to the repo root (`tsconfig.json`).
- `RootLayout` takes `LayoutProps<"/">` — Next.js 16's generated typed route props (from `.next/types`), not a hand-written props interface. Page/layout files elsewhere should use the equivalent generated `PageProps<...>` / `LayoutProps<...>` types rather than defining ad hoc prop types.

Because this Next.js version is newer than this model's training data, **read the relevant page under `node_modules/next/dist/docs/` before implementing anything that touches routing, data fetching, layouts, or other framework APIs** — conventions here may differ from what you'd otherwise assume (see `AGENTS.md`, imported above).
