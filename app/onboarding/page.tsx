import type { Metadata } from "next";
import { WorkspaceBasicsForm } from "@/features/onboarding/components/basic/workspace-basics-form";

export const metadata: Metadata = {
  title: "Set up your workspace – STRATIVA AI",
};

export default function OnboardingPage() {
  return <WorkspaceBasicsForm />;
}
