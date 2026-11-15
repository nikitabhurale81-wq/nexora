import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";

export const metadata: Metadata = { title: "Contact — NEXORA AI", description: "Talk with NEXORA about product questions, team plans, or partnerships." };

export default function Page() { return <ContactPage />; }
