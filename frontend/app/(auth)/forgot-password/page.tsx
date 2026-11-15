import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset password — NEXORA AI", description: "Request a secure password reset link for NEXORA." };

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Account recovery" title="Reset your password." description="Enter the email connected to your workspace and we will send a secure reset link."><ForgotPasswordForm /></AuthShell>;
}
