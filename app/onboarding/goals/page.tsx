import type { Metadata } from "next";
import { GoalsStep } from "@/features/onboarding/components/goals/goals-step";

export const metadata: Metadata = {
  title: "Workspace goals – STRATIVA AI",
};

export default function OnboardingGoalsPage() {
  return <GoalsStep />;
}
