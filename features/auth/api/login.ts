import { clientFetch } from "@/lib/api/browser-client";
import type { LoginRequest, WorkspaceSummary } from "@/features/auth/types";

export async function loginUser(
  payload: LoginRequest
): Promise<{ workspace: WorkspaceSummary | null }> {
  return clientFetch<{ workspace: WorkspaceSummary | null }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
