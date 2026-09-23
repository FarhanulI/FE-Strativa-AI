import Link from "next/link";
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

export function SignUp() {
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

      <div className="flex flex-col gap-3">
        <Button variant="social">
          <GoogleIcon className="h-4 w-4" />
          Sign up with Google
        </Button>
        {/* <Button variant="social">
          <GitHubIcon className="h-4 w-4" />
          Sign up with GitHub
        </Button> */}
      </div>

      <div className="my-6">
        <Divider label="Or register with email" />
      </div>

      <form className="flex flex-col gap-4">
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

        <Button type="submit">
          Create Workspace
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
