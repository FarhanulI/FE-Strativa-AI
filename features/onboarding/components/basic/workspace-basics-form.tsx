"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  LinkIcon,
  UserCircleIcon,
} from "@/components/ui/icons";
import { WorkspaceLogoUpload } from "@/features/onboarding/components/basic/workspace-logo-upload";
import { useUpdateBasics } from "@/features/onboarding/hooks/use-update-basics";
import { useUploadLogo } from "@/features/onboarding/hooks/use-upload-logo";
import { useOnboardingState } from "@/features/onboarding/hooks/use-onboarding-state";

const DISPLAY_NAME_MAX = 60;
const WORKSPACE_NAME_MAX = 48;

function toSlug(value: string): string {
  const clean = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "workspace";
}

export function WorkspaceBasicsForm() {
  const [displayName, setDisplayName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const slug = useMemo(() => toSlug(workspaceName), [workspaceName]);
  const isValid = displayName.trim().length > 0 && workspaceName.trim().length > 0;

  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | undefined>(undefined);
  const updateBasicsMutation = useUpdateBasics();
  const uploadLogoMutation = useUploadLogo();
  const { data: onboardingState } = useOnboardingState();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !onboardingState?.basics) return;
    hasHydrated.current = true;
    const basics = onboardingState.basics;
    setDisplayName(basics.user_name);
    setWorkspaceName(basics.workspace_name);
    setExistingLogoUrl(basics.logo_url);
  }, [onboardingState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    let logoUrl: string | undefined = existingLogoUrl;
    if (logoFile) {
      try {
        const result = await uploadLogoMutation.mutateAsync(logoFile);
        logoUrl = result.logo_url;
      } catch {
        return;
      }
    }

    updateBasicsMutation.mutate(
      {
        user_name: displayName,
        workspace_name: workspaceName,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      },
      {
        onSuccess: () => {
          router.push("/onboarding/experience");
        },
      }
    );
  }

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-8 py-8 md:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-semibold text-primary">Workspace basics</span>
            <span>•</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">All users</span>
          </div>
          <span className="text-xs text-text-muted">Est. setup: ~3 mins</span>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Let&apos;s set up your workspace
          </h1>
          <p className="text-base text-text-muted">
            The essential baseline setup for every STRATIVA AI account. Once established,
            we&apos;ll guide you into your tailored onboarding pathway.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <WorkspaceLogoUpload onFileSelect={setLogoFile} />

        <div className="h-px w-full bg-border" />

        <div className="flex flex-col gap-2.5">
          <TextField
            label="What should we call you?"
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value.slice(0, DISPLAY_NAME_MAX))}
            maxLength={DISPLAY_NAME_MAX}
            placeholder="Your full name or preferred name"
            icon={<UserCircleIcon className="h-4 w-4" />}
            required
            hint={
              <span className="text-xs text-text-muted">
                {displayName.length} / {DISPLAY_NAME_MAX}
              </span>
            }
          />
          <p className="text-xs text-text-muted">
            Used for your workspace profile badge, collaborative comments, and system
            notifications.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <TextField
            label="What's your workspace called?"
            name="workspaceName"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value.slice(0, WORKSPACE_NAME_MAX))}
            maxLength={WORKSPACE_NAME_MAX}
            placeholder="e.g. Apex Strategy Lab"
            icon={<BuildingIcon className="h-4 w-4" />}
            required
            hint={<span className="text-xs text-text-muted">Rename anytime</span>}
          />
          <div className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-text-muted">
            <LinkIcon className="h-4 w-4" />
            <span>Canonical URL:</span>
            <span className="font-semibold text-text">strativa.ai/{slug}</span>
          </div>
          <p className="text-xs text-text-muted">
            This is your account&apos;s home base — invitations and shared project briefs will
            resolve through this space.
          </p>
        </div>

        {isValid && (
          <div className="flex items-start gap-3 rounded-lg bg-surface-muted p-3.5">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text">Ready to proceed</span>
              <span className="text-xs text-text-muted">
                Account and workspace foundation verified. Ready to proceed to your tailored
                onboarding wizard.
              </span>
            </div>
          </div>
        )}

        {(updateBasicsMutation.isError || uploadLogoMutation.isError) && (
          <p className="text-sm text-red-600" role="alert">
            Something went wrong saving your workspace. Please try again.
          </p>
        )}

        <div className="flex flex-col-reverse items-center justify-between gap-4 pt-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:w-auto"
          >
            <HelpCircleIcon className="h-4 w-4" />
            Need help?
          </button>
          <Button
            type="submit"
            disabled={!isValid || uploadLogoMutation.isPending || updateBasicsMutation.isPending}
            className="sm:w-auto"
          >
            {updateBasicsMutation.isPending || uploadLogoMutation.isPending
              ? "Saving..."
              : "Save & Continue to Onboarding"}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <p className="flex items-center justify-center gap-2 text-xs text-text-muted">
        Workspace settings and uploaded brand assets are strictly private to your team.
      </p>
    </div>
  );
}
