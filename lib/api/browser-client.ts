// Client-safe: calls this Next.js app's own same-origin /api/* routes only.
import { parseApiError } from "@/lib/api/errors";
import { handleSessionExpired } from "@/lib/auth/session-events";

// Auth routes manage the cookies themselves; a 401 from them (wrong password, dead
// refresh token) is not an expired access token, so it must not trigger a refresh.
const NO_REFRESH_PATH_PREFIX = "/api/auth/";

// Why a single shared promise: the backend rotates refresh tokens on every use
// (claim_for_rotation), and only ONE concurrent refresh with a given token can
// win. A losing concurrent attempt looks exactly like a stolen-token replay, so
// the backend revokes the entire session. If three requests 401 together and each
// fired its own refresh, two would lose and log the user out. Every caller that
// hits a 401 while a refresh is in flight therefore awaits this same promise.
let refreshInFlight: Promise<boolean> | null = null;

// Bumped on each successful refresh. A request that was sent *before* a refresh
// completed but whose 401 arrives *after* it can simply retry with the already
// rotated cookies instead of starting a second, redundant rotation.
let sessionGeneration = 0;

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    const doRefresh = () =>
      fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).then((res) => {
        if (res.ok) sessionGeneration += 1;
        return res.ok;
      });

    // navigator.locks extends the same one-at-a-time guarantee across tabs, which
    // share the refresh cookie but not this module's state.
    const run: Promise<boolean> =
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("acs-session-refresh", doRefresh).then((ok) => ok)
        : doRefresh();

    const inFlight = run
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
    refreshInFlight = inFlight;
    return inFlight;
  }
  return refreshInFlight;
}

function send(path: string, options: RequestInit): Promise<Response> {
  const { headers, body, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  return fetch(path, {
    ...rest,
    body,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });
}

export async function clientFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const generationAtSend = sessionGeneration;
  let response = await send(path, options);

  if (response.status === 401 && !path.startsWith(NO_REFRESH_PATH_PREFIX)) {
    const refreshed = sessionGeneration !== generationAtSend || (await refreshSession());

    // Retry exactly once. A second 401 is terminal — never loop.
    if (refreshed) {
      response = await send(path, options);
    }

    if (response.status === 401) {
      handleSessionExpired();
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
