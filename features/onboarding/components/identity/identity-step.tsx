"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckCircleIcon,
  InfoIcon,
  TagIcon,
  TargetIcon,
} from "@/components/ui/icons";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";
import { TagInputField } from "@/features/onboarding/components/identity/tag-input-field";

const POSITIONING_MAX = 200;
const TOTAL_STEPS =4;
const CURRENT_STEP = 1;
const REQUIRED_FIELD_COUNT = 4;

export function IdentityStep() {
  const [positioning, setPositioning] = useState("");
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);

  const positioningValid = positioning.trim().length > 0;
  const nicheValid = primaryNiche.trim().length > 0;
  const topicsValid = topics.length >= 1;
  const expertiseValid = expertise.length >= 1;
  const completedCount = [positioningValid, nicheValid, topicsValid, expertiseValid].filter(
    Boolean
  ).length;
  const isValid = completedCount === REQUIRED_FIELD_COUNT;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 py-8 md:py-12">
      <OnboardingFormHeader
        category="Brand-Identity"
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        title="Let's define your brand identity"
        subtitle="Craft your foundational positioning so Strativa AI can calibrate tone, context, and domain authority."
      />

      <div className="rounded-xl bg-surface p-6 shadow-md sm:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label htmlFor="brand-positioning" className="text-sm font-semibold text-text">
                  Positioning
                </label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Required
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {positioning.length} / {POSITIONING_MAX}
              </span>
            </div>
            <p className="text-sm font-medium text-text">
              How would you describe what you do, in one line?
            </p>
            <div className="rounded-lg bg-surface-muted p-0.5 transition-colors focus-within:bg-primary/10">
              <textarea
                id="brand-positioning"
                rows={3}
                value={positioning}
                onChange={(event) => setPositioning(event.target.value.slice(0, POSITIONING_MAX))}
                placeholder="e.g. I break down complex football tactics into simple, visual explanations."
                className="w-full resize-none rounded-md bg-surface p-3.5 text-sm text-text shadow-sm placeholder:text-text-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">This becomes the foundation of your brand voice.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="primary-niche" className="text-sm font-semibold text-text">
                Primary Niche
              </label>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                Required
              </span>
            </div>
            <p className="text-sm font-medium text-text">What&apos;s your main focus area?</p>
              <TagInputField
                id="primary-niche"
                values={primaryNiche ? [primaryNiche] : []}
                onAdd={setPrimaryNiche}
                onRemove={() => setPrimaryNiche("")}
                placeholder="e.g. football tactics"
                icon={<TargetIcon className="h-4 w-4 text-text-muted" />}
                chipClassName="bg-surface-muted text-text"
              />
            <div className="flex items-center gap-1.5 pt-0.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">The one topic you want to be known for above everything else.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-text">Topics</label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Required ≥1
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {topics.length} added (minimum 1 required)
              </span>
            </div>
            <p className="text-sm font-medium text-text">What topics do you cover?</p>
            <TagInputField
              id="topic-input"
              values={topics}
              onAdd={(value) => setTopics((prev) => [...prev, value])}
              onRemove={(index) => setTopics((prev) => prev.filter((_, i) => i !== index))}
              placeholder="e.g. set pieces, player development (Press Enter to add)"
              icon={<TagIcon className="h-4 w-4 text-text-muted" />}
              chipClassName="bg-surface-muted text-text"
            />
            <div className="flex items-center gap-1.5 pt-0.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">
                Add as many as apply — we&apos;ll use these to find content opportunities in your
                space.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-text">Expertise &amp; Credibility</label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Required ≥1
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {expertise.length} added (minimum 1 required)
              </span>
            </div>
            <p className="text-sm font-medium text-text">What makes you credible on this topic?</p>
            <TagInputField
              id="expertise-input"
              values={expertise}
              onAdd={(value) => setExpertise((prev) => [...prev, value])}
              onRemove={(index) => setExpertise((prev) => prev.filter((_, i) => i !== index))}
              placeholder="e.g. Masters in Sports Science (Press Enter to add)"
              icon={<BadgeCheckIcon className="h-4 w-4 text-primary" />}
              chipClassName="bg-primary/10 text-primary"
            />
            <div className="flex items-center gap-1.5 pt-0.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">
                We use this so the content we suggest never claims expertise you don&apos;t
                actually have.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3.5">
            <div className="flex items-center gap-2 text-success">
              <BadgeCheckIcon className="h-4.5 w-4.5" />
              <span className="text-sm font-semibold">
                {isValid
                  ? `All ${REQUIRED_FIELD_COUNT} required fields completed`
                  : `${completedCount} of ${REQUIRED_FIELD_COUNT} required fields completed`}
              </span>
            </div>
            <span className="text-xs text-text-muted">Estimated setup: 2 min remaining</span>
          </div>

          <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Continue to Audience
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
        Your identity model is encrypted and private to your workspace.
      </p>
    </div>
  );
}
