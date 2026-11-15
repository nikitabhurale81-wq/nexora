import Link from "next/link";
import { ArrowRight, Ellipsis, Sparkles } from "lucide-react";
import { AIAssistantWidget } from "@/components/dashboard/ai-assistant-widget";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Icon } from "@/components/shared/icon";
import { DASHBOARD_STATS } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "AI Chat", href: "/chat", icon: "MessageSquare", color: "blue" },
  { label: "Upload File", href: "/documents", icon: "Upload", color: "violet" },
  { label: "Data Analysis", href: "/data-lab", icon: "BarChart3", color: "emerald" },
  { label: "Generate Report", href: "/reports", icon: "FileBarChart", color: "blue" },
  { label: "Open Code Studio", href: "/code-studio", icon: "Code2", color: "cyan" },
];

const quickActionColors: Record<string, string> = {
  blue: "border-blue-400/25 bg-blue-500/15 text-blue-300 shadow-[0_0_17px_rgba(37,99,235,0.18)]",
  violet: "border-violet-400/25 bg-violet-500/15 text-violet-300 shadow-[0_0_17px_rgba(124,58,237,0.16)]",
  emerald: "border-emerald-400/25 bg-emerald-500/15 text-emerald-300 shadow-[0_0_17px_rgba(16,185,129,0.16)]",
  cyan: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300 shadow-[0_0_17px_rgba(6,182,212,0.16)]",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      {/* Greeting row from the approved Dashboard reference */}
      <section className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.025em] text-white sm:text-[28px]">
            Good Morning, Alex! <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 max-w-[390px] text-[13px] leading-5 text-slate-400">
            Let&apos;s turn your ideas into reality today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_7px_#22d3ee]" />
          Tue 09:30 AM
        </div>
      </section>

      {/* Four compact stats, exactly as the reference hierarchy */}
      <section aria-label="Workspace statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      {/* Quick actions */}
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-white">Quick Actions</h2>
          <Link
            href="/saved"
            aria-label="See more quick actions"
            className="grid h-7 w-7 place-items-center rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-cyan-300"
          >
            <Ellipsis className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex min-h-[88px] min-w-0 flex-col items-center justify-center rounded-2xl border border-[#1e3b80]/65 bg-[linear-gradient(145deg,rgba(8,25,63,0.98),rgba(7,18,47,0.98))] px-2 py-3 text-center shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_0_22px_rgba(37,99,235,0.13)]"
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl border transition-transform group-hover:scale-105",
                  quickActionColors[action.color]
                )}
              >
                <Icon name={action.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="mt-2 line-clamp-1 text-[11px] font-bold text-slate-100">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main activity + assistant area */}
      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(260px,0.9fr)]">
        <div className="relative min-h-[258px] overflow-hidden rounded-2xl border border-[#1d3d85]/70 bg-[linear-gradient(145deg,rgba(7,20,51,0.99),rgba(4,14,39,0.99))] p-4 shadow-[0_15px_32px_rgba(0,0,0,0.2)] sm:p-5">
          <div className="pointer-events-none absolute left-1/3 top-0 h-24 w-48 rounded-full bg-blue-600/8 blur-3xl" />
          <div className="relative mb-2 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-white">Your Activity</h2>
            <Link
              href="/usage"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300"
            >
              View Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-[205px]">
            <UsageChart />
          </div>
        </div>

        <AIAssistantWidget />
      </section>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-600 lg:hidden">
        <Sparkles className="h-3 w-3" /> NEXORA workspace is ready
      </div>
    </div>
  );
}
