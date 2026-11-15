"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Link2, LockKeyhole, MonitorCog, Settings2 } from "lucide-react";
import { PageIntro, WorkspacePage } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

const links = [
  { label: "General", href: "/settings", icon: Settings2 },
  { label: "Appearance", href: "/settings/appearance", icon: MonitorCog },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Privacy & Security", href: "/settings/privacy-security", icon: LockKeyhole },
  { label: "Connected Apps", href: "/settings/connected-apps", icon: Link2 },
];

export function SettingsFrame({ title, description, children, actions }: { title: string; description: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <WorkspacePage>
      <PageIntro eyebrow="Workspace preferences" title={title} description={description} actions={actions} />
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="rounded-2xl border border-[#1c397b]/70 bg-[#06132f] p-2 lg:sticky lg:top-5">{links.map((item) => { const Icon = item.icon; const active = pathname === item.href; return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold", active ? "border border-blue-400/20 bg-blue-600/25 text-blue-200" : "text-slate-500 hover:bg-blue-500/5 hover:text-white")}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav>
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </WorkspacePage>
  );
}
