"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  LightbulbIcon,
  SproutIcon,
  TuneIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { OnboardingFormHeader } from "@/features/onboarding/components/onboarding-form-header";

type ExperiencePathway = "starting" | "experienced";

const CALIBRATION_COPY: Record<
  ExperiencePathway,
  { label: string; sub: string; ratio: string }
> = {
  starting: {
    label: "Guidance Mode Active",
    sub: "Full prompt trays, curated tags, and content templates expanded.",
    ratio: "100% Assist",
  },
  experienced: {
    label: "Fast-Track Mode Active",
    sub: "Minimal clutter enabled. High-speed manual capture ready.",
    ratio: "85% Speed",
  },
};

const TOTAL_STEPS = 6;
const CURRENT_STEP = 2;

export function ExperienceSelector() {
  const [pathway, setPathway] = useState<ExperiencePathway>("experienced");
  const calibration = CALIBRATION_COPY[pathway];

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 py-8 md:py-12">
      <OnboardingFormHeader
        category="Calibration"
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        title="Are you just starting out, or already creating content?"
        subtitle="Choose the option that best reflects where you are today. We'll tailor prompt inspiration, pacing, and suggestion trays throughout your workspace setup."
      />

      <div
        role="radiogroup"
        aria-label="Select your creation experience level"
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={pathway === "starting"}
          onClick={() => setPathway("starting")}
          className={`group flex flex-col justify-between rounded-xl bg-surface p-6 text-left shadow-sm transition-all hover:shadow-md ${
            pathway === "starting" ? "shadow-md" : ""
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-primary transition-transform group-hover:scale-105">
                <SproutIcon className="h-6 w-6" />
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  pathway === "starting"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-transparent"
                }`}
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-text">
                🌱 Just starting out
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">
                New to publishing or building your audience from scratch.
                We&apos;ll pre-expand prompt suggestions, tag ideas, and
                tactical topic banks across every step.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
              Guidance mode enabled
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
              Expanded tag trays
            </span>
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={pathway === "experienced"}
          onClick={() => setPathway("experienced")}
          className={`group flex flex-col justify-between rounded-xl bg-surface p-6 text-left shadow-sm transition-all hover:shadow-md ${
            pathway === "experienced" ? "shadow-md" : ""
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <VideoIcon className="h-6 w-6" />
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors ${
                  pathway === "experienced"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-transparent"
                }`}
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-text">
                📹 Already create content
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">
                You already produce videos, articles, podcasts, or social posts
                and have an established tone, target cadence, and core niche.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-lg bg-surface-muted p-3.5">
              <span className="mt-0.5 text-primary">
                <TuneIcon className="h-4 w-4" />
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Automated Sync Roadmap
                  </span>
                  <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                    BETA SOON
                  </span>
                </div>
                <p className="text-xs leading-snug text-text-muted">
                  We&apos;re building an automated importer for YouTube,
                  Substack, and RSS. For now, you&apos;ll configure your
                  baseline manually in ~2 minutes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-1 text-text-muted">
              <LightbulbIcon className="h-4 w-4" />
              <p className="text-xs text-text-muted">
                Downstream setup: Suggestions tucked behind a neat{" "}
                <em>&quot;Need ideas?&quot;</em> toggle.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-surface p-6 shadow-sm md:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
            <TuneIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-text">
              {calibration.label}
            </span>
            <span className="text-xs text-text-muted">{calibration.sub}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 rounded-lg bg-surface-muted px-4 py-2.5">
          <div className="flex flex-col text-right">
            <span className="text-xs uppercase text-text-muted">
              Pacing profile
            </span>
            <span className="text-lg font-bold text-primary">
              {calibration.ratio}
            </span>
          </div>
          <svg
            viewBox="0 0 64 32"
            fill="none"
            className="h-8 w-16 text-primary"
          >
            <path
              d="M2 28L18 20L34 24L50 8L62 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
            />
            <circle cx={50} cy={8} r={3} fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-text-muted transition-all hover:bg-surface-muted hover:text-text sm:w-auto"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 sm:w-auto"
        >
          Continue to Identity
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
        Your experience selection calibrates wizard guidance and stays
        completely private to this session.
      </p>
    </div>
  );
}
