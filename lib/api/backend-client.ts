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

  return fetch(`${BACKEND_INTERNAL_URL}${path}`, {
    ...rest,
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
