import type { Metadata } from "next";
import { SignIn } from "@/features/auth/components/sign-in";

export const metadata: Metadata = {
  title: "Sign in – STRATIVA AI",
};

export default function LoginPage() {
  return <SignIn />;
}
