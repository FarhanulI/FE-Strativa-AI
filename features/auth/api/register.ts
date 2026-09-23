import { clientFetch } from "@/lib/api/browser-client";
import type { RegisterRequest, WorkspaceSummary } from "@/features/auth/types";

export async function registerUser(
  payload: RegisterRequest
): Promise<{ workspace: WorkspaceSummary | null }> {
  return clientFetch<{ workspace: WorkspaceSummary | null }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
