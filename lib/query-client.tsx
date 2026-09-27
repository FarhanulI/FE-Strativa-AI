"use client";

import { useState, type ReactNode } from "react";
import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

function normalizeError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    // Intentionally a no-op: by the time a 401 reaches the cache, clientFetch has
    // already tried a silent refresh, failed, and fired handleSessionExpired()
    // (lib/auth/session-events.ts), which clears this cache and redirects to /login.
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: normalizeError,
    }),
    mutationCache: new MutationCache({
      onError: normalizeError,
    }),
  });
}

let browserQueryClient: QueryClient | undefined;

// On the server every request gets a fresh client (never share cached data between
// users). In the browser there is exactly one, so non-component code (e.g.
// handleSessionExpired) can reach the same instance the provider mounted.
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
