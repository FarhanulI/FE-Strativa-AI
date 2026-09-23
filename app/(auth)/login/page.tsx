import Link from "next/link";
import type { Metadata } from "next";
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
  MailIcon,
  ShieldIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sign in – STRATIVA AI",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Enter your credentials to access your STRATIVA workspace
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="social">
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="social">
          <GitHubIcon className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      <div className="my-6">
        <Divider label="Or sign in with email" />
      </div>

      <form className="flex flex-col gap-4">
        <TextField
          label="Work email"
          name="email"
          type="email"
          placeholder="name@company.com"
          icon={<MailIcon className="h-4 w-4" />}
          autoComplete="email"
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="••••••••"
          hint={
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        />
        <Checkbox label="Remember me for 30 days" name="remember" />
        <Button type="submit">
          Sign in to STRATIVA
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link href="#" className="text-sm font-medium text-text-muted hover:text-text">
          Log in with Enterprise SSO
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-6 border-t border-border pt-4">
        <TrustBadge icon={<ShieldIcon className="h-3.5 w-3.5" />}>
          SOC2 Type II &amp; 256-bit SSL Encrypted
        </TrustBadge>
      </div>
    </AuthCard>
  );
}
