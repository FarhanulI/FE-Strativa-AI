// Client-safe: calls this Next.js app's own same-origin /api/* routes only.
import { parseApiError } from "@/lib/api/errors";

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
