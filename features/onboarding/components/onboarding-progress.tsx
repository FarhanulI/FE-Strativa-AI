interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
}

export function OnboardingProgress({ step, totalSteps }: OnboardingProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      title={`Step ${step} of ${totalSteps} active`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const position = index + 1;
        const isActive = position === step;
        const isComplete = position < step;
        return (
          <span
            key={index}
            aria-current={isActive ? "step" : undefined}
            className={`h-2 rounded-full transition-all ${
              isActive
                ? "w-6 bg-primary"
                : isComplete
                  ? "w-2 bg-primary"
                  : "w-2 bg-surface-muted"
            }`}
          />
        );
      })}
    </div>
  );
}
