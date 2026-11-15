"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Clock3,
  Code2,
  FileText,
  LayoutDashboard,
  MemoryStick,
  MessageSquareText,
  Mic2,
  ScrollText,
  Settings,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const dashboardNav: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", href: "/chat", icon: MessageSquareText },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Data Lab", href: "/data-lab", icon: BarChart3 },
  { label: "Code Studio", href: "/code-studio", icon: Code2 },
  { label: "Voice Room", href: "/voice-room", icon: Mic2 },
  { label: "Reports", href: "/reports", icon: ScrollText },
  { label: "Memory", href: "/memory", icon: MemoryStick },
  { label: "History", href: "/chat/history", icon: Clock3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#01040e]/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col border-r border-[#183274]/70 bg-[#03091d]/98 shadow-[14px_0_45px_rgba(0,0,0,0.28)] transition-transform duration-300",
          "md:relative md:z-20 md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#15295b]/60 px-5">
          <Link href="/dashboard" className="group flex items-center gap-2.5" onClick={onClose}>
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-cyan-300/50 bg-[linear-gradient(145deg,#0ea5e9_0%,#2563eb_46%,#7c3aed_100%)] shadow-[0_0_22px_rgba(34,211,238,0.35)]">
              <span className="absolute inset-[3px] rounded-[9px] border border-white/25" />
              <span className="relative text-lg font-black italic text-white">N</span>
            </span>
            <span className="text-[17px] font-extrabold tracking-[0.08em] text-white">
              NEXORA
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {dashboardNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 overflow-hidden rounded-xl px-3 text-[13px] font-semibold transition-all",
                    active
                      ? "border border-cyan-400/25 bg-[linear-gradient(90deg,rgba(14,165,233,0.92),rgba(29,78,216,0.9))] text-white shadow-[0_0_24px_rgba(37,99,235,0.28)]"
                      : "border border-transparent text-slate-400 hover:border-blue-500/15 hover:bg-blue-500/8 hover:text-white"
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-1 right-0 w-0.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                  )}
                  <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-white" : "text-slate-300 group-hover:text-cyan-300")} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[9px] text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 p-3 pt-2">
          <Link
            href="/plans"
            onClick={onClose}
            className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-xl border border-violet-400/25 bg-[linear-gradient(100deg,rgba(91,33,182,0.75),rgba(67,56,202,0.48))] px-3.5 shadow-[0_0_25px_rgba(124,58,237,0.16)] transition-transform hover:-translate-y-0.5"
          >
            <span className="absolute -right-5 -top-7 h-20 w-20 rounded-full bg-fuchsia-500/20 blur-2xl" />
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-300/15 text-amber-300">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <span>
              <span className="block text-[12px] font-bold text-white">Upgrade to Pro</span>
              <span className="block text-[9px] text-violet-200/70">Unlock every AI tool</span>
            </span>
            <Sparkles className="relative ml-auto h-3.5 w-3.5 text-fuchsia-300" />
          </Link>
        </div>
      </aside>
    </>
  );
}
