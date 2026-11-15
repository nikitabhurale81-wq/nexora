import type { Metadata } from "next";
import { SolutionsPage } from "@/components/marketing/solutions-page";

export const metadata: Metadata = { title: "Solutions — NEXORA AI", description: "AI workflows built for teams, founders, creators, and students." };

export default function Page() { return <SolutionsPage />; }
