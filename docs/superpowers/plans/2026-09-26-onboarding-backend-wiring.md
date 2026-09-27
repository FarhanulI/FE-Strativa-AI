# Onboarding Backend Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the six already-designed onboarding screens (Basics, Experience/path-fork, Identity, Audience, Brand Voice, Goals) to the FastAPI onboarding backend via the established BFF pattern, add a wizard shell with resume/redirect logic, without altering any existing screen's JSX/className/layout outside submit-handler and validation-gating logic.

**Architecture:** Mirror `features/auth/` exactly: `features/onboarding/types` (contract mirror) → `lib/api/onboarding-proxy.ts` (server-only proxy helper, used by `app/api/onboarding/**/route.ts` Route Handlers) → `features/onboarding/api/onboarding.ts` (client fetch wrappers) → `features/onboarding/hooks/*` (TanStack Query hooks) → existing screen components (submit-handler wiring only) → a new `OnboardingGuard` client component mounted in the existing `app/onboarding/layout.tsx` that drives loading/401/completed/resume-redirect behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack Query, existing BFF cookie-auth infra (`lib/auth/session.ts`, `lib/api/backend-client.ts`, `lib/api/browser-client.ts`, `lib/api/errors.ts`).

**Spec:** the pasted task brief in this conversation (backend contract under `/api/v1/onboarding`, `GOAL_OPTIONS`/`TONE_SUGGESTIONS`/`THINGS_TO_AVOID_SUGGESTIONS` constants, wizard resume rules). No separate spec file exists; this plan is the spec's translation into file-level tasks.

## Global Constraints

- Never modify existing screen JSX/className/markup outside a submit/"Next" handler body or a validation-gating boolean — confirmed per-file in Step 0 inspection.
- The path-fork (`experience`) selection is local-only and must **never** appear in any API request body.
- No Cloudinary credentials or logic in the frontend — the backend's `/logo` endpoint handles Cloudinary itself; the frontend only forwards the raw file.
- `BACKEND_INTERNAL_URL` stays server-only (already enforced via `server-only` import in `lib/api/backend-client.ts` and `lib/auth/session.ts` — follow the same guard in every new server-only file).
- Route Handlers proxy to `/api/v1/onboarding/*` and pass a 401 straight through unchanged (no silent-refresh; known accepted gap, same as existing auth code).
- **Goals resolution (user-confirmed):** replace `GOAL_OPTIONS` in `features/onboarding/components/goals/goals-step.tsx` with the spec's 4 options (`growth`/`authority`/`engagement`/`community`, each with a `subtitle`) — this is a data-array + default-selection change only, `GoalOptionCard` and layout stay untouched.
- **Route paths (confirmed by Step 0 inspection):** no `app/(onboarding)/` route group exists or should be created. Wire the existing `app/onboarding/{page,experience,identity,audience,brand-voice,goals}/page.tsx` routes as-is.
- This project has no test runner (`CLAUDE.md`: "There is no test setup in this project yet"). Every task's verification step is `npx tsc --noEmit` (scoped or full) plus a manual reasoning check instead of an automated test; the final task additionally runs `npm run lint` and `npm run build`.
- Field-name mismatches identified in Step 0 (not silently resolved, addressed explicitly per task below):
  - Basics form state uses `displayName`/`workspaceName` → mapped to `user_name`/`workspace_name` only at the request-building boundary.
  - Identity's "primary niche" is UI-modeled as a 1-element tag array → unwrapped to a plain string only at the request-building boundary.
  - The multipart file field name for `/logo` is not specified by the contract; this plan uses `"file"` as the form field name (standard FastAPI `UploadFile` convention) — flag this as an assumption in the final report.
  - `/api/v1/onboarding/complete`'s `profile` response shape is unspecified by the contract; typed as `Record<string, unknown>`.

---

## File Structure

```
features/onboarding/
  types/index.ts                          [new] contract-mirroring types
  api/onboarding.ts                        [new] clientFetch wrappers
  hooks/
    query-keys.ts                          [new] shared query key constant
    use-onboarding-state.ts                [new] useQuery
    use-update-basics.ts                   [new] useMutation
    use-upload-logo.ts                      [new] useMutation
    use-update-identity.ts                 [new] useMutation
    use-update-audience.ts                 [new] useMutation
    use-update-brand.ts                    [new] useMutation
    use-update-goals.ts                    [new] useMutation
    use-complete-onboarding.ts              [new] useMutation
  components/
    onboarding-guard.tsx                   [new] loading/401/completed/resume-redirect shell
    basic/workspace-basics-form.tsx        [modify] wire Next handler + logo upload
    basic/workspace-logo-upload.tsx        [modify] lift file state via prop, no markup change
    experience/experience-selector.tsx     [modify] wire Back/Continue navigation only
    identity/identity-step.tsx             [modify] wire submit handler + Back nav + prefill
    audience/audience-step.tsx             [modify] wire submit handler + Back nav + prefill
    brand-voice/brand-voice-step.tsx       [modify] wire submit handler + Back nav + prefill + suggestion arrays
    goals/goals-step.tsx                   [modify] replace GOAL_OPTIONS data + wire two-phase submit

lib/api/
  backend-client.ts                        [modify] add serverFetchRaw for passthrough
  onboarding-proxy.ts                       [new] server-only proxy helper

app/api/onboarding/
  route.ts                                  [new] GET
  basics/route.ts                           [new] PUT
  logo/route.ts                             [new] POST (multipart)
  identity/route.ts                         [new] PUT
  audience/route.ts                         [new] PUT
  brand/route.ts                            [new] PUT
  goals/route.ts                            [new] PUT
  complete/route.ts                         [new] POST

app/onboarding/layout.tsx                   [modify] mount OnboardingGuard around {children}
```

---

### Task 1: Contract types

**Files:**
- Create: `features/onboarding/types/index.ts`

**Interfaces:**
- Produces: `OnboardingStatus`, `Goal`, `BasicsRequest`, `BasicsResponse`, `IdentityRequest`, `IdentityResponse`, `AudienceRequest`, `AudienceResponse`, `BrandRequest`, `BrandResponse`, `GoalsRequest`, `GoalsResponse`, `LogoUploadResponse`, `OnboardingState`, `CompleteResponse` — every later task imports from this file.

- [ ] **Step 1: Write the types file**

```typescript
// features/onboarding/types/index.ts
export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type Goal = "growth" | "authority" | "engagement" | "community";

export interface BasicsResponse {
  user_name: string;
  workspace_name: string;
  logo_url?: string;
}
export type BasicsRequest = BasicsResponse;

export interface LogoUploadResponse {
  logo_url: string;
}

export interface IdentityResponse {
  positioning: string;
  primary_niche: string;
  topics: string[];
  expertise: string[];
}
export type IdentityRequest = IdentityResponse;

export interface AudienceResponse {
  target_audience_description: string;
  interests: string[];
  pain_points: string[];
  questions: string[];
}
export type AudienceRequest = AudienceResponse;

export interface BrandResponse {
  tone: string[];
  style: string;
  things_to_avoid: string[];
}
export type BrandRequest = BrandResponse;

export interface GoalsResponse {
  goals: Goal[];
}
export type GoalsRequest = GoalsResponse;

export interface OnboardingState {
  onboarding_status: OnboardingStatus;
  basics: BasicsResponse | null;
  identity: IdentityResponse | null;
  audience: AudienceResponse | null;
  goals: GoalsResponse | null;
  brand: BrandResponse | null;
}

export interface CompleteResponse {
  onboarding_status: OnboardingStatus;
  profile: Record<string, unknown>;
}
```

- [ ] **Step 2: Verify it compiles in isolation**

Run: `npx tsc --noEmit`
Expected: no errors referencing `features/onboarding/types`.

- [ ] **Step 3: Commit**

```bash
git add features/onboarding/types/index.ts
git commit -m "feat(onboarding): add contract-mirroring types"
```

---

### Task 2: Server-side raw passthrough + onboarding proxy helper

**Files:**
- Modify: `lib/api/backend-client.ts` (add `serverFetchRaw`, keep existing `serverFetch` untouched)
- Create: `lib/api/onboarding-proxy.ts`

**Interfaces:**
- Consumes: `getAccessToken()` from `lib/auth/session.ts` (returns `Promise<string | null>`, already exists).
- Produces: `serverFetchRaw(path: string, init?: RequestInit, accessToken?: string): Promise<Response>` from `backend-client.ts`; `proxyOnboardingRequest(path: string, init?: RequestInit): Promise<Response>` from `onboarding-proxy.ts` — every Route Handler in Task 3 calls this.

- [ ] **Step 1: Add `serverFetchRaw` to `lib/api/backend-client.ts`**

Append below the existing `serverFetch` function (do not change `serverFetch` itself):

```typescript
export async function serverFetchRaw(
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  if (!BACKEND_INTERNAL_URL) {
    throw new Error("BACKEND_INTERNAL_URL is not set");
  }

  const { headers, ...rest } = init;

  return fetch(`${BACKEND_INTERNAL_URL}${path}`, {
    ...rest,
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
```

This intentionally does **not** set a default `Content-Type` (unlike `serverFetch`), returns the raw `Response` instead of parsing/throwing, so callers can pass a JSON body with their own header or a `FormData` body and let `fetch` set its own multipart boundary.

- [ ] **Step 2: Create `lib/api/onboarding-proxy.ts`**

```typescript
// Server-only: proxies /api/onboarding/* Route Handlers to the FastAPI backend.
import "server-only";

import { getAccessToken } from "@/lib/auth/session";
import { serverFetchRaw } from "@/lib/api/backend-client";

const ONBOARDING_BASE_PATH = "/api/v1/onboarding";

export async function proxyOnboardingRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  return serverFetchRaw(`${ONBOARDING_BASE_PATH}${path}`, init, accessToken);
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/api/backend-client.ts` or `lib/api/onboarding-proxy.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/api/backend-client.ts lib/api/onboarding-proxy.ts
git commit -m "feat(onboarding): add server-only onboarding proxy helper"
```

---

### Task 3: Route Handlers

**Files:**
- Create: `app/api/onboarding/route.ts`
- Create: `app/api/onboarding/basics/route.ts`
- Create: `app/api/onboarding/logo/route.ts`
- Create: `app/api/onboarding/identity/route.ts`
- Create: `app/api/onboarding/audience/route.ts`
- Create: `app/api/onboarding/brand/route.ts`
- Create: `app/api/onboarding/goals/route.ts`
- Create: `app/api/onboarding/complete/route.ts`

**Interfaces:**
- Consumes: `proxyOnboardingRequest` from Task 2.
- Produces: same-origin endpoints `/api/onboarding`, `/api/onboarding/basics`, `/api/onboarding/logo`, `/api/onboarding/identity`, `/api/onboarding/audience`, `/api/onboarding/brand`, `/api/onboarding/goals`, `/api/onboarding/complete` — consumed by Task 4's client module.

- [ ] **Step 1: `app/api/onboarding/route.ts` (GET)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function GET() {
  return proxyOnboardingRequest("");
}
```

- [ ] **Step 2: `app/api/onboarding/basics/route.ts` (PUT)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/basics", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
```

- [ ] **Step 3: `app/api/onboarding/logo/route.ts` (POST, multipart passthrough)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyOnboardingRequest("/logo", {
    method: "POST",
    body: formData,
  });
}
```

Rebuilding the `FormData` (rather than streaming the raw body) avoids Node's `duplex: "half"` requirement for streamed request bodies in Route Handlers and still lets `fetch` set its own multipart boundary — no `Content-Type` is set manually here.

- [ ] **Step 4: `app/api/onboarding/identity/route.ts` (PUT)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/identity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
```

- [ ] **Step 5: `app/api/onboarding/audience/route.ts` (PUT)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/audience", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
```

- [ ] **Step 6: `app/api/onboarding/brand/route.ts` (PUT)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/brand", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
```

- [ ] **Step 7: `app/api/onboarding/goals/route.ts` (PUT)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
```

- [ ] **Step 8: `app/api/onboarding/complete/route.ts` (POST, no body)**

```typescript
import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function POST() {
  return proxyOnboardingRequest("/complete", { method: "POST" });
}
```

- [ ] **Step 9: Verify all Route Handlers compile**

Run: `npx tsc --noEmit`
Expected: no errors under `app/api/onboarding/**`.

- [ ] **Step 10: Commit**

```bash
git add app/api/onboarding
git commit -m "feat(onboarding): add BFF route handlers proxying to backend onboarding API"
```

---

### Task 4: Client fetch module + browser-client FormData support

**Files:**
- Modify: `lib/api/browser-client.ts` (skip forcing JSON `Content-Type` when body is `FormData`)
- Create: `features/onboarding/api/onboarding.ts`

**Interfaces:**
- Consumes: `clientFetch<T>` from `lib/api/browser-client.ts`; types from Task 1.
- Produces: `getOnboardingState`, `updateBasics`, `uploadLogo`, `updateIdentity`, `updateAudience`, `updateBrand`, `updateGoals`, `completeOnboarding` — every hook in Task 5 calls exactly one of these.

- [ ] **Step 1: Extend `clientFetch` in `lib/api/browser-client.ts` to skip JSON header for `FormData` bodies**

Replace the function body (keep the `ApiError`/`parseApiError` import and export signature identical):

```typescript
export async function clientFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, body, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(path, {
    ...rest,
    body,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
```

- [ ] **Step 2: Create `features/onboarding/api/onboarding.ts`**

```typescript
import { clientFetch } from "@/lib/api/browser-client";
import type {
  AudienceRequest,
  AudienceResponse,
  BasicsRequest,
  BasicsResponse,
  BrandRequest,
  BrandResponse,
  CompleteResponse,
  GoalsRequest,
  GoalsResponse,
  IdentityRequest,
  IdentityResponse,
  LogoUploadResponse,
  OnboardingState,
} from "@/features/onboarding/types";

const BASE_PATH = "/api/onboarding";

export function getOnboardingState(): Promise<OnboardingState> {
  return clientFetch<OnboardingState>(BASE_PATH);
}

export function updateBasics(payload: BasicsRequest): Promise<BasicsResponse> {
  return clientFetch<BasicsResponse>(`${BASE_PATH}/basics`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadLogo(file: File): Promise<LogoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return clientFetch<LogoUploadResponse>(`${BASE_PATH}/logo`, {
    method: "POST",
    body: formData,
  });
}

export function updateIdentity(payload: IdentityRequest): Promise<IdentityResponse> {
  return clientFetch<IdentityResponse>(`${BASE_PATH}/identity`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateAudience(payload: AudienceRequest): Promise<AudienceResponse> {
  return clientFetch<AudienceResponse>(`${BASE_PATH}/audience`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateBrand(payload: BrandRequest): Promise<BrandResponse> {
  return clientFetch<BrandResponse>(`${BASE_PATH}/brand`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateGoals(payload: GoalsRequest): Promise<GoalsResponse> {
  return clientFetch<GoalsResponse>(`${BASE_PATH}/goals`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeOnboarding(): Promise<CompleteResponse> {
  return clientFetch<CompleteResponse>(`${BASE_PATH}/complete`, {
    method: "POST",
  });
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/api/browser-client.ts` or `features/onboarding/api/onboarding.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/api/browser-client.ts features/onboarding/api/onboarding.ts
git commit -m "feat(onboarding): add client API module with FormData-safe browser-client"
```

---

### Task 5: TanStack Query hooks

**Files:**
- Create: `features/onboarding/hooks/query-keys.ts`
- Create: `features/onboarding/hooks/use-onboarding-state.ts`
- Create: `features/onboarding/hooks/use-update-basics.ts`
- Create: `features/onboarding/hooks/use-upload-logo.ts`
- Create: `features/onboarding/hooks/use-update-identity.ts`
- Create: `features/onboarding/hooks/use-update-audience.ts`
- Create: `features/onboarding/hooks/use-update-brand.ts`
- Create: `features/onboarding/hooks/use-update-goals.ts`
- Create: `features/onboarding/hooks/use-complete-onboarding.ts`

**Interfaces:**
- Consumes: every function from Task 4's `features/onboarding/api/onboarding.ts`; types from Task 1.
- Produces: `useOnboardingState()`, `useUpdateBasics()`, `useUploadLogo()`, `useUpdateIdentity()`, `useUpdateAudience()`, `useUpdateBrand()`, `useUpdateGoals()`, `useCompleteOnboarding()` — every screen in Task 6/7 imports these by name.

- [ ] **Step 1: `features/onboarding/hooks/query-keys.ts`**

```typescript
export const ONBOARDING_STATE_QUERY_KEY = ["onboarding", "state"] as const;
```

- [ ] **Step 2: `features/onboarding/hooks/use-onboarding-state.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { getOnboardingState } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useOnboardingState() {
  return useQuery({
    queryKey: ONBOARDING_STATE_QUERY_KEY,
    queryFn: getOnboardingState,
  });
}
```

- [ ] **Step 3: `features/onboarding/hooks/use-update-basics.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBasics } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateBasics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBasics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 4: `features/onboarding/hooks/use-upload-logo.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadLogo } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 5: `features/onboarding/hooks/use-update-identity.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentity } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIdentity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 6: `features/onboarding/hooks/use-update-audience.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAudience } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAudience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 7: `features/onboarding/hooks/use-update-brand.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBrand } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 8: `features/onboarding/hooks/use-update-goals.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGoals } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGoals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 9: `features/onboarding/hooks/use-complete-onboarding.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
```

- [ ] **Step 10: Verify all hooks compile**

Run: `npx tsc --noEmit`
Expected: no errors under `features/onboarding/hooks/**`.

- [ ] **Step 11: Commit**

```bash
git add features/onboarding/hooks
git commit -m "feat(onboarding): add TanStack Query hooks for onboarding endpoints"
```

---

### Task 6: Wire Basics screen (logo upload lifted + Next handler)

**Files:**
- Modify: `features/onboarding/components/basic/workspace-logo-upload.tsx`
- Modify: `features/onboarding/components/basic/workspace-basics-form.tsx`

**Interfaces:**
- Consumes: `useUploadLogo()`, `useUpdateBasics()` from Task 5.
- Produces: nothing consumed downstream (leaf screen).

**Mismatch being addressed:** `WorkspaceLogoUpload` currently holds its `File` in fully local state with no prop to read it out. This task lifts that state via an `onFileSelect` prop — no markup/styling change.

- [ ] **Step 1: Add `onFileSelect` prop to `WorkspaceLogoUpload`, no markup change**

In `features/onboarding/components/basic/workspace-logo-upload.tsx`, change the props and the two places that mutate `file`:

```typescript
interface WorkspaceLogoUploadProps {
  onFileSelect?: (file: File | null) => void;
}

export function WorkspaceLogoUpload({ onFileSelect }: WorkspaceLogoUploadProps) {
```

In `handleFileChange`, after `setFile(selected);` add:

```typescript
    onFileSelect?.(selected);
```

In `handleRemove`, after `setFile(null);` add:

```typescript
    onFileSelect?.(null);
```

Everything else in the file (JSX, classNames, icons) stays exactly as-is.

- [ ] **Step 2: Wire `WorkspaceBasicsForm`'s Next handler**

In `features/onboarding/components/basic/workspace-basics-form.tsx`:

Add imports:

```typescript
import { useRouter } from "next/navigation";
import { useUpdateBasics } from "@/features/onboarding/hooks/use-update-basics";
import { useUploadLogo } from "@/features/onboarding/hooks/use-upload-logo";
```

Inside `WorkspaceBasicsForm`, add state/hooks and replace `handleSubmit`:

```typescript
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const updateBasicsMutation = useUpdateBasics();
  const uploadLogoMutation = useUploadLogo();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    let logoUrl: string | undefined;
    if (logoFile) {
      const result = await uploadLogoMutation.mutateAsync(logoFile);
      logoUrl = result.logo_url;
    }

    updateBasicsMutation.mutate(
      {
        user_name: displayName,
        workspace_name: workspaceName,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      },
      {
        onSuccess: () => {
          sessionStorage.setItem("onboarding_show_experience", "1");
          router.push("/onboarding/experience");
        },
      }
    );
  }
```

Pass the callback down and reflect pending state on the submit button (styling classes unchanged, only `disabled` condition and label text change):

```tsx
        <WorkspaceLogoUpload onFileSelect={setLogoFile} />
```

```tsx
          <Button
            type="submit"
            disabled={!isValid || uploadLogoMutation.isPending || updateBasicsMutation.isPending}
            className="sm:w-auto"
          >
            {updateBasicsMutation.isPending || uploadLogoMutation.isPending
              ? "Saving..."
              : "Save & Continue to Onboarding"}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
```

(Error surfacing: add a single line above the buttons row, matching the existing `text-red-600`/`role="alert"` convention used elsewhere in this codebase — e.g. in `sign-up.tsx`):

```tsx
        {(updateBasicsMutation.isError || uploadLogoMutation.isError) && (
          <p className="text-sm text-red-600" role="alert">
            Something went wrong saving your workspace. Please try again.
          </p>
        )}
```

Place it directly before the `<div className="flex flex-col-reverse ...">` buttons row.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in the two modified files.

- [ ] **Step 4: Commit**

```bash
git add features/onboarding/components/basic
git commit -m "feat(onboarding): wire Basics screen to useUpdateBasics/useUploadLogo"
```

---

### Task 7: Wire Experience (path-fork) screen — navigation only, no API body

**Files:**
- Modify: `features/onboarding/components/experience/experience-selector.tsx`

**Interfaces:**
- Consumes: nothing from the hooks layer (this screen must never send `pathway` to any endpoint).
- Produces: nothing downstream.

**Mismatch/requirement being addressed:** spec requires an inline note when "Already create content" is selected. Step 0 found the copy already exists in a different form (the "Automated Sync Roadmap" card) — the spec's exact sentence is not present, so add it as an additional small note, not a replacement of existing copy.

- [ ] **Step 1: Add router import and Back/Continue handlers**

```typescript
import { useRouter } from "next/navigation";
```

Inside `ExperienceSelector`:

```typescript
  const router = useRouter();
```

Wire the Back button (`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-surface px-6 py-3 ...`):

```tsx
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-text-muted transition-all hover:bg-surface-muted hover:text-text sm:w-auto"
        >
```

Wire the Continue button:

```tsx
        <button
          type="button"
          onClick={() => router.push("/onboarding/identity")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 sm:w-auto"
        >
```

`pathway` stays exactly as local `useState` — it is read only to drive `calibration` copy and is never included in any request.

- [ ] **Step 2: Add the spec's required inline note for "Already create content"**

Inside the `pathway === "experienced"` card's second `<div className="mt-8 flex flex-col gap-3">` block, directly above the existing `LightbulbIcon` paragraph, add:

```tsx
            <p className="text-xs leading-snug text-text-muted">
              We&apos;re building a tailored setup that imports from your existing content —
              for now, you&apos;ll fill this in manually, and it only takes a couple of
              minutes.
            </p>
```

This supplements (does not replace) the existing "Automated Sync Roadmap" copy already in that card.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `experience-selector.tsx`.

- [ ] **Step 4: Commit**

```bash
git add features/onboarding/components/experience/experience-selector.tsx
git commit -m "feat(onboarding): wire Experience path-fork navigation and required note"
```

---

### Task 8: Wire Identity screen

**Files:**
- Modify: `features/onboarding/components/identity/identity-step.tsx`

**Interfaces:**
- Consumes: `useUpdateIdentity()` from Task 5, `useOnboardingState()` from Task 5 (for Back-prefill).
- Produces: nothing downstream.

**Mismatch being addressed:** `primaryNiche` is modeled as a 1-element tag array in the UI; unwrap to a plain string only when building the request body.

- [ ] **Step 1: Add imports and hooks**

```typescript
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpdateIdentity } from "@/features/onboarding/hooks/use-update-identity";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
```

Inside `IdentityStep`, after the existing `useState` declarations:

```typescript
  const router = useRouter();
  const updateIdentityMutation = useUpdateIdentity();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.identity) return;
    hasHydrated.current = true;
    const identity = onboardingState.identity;
    setPositioning(identity.positioning);
    setPrimaryNiche(identity.primary_niche);
    setTopics(identity.topics);
    setExpertise(identity.expertise);
  }, [onboardingState]);
```

- [ ] **Step 2: Replace `handleSubmit`**

```typescript
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateIdentityMutation.mutate(
      {
        positioning,
        primary_niche: primaryNiche,
        topics,
        expertise,
      },
      {
        onSuccess: () => router.push("/onboarding/audience"),
      }
    );
  }
```

- [ ] **Step 3: Wire Back button and submit pending/disabled state**

```tsx
            <button
              type="button"
              onClick={() => router.push("/onboarding/experience")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
            >
```

```tsx
            <button
              type="submit"
              disabled={!isValid || updateIdentityMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {updateIdentityMutation.isPending ? "Saving..." : "Continue to Audience"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
```

- [ ] **Step 4: Add error message**, directly above the closing `border-t` buttons row div, matching the existing alert convention:

```tsx
          {updateIdentityMutation.isError && (
            <p className="text-sm text-red-600" role="alert">
              Something went wrong saving your brand identity. Please try again.
            </p>
          )}
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `identity-step.tsx`.

- [ ] **Step 6: Commit**

```bash
git add features/onboarding/components/identity/identity-step.tsx
git commit -m "feat(onboarding): wire Identity screen to useUpdateIdentity"
```

---

### Task 9: Wire Audience screen

**Files:**
- Modify: `features/onboarding/components/audience/audience-step.tsx`

**Interfaces:**
- Consumes: `useUpdateAudience()`, `useOnboardingState()` from Task 5.
- Produces: nothing downstream.

Note: the OR-condition note ("Provide at least one Pain Point or one Question to proceed") already exists in this screen per Step 0 — no additional note needed here.

- [ ] **Step 1: Add imports and hooks**

```typescript
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpdateAudience } from "@/features/onboarding/hooks/use-update-audience";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
```

Inside `AudienceStep`, after the `useState` declarations:

```typescript
  const router = useRouter();
  const updateAudienceMutation = useUpdateAudience();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.audience) return;
    hasHydrated.current = true;
    const audience = onboardingState.audience;
    setDescription(audience.target_audience_description);
    setInterests(audience.interests);
    setPainPoints(audience.pain_points);
    setQuestions(audience.questions);
  }, [onboardingState]);
```

- [ ] **Step 2: Replace `handleSubmit`**

```typescript
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateAudienceMutation.mutate(
      {
        target_audience_description: description,
        interests,
        pain_points: painPoints,
        questions,
      },
      {
        onSuccess: () => router.push("/onboarding/brand-voice"),
      }
    );
  }
```

- [ ] **Step 3: Wire Back button and submit pending/disabled state**

```tsx
            <button
              type="button"
              onClick={() => router.push("/onboarding/identity")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
            >
```

```tsx
            <button
              type="submit"
              disabled={!isValid || updateAudienceMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {updateAudienceMutation.isPending ? "Saving..." : "Continue to Strategy"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
```

- [ ] **Step 4: Add error message** above the buttons row:

```tsx
          {updateAudienceMutation.isError && (
            <p className="text-sm text-red-600" role="alert">
              Something went wrong saving your audience. Please try again.
            </p>
          )}
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `audience-step.tsx`.

- [ ] **Step 6: Commit**

```bash
git add features/onboarding/components/audience/audience-step.tsx
git commit -m "feat(onboarding): wire Audience screen to useUpdateAudience"
```

---

### Task 10: Wire Brand Voice screen (spec suggestion arrays + submit)

**Files:**
- Modify: `features/onboarding/components/brand-voice/brand-voice-step.tsx`

**Interfaces:**
- Consumes: `useUpdateBrand()`, `useOnboardingState()` from Task 5.
- Produces: nothing downstream.

**Mismatch being addressed:** replace the existing `TONE_SUGGESTIONS`/`GUARDRAIL_SUGGESTIONS` arrays with the spec's exact lists (data-only change — `SuggestionChips` usage and layout are untouched).

- [ ] **Step 1: Replace the two suggestion constants**

```typescript
const TONE_SUGGESTIONS = [
  "Energetic",
  "Professional",
  "Playful",
  "Bold",
  "Warm",
  "Authoritative",
  "Witty",
  "Calm",
  "Minimalist",
  "Inspirational",
  "Casual",
  "Direct",
];

const THINGS_TO_AVOID_SUGGESTIONS = [
  "Jargon without explanation",
  "Clickbait phrasing",
  "Political topics",
  "Profanity",
  "Over-promising",
  "Negative/complaining tone",
  "Overly salesy language",
];
```

Update the `GUARDRAIL_SUGGESTIONS` reference in JSX to `THINGS_TO_AVOID_SUGGESTIONS` (rename only, same usage site).

- [ ] **Step 2: Add imports and hooks**

```typescript
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpdateBrand } from "@/features/onboarding/hooks/use-update-brand";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
```

Inside `BrandVoiceStep`, after the `useState` declarations:

```typescript
  const router = useRouter();
  const updateBrandMutation = useUpdateBrand();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.brand) return;
    hasHydrated.current = true;
    const brand = onboardingState.brand;
    setTones(brand.tone);
    setStyle(brand.style);
    setAvoid(brand.things_to_avoid);
  }, [onboardingState]);
```

- [ ] **Step 3: Replace `handleSubmit`**

```typescript
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateBrandMutation.mutate(
      {
        tone: tones,
        style,
        things_to_avoid: avoid,
      },
      {
        onSuccess: () => router.push("/onboarding/goals"),
      }
    );
  }
```

- [ ] **Step 4: Wire Back button and submit pending/disabled state**

```tsx
            <button
              type="button"
              onClick={() => router.push("/onboarding/audience")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
            >
```

```tsx
            <button
              type="submit"
              disabled={!isValid || updateBrandMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {updateBrandMutation.isPending ? "Saving..." : "Continue to Strategy"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
```

- [ ] **Step 5: Add error message** above the buttons row:

```tsx
          {updateBrandMutation.isError && (
            <p className="text-sm text-red-600" role="alert">
              Something went wrong saving your brand voice. Please try again.
            </p>
          )}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `brand-voice-step.tsx`.

- [ ] **Step 7: Commit**

```bash
git add features/onboarding/components/brand-voice/brand-voice-step.tsx
git commit -m "feat(onboarding): wire Brand Voice screen and update suggestion chip data"
```

---

### Task 11: Wire Goals screen (spec's 4 options + two-phase submit)

**Files:**
- Modify: `features/onboarding/components/goals/goals-step.tsx`

**Interfaces:**
- Consumes: `useUpdateGoals()`, `useCompleteOnboarding()`, `useOnboardingState()` from Task 5.
- Produces: nothing downstream (final step).

**User-confirmed resolution:** replace `GOAL_OPTIONS` with the spec's 4 contract-matching options.

- [ ] **Step 1: Replace `GOAL_OPTIONS` and the `GoalOption` interface**

```typescript
import type { Goal } from "@/features/onboarding/types";

interface GoalOption {
  value: Goal;
  icon: typeof TrendingUpIcon;
  label: string;
  subtitle: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "growth",
    icon: TrendingUpIcon,
    label: "Growth",
    subtitle: "More followers, more reach",
  },
  {
    value: "authority",
    icon: BrainIcon,
    label: "Authority",
    subtitle: "Be recognized as an expert",
  },
  {
    value: "engagement",
    icon: BoltIcon,
    label: "Engagement",
    subtitle: "More comments, shares, saves",
  },
  {
    value: "community",
    icon: UsersIcon,
    label: "Community",
    subtitle: "Build a loyal, connected audience",
  },
];
```

Remove the now-unused `FilterIcon`/`ShoppingCartIcon` imports (no longer referenced); keep `TrendingUpIcon`, `BrainIcon`, `BoltIcon`, `UsersIcon`.

- [ ] **Step 2: Update `selected` typing, default selection, and the render loop**

```typescript
  const [selected, setSelected] = useState<Goal[]>(["growth"]);

  const isValid = selected.length >= 1;

  function toggleGoal(value: Goal) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((goalValue) => goalValue !== value) : [...prev, value]
    );
  }
```

Update the map (was keyed on `goal.id`/`goal.title`/`goal.description`):

```tsx
          {GOAL_OPTIONS.map((goal) => (
            <GoalOptionCard
              key={goal.value}
              icon={<goal.icon className="h-5 w-5" />}
              title={goal.label}
              description={goal.subtitle}
              selected={selected.includes(goal.value)}
              onToggle={() => toggleGoal(goal.value)}
            />
          ))}
```

`GoalOptionCard` itself is untouched — same props, same markup.

- [ ] **Step 3: Add imports and hooks, and hydrate from state**

```typescript
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpdateGoals } from "@/features/onboarding/hooks/use-update-goals";
import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
```

Inside `GoalsStep`:

```typescript
  const router = useRouter();
  const updateGoalsMutation = useUpdateGoals();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.goals) return;
    hasHydrated.current = true;
    setSelected(onboardingState.goals.goals);
  }, [onboardingState]);
```

- [ ] **Step 4: Replace `handleSubmit` — goals must persist before complete is ever called**

```typescript
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateGoalsMutation.mutate(
      { goals: selected },
      {
        onSuccess: () => {
          completeOnboardingMutation.mutate(undefined, {
            onSuccess: () => router.push("/dashboard"),
          });
        },
      }
    );
  }
```

- [ ] **Step 5: Wire Back button and submit pending/disabled state**

```tsx
          <button
            type="button"
            onClick={() => router.push("/onboarding/brand-voice")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
          >
```

```tsx
          <button
            type="submit"
            disabled={!isValid || updateGoalsMutation.isPending || completeOnboardingMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {updateGoalsMutation.isPending || completeOnboardingMutation.isPending
              ? "Finishing setup..."
              : "Complete Setup & Launch"}
          </button>
```

- [ ] **Step 6: Add error message** above the buttons row:

```tsx
        {(updateGoalsMutation.isError || completeOnboardingMutation.isError) && (
          <p className="text-sm text-red-600" role="alert">
            Something went wrong completing your setup. Please try again.
          </p>
        )}
```

- [ ] **Step 7: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `goals-step.tsx`.

- [ ] **Step 8: Commit**

```bash
git add features/onboarding/components/goals
git commit -m "feat(onboarding): wire Goals screen to contract goal values and two-phase submit"
```

---

### Task 12: Wizard shell (`OnboardingGuard`) and layout wiring

**Files:**
- Create: `features/onboarding/components/onboarding-guard.tsx`
- Modify: `app/onboarding/layout.tsx`

**Interfaces:**
- Consumes: `useOnboardingState()` from Task 5; `ApiError` from `@/lib/api/errors`.
- Produces: nothing downstream (top of the tree).

- [ ] **Step 1: Create `features/onboarding/components/onboarding-guard.tsx`**

```typescript
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
import { ApiError } from "@/lib/api/errors";
import type { OnboardingState } from "@/features/onboarding/types";

const TRACKED_STEP_PATHS = [
  "/onboarding",
  "/onboarding/identity",
  "/onboarding/audience",
  "/onboarding/brand-voice",
  "/onboarding/goals",
] as const;

function resolveResumePath(state: OnboardingState): (typeof TRACKED_STEP_PATHS)[number] {
  const basicsFilled = Boolean(state.basics?.user_name && state.basics?.workspace_name);
  if (!basicsFilled) return "/onboarding";

  const identityFilled = Boolean(
    state.identity?.positioning &&
      state.identity?.primary_niche &&
      state.identity.topics.length >= 1 &&
      state.identity.expertise.length >= 1
  );
  if (!identityFilled) return "/onboarding/identity";

  const audienceFilled = Boolean(
    state.audience?.target_audience_description &&
      (state.audience.pain_points.length >= 1 || state.audience.questions.length >= 1)
  );
  if (!audienceFilled) return "/onboarding/audience";

  const brandFilled = Boolean(state.brand && state.brand.tone.length >= 1);
  if (!brandFilled) return "/onboarding/brand-voice";

  return "/onboarding/goals";
}

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError, error } = useOnboardingState();

  const isTrackedStep = (TRACKED_STEP_PATHS as readonly string[]).includes(pathname);

  useEffect(() => {
    if (!data) return;

    if (data.onboarding_status === "completed") {
      router.replace("/dashboard");
      return;
    }

    if (!isTrackedStep) return;

    const resumePath = resolveResumePath(data);
    if (resumePath !== pathname) {
      router.replace(resumePath);
    }
  }, [data, isTrackedStep, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 401) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-base font-semibold text-text">
            Your session has expired — please log in again.
          </p>
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Go to login
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center text-sm text-text-muted">
        Something went wrong loading your onboarding progress. Please refresh the page.
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Mount it in `app/onboarding/layout.tsx`**

Add `"use client"` is *not* needed on the layout itself since `OnboardingGuard` is already a client component; keep the layout a server component and just wrap children:

```typescript
import { OnboardingGuard } from "@/features/onboarding/components/onboarding-guard";
```

Change only:

```tsx
      <main className="flex flex-1 flex-col items-center px-4 pt-16 md:px-8">
        <OnboardingGuard>{children}</OnboardingGuard>
      </main>
```

Everything else in the layout (header markup, classNames) is untouched.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `onboarding-guard.tsx` or `app/onboarding/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add features/onboarding/components/onboarding-guard.tsx app/onboarding/layout.tsx
git commit -m "feat(onboarding): add wizard guard for loading/401/completed/resume redirects"
```

---

### Task 13: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: `0` errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors or warnings beyond the 7 pre-existing warnings in auth components noted in prior work.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build completes successfully; note any Next.js 16-specific warnings about the new Route Handlers or dynamic APIs.

- [ ] **Step 4: Manual confirmation checklist (write into final report, no code change)**

Confirm and state explicitly in the final report:
- (a) no existing screen's JSX/className/layout was altered outside submit-handler and validation-gating logic — list the touched lines per file.
- (b) no Cloudinary credentials or logic were added to the frontend.
- (c) `pathway` (experience selection) never appears in any request body — verify by grepping `features/onboarding/api/onboarding.ts` and all mutation call sites for `pathway`.
- (d) restate the Step 0 mismatches (Basics field names, primary_niche unwrapping, Goals option replacement, Brand Voice suggestion list replacement, logo field name assumption, route-group path deviation) and how each was resolved in this plan.

- [ ] **Step 5: Commit** (only if Step 1–3 required any fixups; otherwise skip — this task is verification-only)

---

## Self-Review Notes

- **Spec coverage:** Types (Task 1) → proxy/backend-client (Task 2) → Route Handlers (Task 3) → client API (Task 4) → hooks (Task 5) → all six screens (Tasks 6–11) → wizard shell/resume/redirect (Task 12) → build/lint/report (Task 13). Every numbered step in the pasted spec has a corresponding task.
- **Placeholder scan:** no TBD/TODO markers; every code step has complete, pasteable code.
- **Type consistency:** `Goal`, `BasicsRequest/Response`, etc. from Task 1 are the exact names imported in Tasks 4, 5, 8–11 — verified no renames across tasks. `useUpdateBasics`/`useUploadLogo`/etc. names in Task 5 match the import names used in Tasks 6–12.
