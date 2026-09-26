"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FrownIcon,
  InfoIcon,
  MessageQuestionIcon,
  TagIcon,
} from "@/components/ui/icons";
import { DynamicListField } from "@/features/onboarding/components/audience/dynamic-list-field";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";
import { TagInputField } from "@/features/onboarding/components/identity/tag-input-field";

const DESCRIPTION_MAX = 300;
const TOTAL_STEPS = 4;
const CURRENT_STEP = 2;

export function AudienceStep() {
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);

  const descriptionValid = description.trim().length > 0;
  const nuancesValid = painPoints.length + questions.length >= 1;
  const isValid = descriptionValid && nuancesValid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 py-8 md:py-12">
      <OnboardingFormHeader
        category="Target-Audience"
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        title="Define your Target Audience"
        subtitle="Shape the core audience profiles that guide your AI content creation, contextual messaging, and multi-channel marketing campaigns."
      />

      <div className="rounded-xl bg-surface p-6 shadow-md sm:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label htmlFor="audience-description" className="text-sm font-semibold text-text">
                  Who are you creating for?
                </label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Required
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {description.length} / {DESCRIPTION_MAX}
              </span>
            </div>
            <p className="text-sm font-medium text-text">
              Describe the people you want to reach — the more specific their goals,
              experience level, and tone preferences, the better our AI adapts.
            </p>
            <div className="rounded-lg bg-surface-muted p-0.5 transition-colors focus-within:bg-primary/10">
              <textarea
                id="audience-description"
                rows={3}
                maxLength={DESCRIPTION_MAX}
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX))}
                placeholder="e.g. Early-stage startup founders looking for organic growth playbooks..."
                className="w-full resize-none rounded-md bg-surface p-3.5 text-sm text-text shadow-sm placeholder:text-text-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">This becomes the foundation of your brand voice.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-text">
                  What else does your audience care about?
                </label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Optional
                </span>
              </div>
              <span className="text-xs text-text-muted">{interests.length} added</span>
            </div>
            <p className="text-sm font-medium text-text">
              Helps STRATIVA AI cross-reference adjacent themes, cultural metaphors, and
              relevant hooks your audience already resonates with.
            </p>
            <TagInputField
              id="audience-interests"
              values={interests}
              onAdd={(value) => setInterests((prev) => [...prev, value])}
              onRemove={(index) => setInterests((prev) => prev.filter((_, i) => i !== index))}
              placeholder="e.g. Champions League, scouting (Press Enter to add)"
              icon={<TagIcon className="h-4 w-4 text-text-muted" />}
              chipClassName="bg-surface-muted text-text"
            />
          </div>

          <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface-muted/50 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-lg font-bold text-primary">
                Audience Nuances &amp; Engagement Triggers
              </h2>
            </div>

            <DynamicListField
              icon={<FrownIcon className="h-4 w-4 text-primary" />}
              title="Audience Pain Points"
              description="What do they struggle with or wish they understood better?"
              items={painPoints}
              onAdd={(value) => setPainPoints((prev) => [...prev, value])}
              onRemove={(index) => setPainPoints((prev) => prev.filter((_, i) => i !== index))}
              placeholder="e.g. Struggling with transition phases (Press Enter or click + Add)"
              addLabel="Add Pain Point"
            />

            <div className="h-px w-full bg-border" />

            <DynamicListField
              icon={<MessageQuestionIcon className="h-4 w-4 text-primary" />}
              title="Audience Questions"
              description="What frequent questions or queries do they keep asking you?"
              items={questions}
              onAdd={(value) => setQuestions((prev) => [...prev, value])}
              onRemove={(index) => setQuestions((prev) => prev.filter((_, i) => i !== index))}
              placeholder="e.g. Why does a false 9 work? (Press Enter or click + Add)"
              addLabel="Add Question"
            />

            <div
              className={`flex items-start gap-3 rounded-lg border p-3.5 transition-colors sm:items-center ${
                nuancesValid ? "border-success/30 bg-success/5" : "border-border bg-surface"
              }`}
            >
              <CheckCircleIcon
                className={`mt-0.5 h-5 w-5 shrink-0 sm:mt-0 ${
                  nuancesValid ? "text-success" : "text-text-muted"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text">
                  <span className={nuancesValid ? "font-semibold text-success" : "font-semibold"}>
                    Requirement:
                  </span>{" "}
                  Provide at least one Pain Point <span className="font-semibold uppercase tracking-wider">or</span>{" "}
                  one Question to proceed.
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Currently satisfied:{" "}
                  <span className="font-semibold text-primary">
                    {painPoints.length} pain point{painPoints.length === 1 ? "" : "s"}
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-primary">
                    {questions.length} question{questions.length === 1 ? "" : "s"}
                  </span>{" "}
                  provided.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3.5">
            <div className="flex items-center gap-2 text-success">
              <CheckCircleIcon className="h-4.5 w-4.5" />
              <span className="text-sm font-semibold">
                {isValid ? "All required audience criteria completed" : "Complete the required fields above"}
              </span>
            </div>
            <span className="text-xs text-text-muted">Estimated setup: 1 min remaining</span>
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
              Continue to Strategy
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
        Your audience data is strictly confidential, encrypted, and isolated to your workspace models.
      </p>
    </div>
  );
}
