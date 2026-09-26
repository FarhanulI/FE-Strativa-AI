import type { Metadata } from "next";
import { ExperienceSelector } from "@/features/onboarding/components/experience/experience-selector";

export const metadata: Metadata = {
  title: "Experience profile – STRATIVA AI",
};

export default function OnboardingExperiencePage() {
  return <ExperienceSelector />;
}
