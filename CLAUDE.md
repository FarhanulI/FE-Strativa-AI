# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)
- `npx tsc --noEmit` — type-check without emitting

There is no test setup in this project yet.

## Architecture

This is a Next.js 16.3.2 (App Router) app with React 19, TypeScript, and Tailwind CSS v4, implementing the **STRATIVA AI** frontend. Path alias `@/*` maps to the repo root (`tsconfig.json`).

Because this Next.js version is newer than this model's training data, **read the relevant page under `node_modules/next/dist/docs/` before implementing anything that touches routing, data fetching, layouts, or other framework APIs** — conventions here may differ from what you'd otherwise assume (see `AGENTS.md`, imported above). Note `RootLayout` (`app/layout.tsx`) takes `LayoutProps<"/">` — Next.js 16's generated typed route props — not a hand-written props interface; other page/layout files should follow the same pattern with the generated `PageProps<...>` / `LayoutProps<...>` types.

### BFF (Backend-for-Frontend) authentication architecture

The browser only ever talks to this Next.js app's own `/api/*` routes (same-origin). It never calls the FastAPI backend directly. Route Handlers proxy to the backend server-to-server and manage httpOnly cookies on this app's own domain. This split runs through three layers:

- **`lib/auth/session.ts`** (server-only, enforced via the `server-only` import) — reads/writes the two httpOnly auth cookies (`acs_access_token`, `acs_refresh_token`) via `next/headers` `cookies()` and `NextResponse`. Never import this into a Client Component. `setAuthCookies`/`clearAuthCookies` operate on a `NextResponse` (for Route Handlers); `getAccessToken`/`getRefreshToken` read the current request's cookies (for Server Components and Route Handlers).
- **`lib/api/backend-client.ts`** (server-only) — `serverFetch<T>()`, used only from Route Handlers/Server Components, calls `BACKEND_INTERNAL_URL` directly and attaches `Authorization: Bearer` when given an access token.
- **`lib/api/browser-client.ts`** — `clientFetch<T>()`, used only from Client Components, calls relative `/api/...` paths with `credentials: "include"` so this app's own httpOnly cookies flow automatically. It never talks to the backend directly.
- **`lib/api/errors.ts`** — shared `ApiError` class and `parseApiError()` helper used by both HTTP clients, so error shape is consistent whether the failure came from the backend (via `serverFetch`) or from this app's own API routes (via `clientFetch`).

Env vars: `BACKEND_INTERNAL_URL` (server-only, deliberately **not** `NEXT_PUBLIC_`-prefixed so it can never reach client bundles), `COOKIE_SECURE` (set `false` for local http dev), `REFRESH_TOKEN_TTL_DAYS`. See `.env.example`.

Route Handlers that actually proxy to the backend (`app/api/**/route.ts`) have not been built yet — only the shared infrastructure above exists so far.

### Data fetching / query client

`lib/query-client.tsx` exports `createQueryClient()` and a `QueryProvider` client component wrapping TanStack Query's `QueryClientProvider` (defaults: `retry: 1` for queries, `retry: false` for mutations, `staleTime: 30s`). A `QueryCache`/`MutationCache` `onError` normalizer detects `ApiError` with `status === 401` as a hook point for future session-expiry redirect handling (not yet wired to any redirect — see the TODO in that file). `QueryProvider` is not yet mounted in `app/layout.tsx`.

### Feature folder structure

Auth-related client code lives under `features/auth/`, separate from the shared BFF plumbing in `lib/`:

- `features/auth/types/index.ts` — `RegisterRequest`, `TokenResponse`, `WorkspaceSummary`, and a re-export of `ApiError`.
- `features/auth/components/` — feature-specific components (e.g. `sign-up.tsx`, rendered by `app/(auth)/signup/page.tsx`).
- `features/auth/api/`, `features/auth/hooks/` — scaffolded, not yet populated (register mutation hook and its API call are a future task).

New features that need their own types/hooks/components/API calls should follow this same `features/<name>/{api,hooks,types,components}` convention rather than growing the shared `lib/` or `components/` trees.

### UI components and design system

- `components/ui/` — generic, unbranded primitives (`Button`, `TextField`, `PasswordField`, `Checkbox`, `Divider`, `icons.tsx`).
- `components/auth/` — auth-specific presentational components (`AuthCard`, `TrustBadge`) shared across login/signup.
- `app/globals.css` — Tailwind v4 is imported via `@import "tailwindcss"` (no `tailwind.config.js`); the STRATIVA AI design system (Dark Slate Navy primary, Light Ash background, etc.) is defined as CSS custom properties and surfaced via `@theme inline`.
- `app/(auth)/` is a route group with a shared `layout.tsx` (header/footer chrome) for `/login` and `/signup`, so those routes get the auth shell without it affecting the URL path.
