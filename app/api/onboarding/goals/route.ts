import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyOnboardingRequest("/goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
