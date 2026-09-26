"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@/components/ui/icons";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";
import { SuggestionChips } from "@/features/onboarding/components/onboarding-suggestion-chips";
import { TagInputField } from "@/features/onboarding/components/identity/tag-input-field";

const STYLE_MAX = 500;
const TOTAL_STEPS = 4;
const CURRENT_STEP = 3;

const TONE_SUGGESTIONS = [
  "Authoritative",
  "Casual",
  "Thoughtful",
  "Urgent & High-Energy",
  "Witty / Humorous",
  "Educational",
  "Minimalist",
];

const GUARDRAIL_SUGGESTIONS = [
  "Corporate jargon",
  "Exclamation mark overuse",
  "Passive voice",
  "Hard-selling pitches",
  "Wall of text",
];

export function BrandVoiceStep() {
  const [tones, setTones] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  const [avoid, setAvoid] = useState<string[]>([]);

  const isValid = tones.length >= 1;

  function addUnique(values: string[], value: string): string[] {
    return values.includes(value) ? values : [...values, value];
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 py-8 md:py-12">
      <OnboardingFormHeader
        category="Brand-Voice"
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        title="Define your Brand Voice & Style"
        subtitle="Set the tonal guidelines, writing cadence, and guardrails that make every piece of AI-generated content sound authentically yours."
      />

      <div className="rounded-xl bg-surface p-6 shadow-md sm:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-text">
                  How should your content sound?
                </label>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Required ≥1
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                  isValid ? "bg-surface-muted text-success" : "bg-red-50 text-red-600"
                }`}
              >
                {tones.length} selected (minimum 1 required)
              </span>
            </div>
            <p className="text-sm text-text-muted">
              Pick the words that best describe your voice — this shapes how every piece of
              content gets written.
            </p>
            <TagInputField
              id="brand-tones"
              values={tones}
              onAdd={(value) => setTones((prev) => addUnique(prev, value))}
              onRemove={(index) => setTones((prev) => prev.filter((_, i) => i !== index))}
              placeholder="Type a custom tone and press Enter..."
              icon={null}
              chipClassName="bg-primary text-primary-foreground"
            />
            <SuggestionChips
              label="Suggested tones"
              options={TONE_SUGGESTIONS}
              onSelect={(value) => setTones((prev) => addUnique(prev, value))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label htmlFor="style-textarea" className="text-sm font-semibold text-text">
                  Any specific writing style you follow?
                </label>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  Optional
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {style.length} / {STYLE_MAX}
              </span>
            </div>
            <p className="text-sm text-text-muted">
              Optional — sentence length, structure, or format quirks that make your content
              feel like you.
            </p>
            <textarea
              id="style-textarea"
              rows={4}
              maxLength={STYLE_MAX}
              value={style}
              onChange={(event) => setStyle(event.target.value.slice(0, STYLE_MAX))}
              placeholder="Short, punchy sentences. Never more than 2 lines per point..."
              className="w-full resize-none rounded-lg border border-border bg-surface-muted p-3.5 text-sm text-text shadow-sm placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center gap-1.5 text-text-muted">
              <InfoIcon className="h-4 w-4" />
              <p className="text-xs">
                This calibrates paragraph rhythm, formatting rules, and sentence pacing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-text">
                Anything we should never do in your content?
              </label>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                Optional
              </span>
            </div>
            <p className="text-sm text-text-muted">
              Optional — tell us what&apos;s off-limits, so we never generate something that
              doesn&apos;t feel like you.
            </p>
            <TagInputField
              id="brand-guardrails"
              values={avoid}
              onAdd={(value) => setAvoid((prev) => addUnique(prev, value))}
              onRemove={(index) => setAvoid((prev) => prev.filter((_, i) => i !== index))}
              placeholder="Type a guardrail or forbidden phrase and press Enter..."
              icon={null}
              chipClassName="bg-surface-muted text-text"
            />
            <SuggestionChips
              label="Suggested guardrails"
              options={GUARDRAIL_SUGGESTIONS}
              onSelect={(value) => setAvoid((prev) => addUnique(prev, value))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3.5">
            <div className="flex items-center gap-2 text-success">
              <CheckCircleIcon className="h-4.5 w-4.5" />
              <span className="text-sm font-semibold">
                {isValid ? "All required brand voice parameters set" : "Select at least one tone to continue"}
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
        Your brand voice model is encrypted and private to your workspace.
      </p>
    </div>
  );
}
