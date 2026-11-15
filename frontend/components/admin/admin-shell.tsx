"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  ExternalLink,
  FileClock,
  HardDrive,
  LayoutDashboard,
  Menu,
  MessageSquareMore,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI usage & costs", href: "/admin/ai-usage", icon: CircleDollarSign },
  { label: "Model config", href: "/admin/models", icon: Bot },
  { label: "Storage", href: "/admin/storage", icon: HardDrive },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquareMore },
  { label: "Audit logs", href: "/admin/logs", icon: FileClock },
  { label: "System health", href: "/admin/health", icon: Activity },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeItem = navItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      toast.info("Type a user, event, or resource to search this demo.");
      return;
    }
    toast.success(`Demo search ready for “${cleanQuery}”`, {
      description: "Use the page-level filters to narrow the local mock data.",
    });
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_58%_-25%,rgba(37,99,235,0.26),transparent_58%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 bg-[radial-gradient(circle,rgba(124,58,237,0.09),transparent_68%)]" />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#01040e]/85 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col border-r border-blue-500/15 bg-[#03091d]/98 shadow-[16px_0_50px_rgba(0,0,0,0.3)] transition-[transform,width] duration-300",
          "lg:relative lg:z-20 lg:translate-x-0 lg:shadow-none",
          collapsed && "lg:w-[76px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-blue-500/15 px-4">
          <Link href="/admin" className="group flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-300/50 bg-[linear-gradient(145deg,#06b6d4_0%,#2563eb_48%,#7c3aed_100%)] shadow-[0_0_24px_rgba(34,211,238,0.32)]">
              <span className="absolute inset-[3px] rounded-[9px] border border-white/25" />
              <span className="relative text-lg font-black italic text-white">N</span>
            </span>
            <span className={cn("min-w-0 lg:block", collapsed && "lg:hidden")}>
              <span className="block text-[16px] font-black tracking-[0.09em] text-white">NEXORA</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-400">Admin console</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          <p className={cn("mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600", collapsed && "lg:hidden")}>Control center</p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 overflow-hidden rounded-xl border px-3 text-[12px] font-semibold transition-all",
                    active
                      ? "border-cyan-400/25 bg-[linear-gradient(90deg,rgba(14,165,233,0.88),rgba(37,99,235,0.82))] text-white shadow-[0_0_24px_rgba(37,99,235,0.24)]"
                      : "border-transparent text-slate-400 hover:border-blue-500/15 hover:bg-blue-500/8 hover:text-white",
                    collapsed && "lg:justify-center lg:px-0"
                  )}
                >
                  {active && <span className="absolute inset-y-1 right-0 w-0.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />}
                  <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-cyan-300")} />
                  <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-blue-500/10 p-3">
          <div className={cn("mb-2 rounded-xl border border-violet-400/15 bg-violet-500/8 p-3", collapsed && "lg:hidden")}>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-violet-300" /> Secure session
            </div>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">Admin activity is captured in audit logs.</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-9 w-full items-center justify-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/5 text-xs font-semibold text-slate-400 hover:bg-blue-500/10 hover:text-white lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="relative z-30 flex h-[72px] shrink-0 items-center gap-3 border-b border-blue-500/15 bg-[#03091d]/72 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/8 text-slate-300 hover:text-white lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden min-w-32 sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Admin /</p>
            <p className="text-sm font-bold text-white">{activeItem?.label ?? "Console"}</p>
          </div>

          <form onSubmit={submitSearch} className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search admin console..."
              className="h-10 w-full rounded-xl border border-blue-500/15 bg-[#071127]/75 pl-9 pr-16 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/10"
              aria-label="Search admin console"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[9px] text-slate-500 md:block">Enter</kbd>
          </form>

          <Link
            href="/dashboard"
            className="hidden h-9 items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/8 px-3 text-xs font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white xl:flex"
          >
            Workspace <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}
              className="relative grid h-9 w-9 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/8 text-slate-300 hover:text-white"
              aria-label="Toggle notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_7px_#67e8f9]" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-cyan-400/15 bg-[#071127] p-3 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Notifications</p>
                  <button type="button" onClick={() => { setNotificationsOpen(false); toast.success("Notifications marked as read in this demo."); }} className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200">Mark read</button>
                </div>
                <button type="button" onClick={() => { setNotificationsOpen(false); toast.info("Opening System Health is available from the sidebar."); }} className="w-full rounded-xl bg-amber-400/8 p-3 text-left hover:bg-amber-400/12">
                  <p className="text-xs font-semibold text-amber-200">Document processing degraded</p>
                  <p className="mt-1 text-[10px] text-slate-500">Elevated latency detected in US East.</p>
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}
              className="flex h-9 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/8 p-1 pr-2 text-left hover:bg-violet-500/12"
              aria-label="Toggle administrator menu"
              aria-expanded={profileOpen}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,#06b6d4,#7c3aed)] text-[10px] font-black text-white">AJ</span>
              <span className="hidden text-[11px] font-bold text-slate-200 xl:block">Alex</span>
              <ChevronDown className="hidden h-3 w-3 text-slate-500 xl:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-2xl border border-violet-400/15 bg-[#071127] p-2 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
                <div className="border-b border-blue-500/10 px-2 py-2">
                  <p className="text-xs font-bold text-white">Alex Johnson</p>
                  <p className="text-[10px] text-slate-500">Super administrator</p>
                </div>
                <button type="button" onClick={() => { setProfileOpen(false); toast.info("Profile settings are a frontend demo action."); }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-blue-500/10 hover:text-white"><Sparkles className="h-3.5 w-3.5" /> Admin preferences</button>
                <button type="button" onClick={() => { setProfileOpen(false); toast.success("Demo session remains active; no backend sign-out was attempted."); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-blue-500/10 hover:text-white"><Database className="h-3.5 w-3.5" /> End demo session</button>
              </div>
            )}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
