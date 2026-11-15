import type { Metadata } from "next";
import { GuestPage } from "@/components/auth/guest-page";

export const metadata: Metadata = { title: "Guest mode — NEXORA AI", description: "Try the NEXORA AI workspace without creating an account." };

export default function Page() { return <GuestPage />; }
