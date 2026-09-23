"use client";

import { type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { TrustBadge } from "@/components/auth/trust-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import {
  ArrowRightIcon,
  GitHubIcon,
  GoogleIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { useRegister } from "@/features/auth/hooks/use-register";
import { ApiError } from "@/features/auth/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 409:
        return "An account with this email already exists.";
      case 422:
        return "Please double-check your details and try again.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

export function SignUp() {
  const router = useRouter();
  const registerMutation = useRegister();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    console.log({formData});
    

    registerMutation.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/onboarding"),
      }
    );
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Create your STRATIVA account
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {/* <div className="flex flex-col gap-3">
        <Button variant="social">
          <GoogleIcon className="h-4 w-4" />
          Sign up with Google
        </Button>
        <Button variant="social">
          <GitHubIcon className="h-4 w-4" />
          Sign up with GitHub
        </Button> 
      </div> */}

      {/* <div className="my-6">
        <Divider label="Or register with email" />
      </div> */}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* <TextField
          label="Full name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
        /> */}
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="jone@gmail.com"
          autoComplete="email"
          required
        />
        {/* <TextField
          label="Workspace name"
          name="workspace"
          type="text"
          placeholder="acme-corp"
          hint={<span className="text-xs text-text-muted">Optional</span>}
          suffix={<span className="text-text-muted">.strativa.ai</span>}
        /> */}
        <PasswordField
          label="Create password"
          name="password"
          required
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint={<span className="text-xs text-text-muted">Min 8 chars</span>}
        />

        <div className="flex flex-col gap-2">
          <Checkbox
            name="terms"
            required
            label={
              <>
                I agree to STRATIVA&apos;s{" "}
                <Link href="#" className="font-medium text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </>
            }
          />
          <Checkbox
            name="marketing"
            label="Receive curated AI marketing playbooks and product updates."
          />
        </div>

        {registerMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            {getErrorMessage(registerMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating workspace..." : "Create Workspace"}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-6 border-t border-border pt-4">
        <TrustBadge icon={<UsersIcon className="h-3.5 w-3.5" />}>
          Trusted by 10,000+ modern growth teams
        </TrustBadge>
      </div>
    </AuthCard>
  );
}
