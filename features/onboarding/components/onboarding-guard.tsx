"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";
import { ApiError } from "@/lib/api/errors";
import type { OnboardingState } from "@/features/onboarding/types";

const TRACKED_STEP_PATHS = [
  "/onboarding",
  "/onboarding/identity",
  "/onboarding/audience",
  "/onboarding/brand-voice",
  "/onboarding/goals",
] as const;

function resolveResumePath(state: OnboardingState): (typeof TRACKED_STEP_PATHS)[number] {
  const basicsFilled = Boolean(state.basics?.user_name && state.basics?.workspace_name);
  if (!basicsFilled) return "/onboarding";

  const identityFilled = Boolean(
    state.identity?.positioning &&
      state.identity?.primary_niche &&
      state.identity.topics.length >= 1 &&
      state.identity.expertise.length >= 1
  );
  if (!identityFilled) return "/onboarding/identity";

  const audienceFilled = Boolean(
    state.audience?.target_audience_description &&
      (state.audience.pain_points.length >= 1 || state.audience.questions.length >= 1)
  );
  if (!audienceFilled) return "/onboarding/audience";

  const brandFilled = Boolean(state.brand && state.brand.tone.length >= 1);
  if (!brandFilled) return "/onboarding/brand-voice";

  return "/onboarding/goals";
}

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError, error } = useOnboardingState();

  const isTrackedStep = (TRACKED_STEP_PATHS as readonly string[]).includes(pathname);

  useEffect(() => {
    if (!data) return;

    if (data.onboarding_status === "completed") {
      router.replace("/dashboard");
      return;
    }

    if (!isTrackedStep) return;

    const resumePath = resolveResumePath(data);
    if (resumePath !== pathname) {
      router.replace(resumePath);
    }
  }, [data, isTrackedStep, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 401) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-base font-semibold text-text">
            Your session has expired — please log in again.
          </p>
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Go to login
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center text-sm text-text-muted">
        Something went wrong loading your onboarding progress. Please refresh the page.
      </div>
    );
  }

  return <>{children}</>;
}
