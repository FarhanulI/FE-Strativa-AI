import { proxyOnboardingRequest } from "@/lib/api/onboarding-proxy";

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyOnboardingRequest("/logo", {
    method: "POST",
    body: formData,
  });
}
