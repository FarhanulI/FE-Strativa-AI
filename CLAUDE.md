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
- **`lib/api/backend-client.ts`** (server-only) — `serverFetch<T>()`, used from Route Handlers/Server Components, calls `BACKEND_INTERNAL_URL` directly, attaches `Authorization: Bearer` when given an access token, and parses the JSON body / throws `ApiError` on non-2xx. `serverFetchRaw()` is a sibling for callers that need to return the backend's `Response` object unchanged instead (status passthrough, e.g. a bare 401) — it sets no default `Content-Type`, so a caller can forward a `FormData` body and let `fetch` set its own multipart boundary.
- **`lib/api/browser-client.ts`** — `clientFetch<T>()`, used only from Client Components, calls relative `/api/...` paths with `credentials: "include"` so this app's own httpOnly cookies flow automatically. It never talks to the backend directly. Skips the default `Content-Type: application/json` header when the body is a `FormData` instance (needed for file uploads), otherwise behaves identically for existing JSON callers. **Silent refresh:** any 401 (except from `/api/auth/*`) triggers one call to `/api/auth/refresh` via a module-level singleton promise (plus a `navigator.locks` lock across tabs), then retries the original request exactly once. Concurrent refreshes must never happen — the backend's refresh-token rotation treats a losing concurrent refresh as a replay and revokes the whole session. If the refresh fails or the retry also 401s, `handleSessionExpired()` (`lib/auth/session-events.ts`) clears the query cache and hard-navigates to `/login`, and the 401 `ApiError` is still thrown to the caller.
- **`lib/auth/session-events.ts`** — client-safe `handleSessionExpired()` (no-op on `/login`/`/signup`, fires once per page load). Uses `window.location.assign` because there's no out-of-component router.
- **`lib/api/errors.ts`** — shared `ApiError` class and `parseApiError()` helper used by both HTTP clients, so error shape is consistent whether the failure came from the backend (via `serverFetch`) or from this app's own API routes (via `clientFetch`).

Env vars: `BACKEND_INTERNAL_URL` (server-only, deliberately **not** `NEXT_PUBLIC_`-prefixed so it can never reach client bundles), `COOKIE_SECURE` (set `false` for local http dev), `REFRESH_TOKEN_TTL_DAYS`. See `.env.example`.

`app/api/auth/{login,register,refresh,logout}/route.ts` (refresh clears cookies on a backend 401; logout always clears cookies and returns 200, only logging a backend failure) and `app/api/onboarding/**/route.ts` (8 endpoints) are the Route Handlers built on top of this infrastructure so far — thin pass-throughs that read the access token, call the backend, and forward the response. A feature-specific proxy helper (e.g. `lib/api/onboarding-proxy.ts`, wrapping `serverFetchRaw` with the feature's base path and its own 401-without-a-token short-circuit) is the pattern to follow for a new backend-contract surface, rather than calling `serverFetch`/`serverFetchRaw` directly from each Route Handler.

### Data fetching / query client

`lib/query-client.tsx` exports `createQueryClient()`, `getQueryClient()` (a browser-side singleton, so non-component code can reach the same instance), and a `QueryProvider` client component wrapping TanStack Query's `QueryClientProvider` (defaults: `retry: 1` for queries, `retry: false` for mutations, `staleTime: 30s`), mounted in `app/layout.tsx`. The `QueryCache`/`MutationCache` `onError` normalizer's 401 branch is intentionally a no-op, because session expiry is already handled inside `clientFetch`.

Mutation hooks that invalidate a query the UI redirects on immediately after (e.g. `onSuccess: () => router.push(...)`) must `return` the `invalidateQueries(...)` call, not just invoke it as a statement — TanStack only awaits a hook-level `onSuccess` if it returns a promise, and a caller's own `onSuccess` (passed to `.mutate()`) otherwise fires before the refetch lands, so the destination page can briefly render stale state. See `features/onboarding/hooks/use-update-*.ts` for the pattern.

### Feature folder structure

Feature-specific client code lives under `features/<name>/{api,hooks,types,components}`, separate from the shared BFF plumbing in `lib/` and the generic primitives in `components/ui/`. Two features exist so far:

- **`features/auth/`** — `types/index.ts` (`RegisterRequest`/`LoginRequest`/`TokenResponse`/`WorkspaceSummary`, re-exports `ApiError`), `api/` + `hooks/` (one file per endpoint, e.g. `register.ts`/`use-register.ts`), `components/` (`sign-up.tsx`, `sign-in.tsx`, rendered by `app/(auth)/{signup,login}/page.tsx`).
- **`features/onboarding/`** — the fuller reference example for this convention: `types/index.ts` mirrors the backend's onboarding contract; `api/onboarding.ts` has one `clientFetch` wrapper per endpoint; `hooks/` has `use-onboarding-state.ts` (query) plus one mutation hook per write endpoint, all invalidating a single shared `ONBOARDING_STATE_QUERY_KEY` (`hooks/query-keys.ts`); `components/` holds one subfolder per wizard step (`basic/`, `experience/`, `identity/`, `audience/`, `brand-voice/`, `goals/`) plus shared step chrome (`onboarding-form-header.tsx`, `onboarding-progress.tsx`, `onboarding-suggestion-chips.tsx`) and the wizard shell itself, `onboarding-guard.tsx`.

New features needing their own types/hooks/components/API calls should follow this same convention rather than growing the shared `lib/` or `components/` trees.

### Onboarding wizard shell

`app/onboarding/*` (no route group — plain nested routes, each a thin `page.tsx` rendering its `features/onboarding/components/<step>/` component) is a six-step wizard: Basics → Experience (a one-time interstitial path-fork, not a tracked step) → Identity → Audience → Brand Voice → Goals. `app/onboarding/layout.tsx` wraps every step in `OnboardingGuard` (`features/onboarding/components/onboarding-guard.tsx`), which:

- shows a spinner while `useOnboardingState()` is loading;
- renders a session-expired message (linking to `/login`) only when the query errors *and there is no cached data* — a background refetch failure with existing cached data must not unmount an in-progress form;
- redirects to `/dashboard` once `onboarding_status === "completed"`;
- otherwise computes the first incomplete step from the fetched state and redirects **only when the current tracked step is ahead of that target** (i.e. blocks skipping forward past an incomplete step, but never blocks navigating back to revisit/edit an already-completed one). `/onboarding/experience` is deliberately excluded from this tracked-step list.

Each wired step screen follows the same one-time, ref-guarded hydration effect to prefill its local state from `useOnboardingState()`'s cached data on first mount, without clobbering in-progress edits on a later refetch — copy this pattern (not the validation logic, which is step-specific) when adding a new step.

### UI components and design system

- `components/ui/` — generic, unbranded primitives (`Button`, `TextField`, `PasswordField`, `Checkbox`, `Divider`, `icons.tsx`).
- `components/auth/` — auth-specific presentational components (`AuthCard`, `TrustBadge`) shared across login/signup.
- `app/globals.css` — Tailwind v4 is imported via `@import "tailwindcss"` (no `tailwind.config.js`); the STRATIVA AI design system (Dark Slate Navy primary, Light Ash background, etc.) is defined as CSS custom properties and surfaced via `@theme inline`.
- `app/(auth)/` is a route group with a shared `layout.tsx` (header/footer chrome) for `/login` and `/signup`, so those routes get the auth shell without it affecting the URL path.
