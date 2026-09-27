// Server-only: calls the FastAPI backend directly. Never import into a Client Component.
import "server-only";

import { parseApiError } from "@/lib/api/errors";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL;

interface ServerFetchOptions extends RequestInit {
  accessToken?: string;
}

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  if (!BACKEND_INTERNAL_URL) {
    throw new Error("BACKEND_INTERNAL_URL is not set");
  }

  const { accessToken, headers, ...rest } = options;

  const response = await fetch(`${BACKEND_INTERNAL_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

export async function serverFetchRaw(
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  if (!BACKEND_INTERNAL_URL) {
    throw new Error("BACKEND_INTERNAL_URL is not set");
  }

  const { headers, ...rest } = init;

  const response = await fetch(`${BACKEND_INTERNAL_URL}${path}`, {
    ...rest,
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  // fetch() transparently decompresses a gzip-encoded response body but leaves the
  // stale Content-Encoding/Content-Length headers on `response.headers` — passing
  // those through as-is would make the browser's own fetch try to gunzip an
  // already-decoded body. Not reachable today (nothing compresses responses on
  // BACKEND_INTERNAL_URL), but becomes live the moment compression is added to the
  // FastAPI backend or anything in front of it (a different repo from this one).
  const safeHeaders = new Headers(response.headers);
  safeHeaders.delete("content-encoding");
  safeHeaders.delete("content-length");

  return new Response(response.body, { status: response.status, headers: safeHeaders });
}
