// Server-only: proxies /api/onboarding/* Route Handlers to the FastAPI backend.
import "server-only";

import { getAccessToken } from "@/lib/auth/session";
import { serverFetchRaw } from "@/lib/api/backend-client";

const ONBOARDING_BASE_PATH = "/api/v1/onboarding";

export async function proxyOnboardingRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  return serverFetchRaw(`${ONBOARDING_BASE_PATH}${path}`, init, accessToken);
}
