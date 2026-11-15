import type { Metadata } from "next";
import { FeaturesPage } from "@/components/marketing/features-page";

export const metadata: Metadata = { title: "Features — NEXORA AI", description: "Explore NEXORA AI chat, document intelligence, Data Lab, Code Studio, Voice Room, and private memory." };

export default function Page() { return <FeaturesPage />; }
