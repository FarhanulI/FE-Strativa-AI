import type { Metadata } from "next";
import { BrandVoiceStep } from "@/features/onboarding/components/brand-voice/brand-voice-step";

export const metadata: Metadata = {
  title: "Brand voice – STRATIVA AI",
};

export default function OnboardingBrandVoicePage() {
  return <BrandVoiceStep />;
}
