"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Download,
  FileText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { overviewSeries } from "./admin-data";
import {
  ActionButton,
  CHART_COLORS,
  downloadCsv,
  MetricCard,
  PageHeader,
  Panel,
  PanelHeader,
  SegmentedControl,
  StatusBadge,
  tooltipStyle,
} from "./admin-ui";
import { useMemo, useState } from "react";

const activity = [
  { title: "Enterprise workspace created", detail: "Orbital Research · 24 seats", time: "8 min ago", icon: Users, tone: "text-cyan-300 bg-cyan-400/10" },
  { title: "Monthly usage report exported", detail: "Sarah Wilson · CSV", time: "24 min ago", icon: FileText, tone: "text-violet-300 bg-violet-400/10" },
  { title: "Model routing updated", detail: "GPT-4.1 set as primary", time: "51 min ago", icon: Bot, tone: "text-blue-300 bg-blue-400/10" },
  { title: "Automated health check passed", detail: "5 of 6 services optimal", time: "1 hr ago", icon: ShieldCheck, tone: "text-emerald-300 bg-emerald-400/10" },
];

const workspaces = [
  { name: "Orbital Research", usage: 86, seats: 42, value: "$18.4K" },
  { name: "Kinetix Labs", usage: 74, seats: 36, value: "$14.8K" },
  { name: "Northstar Design", usage: 63, seats: 28, value: "$11.2K" },
  { name: "Vector Systems", usage: 51, seats: 22, value: "$8.9K" },
];

export function OverviewPage() {
  const [period, setPeriod] = useState("12 months");
  const [refreshedAt, setRefreshedAt] = useState("Just now");
  const chartData = useMemo(() => period === "6 months" ? overviewSeries.slice(-6) : period === "30 days" ? overviewSeries.slice(-4) : overviewSeries, [period]);

  function refresh() {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setRefreshedAt(time);
    toast.success("Dashboard mock data refreshed", { description: `Local view updated at ${time}.` });
  }

  function exportSnapshot() {
    downloadCsv("nexora-admin-overview.csv", [
      ["Month", "Revenue (thousands)", "Users (thousands)", "Requests (thousands)"],
      ...chartData.map((row) => [row.month, row.revenue, row.users, row.requests]),
    ]);
    toast.success("Overview CSV downloaded locally.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live operations"
        title="Admin Dashboard"
        description="Monitor platform growth, usage, revenue, and operational signals from one control center."
        actions={
          <>
            <ActionButton variant="ghost" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</ActionButton>
            <ActionButton onClick={exportSnapshot}><Download className="h-4 w-4" /> Export snapshot</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value="128.6K" change="+12.4%" detail="vs last month" icon={<Users className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Monthly revenue" value="$248.2K" change="+8.7%" detail="vs last month" icon={<CircleDollarSign className="h-5 w-5" />} tone="violet" />
        <MetricCard label="AI requests" value="4.62M" change="+16.2%" detail="this month" icon={<Sparkles className="h-5 w-5" />} tone="pink" />
        <MetricCard label="System uptime" value="99.98%" detail="30-day rolling" icon={<Activity className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,.8fr)]">
        <Panel glow>
          <PanelHeader
            title="Platform growth"
            description={`Revenue, users, and AI requests · refreshed ${refreshedAt}`}
            action={<SegmentedControl options={["30 days", "6 months", "12 months"]} value={period} onChange={setPeriod} ariaLabel="Select chart period" />}
          />
          <div className="h-[330px] p-4 pt-6 sm:p-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="overviewRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.42} />
                    <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="overviewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}K`} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(34,211,238,.2)" }} formatter={(value, name) => [`${value}K`, name === "revenue" ? "Revenue" : "Users"]} />
                <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.violet} strokeWidth={2.5} fill="url(#overviewRevenue)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.violet }} />
                <Area type="monotone" dataKey="users" stroke={CHART_COLORS.cyan} strokeWidth={2.5} fill="url(#overviewUsers)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.cyan }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-5 border-t border-blue-500/10 px-5 py-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" /> Revenue</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-cyan-400" /> Active users</span>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Recent activity" description="Latest administrative events" action={<Link href="/admin/logs" className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200">View logs</Link>} />
          <div className="divide-y divide-blue-500/10 px-4">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 py-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.tone}`}><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-500">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-[9px] text-slate-600">{item.time}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]">
        <Panel>
          <PanelHeader title="Top workspaces" description="Ranked by AI usage this billing cycle" action={<StatusBadge tone="info">Enterprise</StatusBadge>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="border-b border-blue-500/10 text-[9px] uppercase tracking-[0.14em] text-slate-600">
                <tr><th className="px-5 py-3 font-bold">Workspace</th><th className="px-5 py-3 font-bold">Utilization</th><th className="px-5 py-3 font-bold">Seats</th><th className="px-5 py-3 text-right font-bold">MRR</th></tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10">
                {workspaces.map((workspace) => (
                  <tr key={workspace.name} className="hover:bg-blue-500/5">
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-200">{workspace.name}</td>
                    <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="h-1.5 w-28 rounded-full bg-slate-800"><div className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#7c3aed)]" style={{ width: `${workspace.usage}%` }} /></div><span className="text-[10px] text-slate-500">{workspace.usage}%</span></div></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{workspace.seats}</td>
                    <td className="px-5 py-3.5 text-right text-xs font-bold text-white">{workspace.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-sm font-bold text-white">Quick controls</p>
          <p className="mt-1 text-xs text-slate-500">Jump to common admin tasks.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Manage users", href: "/admin/users", icon: Users, color: "text-cyan-300" },
              { label: "Model config", href: "/admin/models", icon: Bot, color: "text-violet-300" },
              { label: "Review costs", href: "/admin/ai-usage", icon: CircleDollarSign, color: "text-emerald-300" },
              { label: "System health", href: "/admin/health", icon: Activity, color: "text-amber-300" },
            ].map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="group rounded-xl border border-blue-500/15 bg-blue-500/5 p-3 hover:border-cyan-400/25 hover:bg-blue-500/10"><Icon className={`h-5 w-5 ${item.color}`} /><span className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-300">{item.label}<ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-300" /></span></Link>;
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
