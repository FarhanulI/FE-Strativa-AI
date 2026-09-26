import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";

interface OnboardingFormHeaderProps {
  category: string;
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export function OnboardingFormHeader({
  category,
  step,
  totalSteps,
  title,
  subtitle,
}: OnboardingFormHeaderProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {category}
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/10" />
          <span className="text-xs font-semibold text-primary">
            Step {String(step).padStart(2, "0")} of {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

        <OnboardingProgress step={step} totalSteps={totalSteps} />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-text">{title}</h1>
        <p className="text-base leading-relaxed text-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
