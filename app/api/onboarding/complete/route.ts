import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function POST() {
  return proxyOnboardingRequest("/complete", { method: "POST" });
}
