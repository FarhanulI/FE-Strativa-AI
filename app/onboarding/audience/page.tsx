import type { Metadata } from "next";
import { AudienceStep } from "@/features/onboarding/components/audience/audience-step";

export const metadata: Metadata = {
  title: "Target audience – STRATIVA AI",
};

export default function OnboardingAudiencePage() {
  return <AudienceStep />;
}
