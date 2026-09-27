// Client-safe: session-expiry side effects triggered from non-component code
// (clientFetch), where useRouter() isn't available.
import { getQueryClient } from "@/lib/query-client";

const PUBLIC_AUTH_PATHS = ["/login", "/signup"];

let expiryHandled = false;

export function handleSessionExpired(): void {
  if (typeof window === "undefined") return;
  if (PUBLIC_AUTH_PATHS.includes(window.location.pathname)) return;

  // Several in-flight requests can all conclude the session is dead at once;
  // only the first one needs to clear the cache and navigate.
  if (expiryHandled) return;
  expiryHandled = true;

  getQueryClient().clear();

  // Hard navigation is deliberate: there's no out-of-component router here, and
  // with a dead session every authenticated fetch would fail anyway, so a full
  // reload onto /login costs nothing meaningful.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
  window.location.assign("/login");
}
