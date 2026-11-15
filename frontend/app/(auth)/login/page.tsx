import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in — NEXORA AI", description: "Sign in to your NEXORA AI workspace." };

export default function LoginPage() {
  return <AuthShell eyebrow="Welcome back" title="Continue your thinking." description="Your conversations, sources, and projects are waiting."><LoginForm /></AuthShell>;
}
