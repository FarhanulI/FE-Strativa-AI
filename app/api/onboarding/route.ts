import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function GET() {
  return proxyOnboardingRequest("");
}
