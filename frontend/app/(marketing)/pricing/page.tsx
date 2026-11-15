import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = { title: "Pricing — NEXORA AI", description: "Simple plans for individuals and teams. Start using NEXORA for free." };

export default function Page() { return <PricingPage />; }
