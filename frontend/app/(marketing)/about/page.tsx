import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about-page";

export const metadata: Metadata = { title: "About — NEXORA AI", description: "Why NEXORA is building a calmer, more connected way to work with AI." };

export default function Page() { return <AboutPage />; }
