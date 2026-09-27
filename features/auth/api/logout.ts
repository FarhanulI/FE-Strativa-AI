import { clientFetch } from "@/lib/api/browser-client";

export async function logoutUser(): Promise<void> {
  await clientFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}
