import type { Metadata } from "next";
import { SignUp } from "@/features/auth/components/sign-up";

export const metadata: Metadata = {
  title: "Create your account – STRATIVA AI",
};

export default function SignUpPage() {
  return <SignUp />;
}
