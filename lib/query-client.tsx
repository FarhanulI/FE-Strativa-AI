"use client";

import { useState, type ReactNode } from "react";
import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

function normalizeError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    // TODO: session-expiry handling (redirect to /login, clear cached queries, etc.)
    // once the login flow exists. Left as a no-op for now.
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

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
