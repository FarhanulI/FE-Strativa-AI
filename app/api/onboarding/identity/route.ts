import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/identity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
