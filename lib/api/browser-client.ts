// Client-safe: calls this Next.js app's own same-origin /api/* routes only.
import { parseApiError } from "@/lib/api/errors";

export async function clientFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options;

  const response = await fetch(path, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
