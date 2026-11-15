import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account — NEXORA AI", description: "Create your free NEXORA AI workspace." };

export default function SignupPage() {
  return <AuthShell eyebrow="Start creating" title="Your best work starts here." description="Create a free workspace and turn your next idea into momentum."><SignupForm /></AuthShell>;
}
