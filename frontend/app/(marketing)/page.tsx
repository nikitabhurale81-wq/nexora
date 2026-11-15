import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "NEXORA AI — Think Deeper. Create Smarter.",
  description: "One intelligent workspace for AI chat, documents, data, code, and voice.",
};

export default function HomePage() {
  return <LandingPage />;
}
