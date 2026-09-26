import type { Metadata } from "next";
import { IdentityStep } from "@/features/onboarding/components/identity/identity-step";

export const metadata: Metadata = {
  title: "Brand identity – STRATIVA AI",
};

export default function OnboardingIdentityPage() {
  return <IdentityStep />;
}
