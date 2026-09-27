"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BoltIcon,
  BrainIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { GoalOptionCard } from "@/features/onboarding/components/goals/goal-option-card";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";
import type { Goal } from "@/features/onboarding/types";
import { useUpdateGoals } from "@/features/onboarding/hooks/use-update-goals";
import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";

const TOTAL_STEPS = 4;
const CURRENT_STEP = 4;

interface GoalOption {
  value: Goal;
  icon: typeof TrendingUpIcon;
  label: string;
  subtitle: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "growth",
    icon: TrendingUpIcon,
    label: "Growth",
    subtitle: "More followers, more reach",
  },
  {
    value: "authority",
    icon: BrainIcon,
    label: "Authority",
    subtitle: "Be recognized as an expert",
  },
  {
    value: "engagement",
    icon: BoltIcon,
    label: "Engagement",
    subtitle: "More comments, shares, saves",
  },
  {
    value: "community",
    icon: UsersIcon,
    label: "Community",
    subtitle: "Build a loyal, connected audience",
  },
];

export function GoalsStep() {
  const router = useRouter();
  const updateGoalsMutation = useUpdateGoals();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  const [selected, setSelected] = useState<Goal[]>(["growth"]);

  const isValid = selected.length >= 1;

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.goals) return;
    hasHydrated.current = true;
    setSelected(onboardingState.goals.goals);
  }, [onboardingState]);

  function toggleGoal(value: Goal) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((goalValue) => goalValue !== value) : [...prev, value]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateGoalsMutation.mutate(
      { goals: selected },
      {
        onSuccess: () => {
          completeOnboardingMutation.mutate(undefined, {
            onSuccess: () => router.push("/dashboard"),
          });
        },
      }
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 py-8 md:py-12">
      <OnboardingFormHeader
        category="Workspace-Goals"
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        title="What's your main goal right now?"
        subtitle="Select what you want STRATIVA AI to accomplish first. We'll prioritize these campaigns, content workflows, and AI prompt engines immediately upon launch."
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-xl bg-surface p-6 shadow-md sm:p-10"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Required ≥1
          </span>
          <span className="text-sm text-text-muted">
            <span className="font-semibold text-primary">{selected.length}</span> selected
            (minimum 1 required)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GOAL_OPTIONS.map((goal) => (
            <GoalOptionCard
              key={goal.value}
              icon={<goal.icon className="h-5 w-5" />}
              title={goal.label}
              description={goal.subtitle}
              selected={selected.includes(goal.value)}
              onToggle={() => toggleGoal(goal.value)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3.5">
          <div className="flex items-center gap-2 text-success">
            <CheckCircleIcon className="h-4.5 w-4.5" />
            <span className="text-sm font-semibold">
              {isValid ? "Ready to initialize workspace" : "Select at least one goal to continue"}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            {isValid ? "100% Ready" : `${selected.length} of 1 required`}
          </span>
        </div>

        {(updateGoalsMutation.isError || completeOnboardingMutation.isError) && (
          <p className="text-sm text-red-600" role="alert">
            Something went wrong completing your setup. Please try again.
          </p>
        )}

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/onboarding/brand-voice")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Brand Voice
          </button>
          <button
            type="submit"
            disabled={!isValid || updateGoalsMutation.isPending || completeOnboardingMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {updateGoalsMutation.isPending || completeOnboardingMutation.isPending
              ? "Finishing setup..."
              : "Complete Setup & Launch"}
          </button>
        </div>
      </form>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
        Your strategic goals, knowledge base, and AI brand guardrails are private and encrypted
        to your workspace.
      </p>
    </div>
  );
}
