"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  BoltIcon,
  BrainIcon,
  CheckCircleIcon,
  FilterIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { GoalOptionCard } from "@/features/onboarding/components/goals/goal-option-card";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";

const TOTAL_STEPS = 4;
const CURRENT_STEP = 4;

interface GoalOption {
  id: string;
  icon: typeof TrendingUpIcon;
  title: string;
  description: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "reach",
    icon: TrendingUpIcon,
    title: "Scale Organic Reach",
    description:
      "Maximize impressions across LinkedIn, X, and newsletters with viral hooks and topical commentary.",
  },
  {
    id: "leads",
    icon: FilterIcon,
    title: "Generate Inbound Leads",
    description:
      "Attract decision-makers and high-intent prospects with authoritative breakdown threads and case studies.",
  },
  {
    id: "authority",
    icon: BrainIcon,
    title: "Establish Thought Leadership",
    description:
      "Position your brand and key executives as industry authorities with tactical research and teardowns.",
  },
  {
    id: "speed",
    icon: BoltIcon,
    title: "Speed Up Content Creation",
    description:
      "Cut content production cycles from 10+ hours a week down to minutes with calibrated brand voice models.",
  },
  {
    id: "conversions",
    icon: ShoppingCartIcon,
    title: "Drive Product Conversions",
    description:
      "Transform engaged readers into active trial signups and customers through educational and solution selling.",
  },
  {
    id: "community",
    icon: UsersIcon,
    title: "Build an Engaged Community",
    description:
      "Spark viral discussions, high-retention reply threads, and sustained interactive audience engagement.",
  },
];

export function GoalsStep() {
  const [selected, setSelected] = useState<string[]>(["reach", "leads"]);

  const isValid = selected.length >= 1;

  function toggleGoal(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((goalId) => goalId !== id) : [...prev, id]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
              key={goal.id}
              icon={<goal.icon className="h-5 w-5" />}
              title={goal.title}
              description={goal.description}
              selected={selected.includes(goal.id)}
              onToggle={() => toggleGoal(goal.id)}
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

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Brand Voice
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Complete Setup &amp; Launch
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
