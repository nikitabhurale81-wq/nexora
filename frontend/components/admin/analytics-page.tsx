"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Clock3,
  Download,
  Eye,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsSeries, featureUsage, regionData } from "./admin-data";
import {
  ActionButton,
  CHART_COLORS,
  downloadCsv,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  SegmentedControl,
  tooltipStyle,
} from "./admin-ui";

export function AnalyticsPage() {
  const [period, setPeriod] = useState("7 days");
  const [metric, setMetric] = useState("Sessions");
  const [retentionOpen, setRetentionOpen] = useState(false);

  const factor = period === "24 hours" ? 0.16 : period === "30 days" ? 4.2 : period === "90 days" ? 12.3 : 1;
  const chartData = useMemo(() => analyticsSeries.map((row) => ({
    ...row,
    sessions: Math.round(row.sessions * factor),
    conversations: Math.round(row.conversations * factor),
    documents: Math.round(row.documents * factor),
  })), [factor]);

  function exportAnalytics() {
    downloadCsv("nexora-product-analytics.csv", [
      ["Day", "Sessions", "Conversations", "Documents"],
      ...chartData.map((row) => [row.day, row.sessions, row.conversations, row.documents]),
    ]);
    toast.success("Analytics CSV downloaded locally.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Product intelligence"
        title="Analytics"
        description="Understand product adoption, engagement patterns, and feature usage across the platform."
        actions={<><SegmentedControl options={["24 hours", "7 days", "30 days", "90 days"]} value={period} onChange={setPeriod} ariaLabel="Analytics period" /><ActionButton onClick={exportAnalytics}><Download className="h-4 w-4" /> Export</ActionButton></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Unique visitors" value="84.2K" change="+9.8%" detail="period over period" icon={<Eye className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Active users" value="62.7K" change="+12.1%" detail="period over period" icon={<Users className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Avg. session" value="12m 48s" change="+1m 14s" detail="vs prior period" icon={<Clock3 className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="Activation rate" value="68.4%" change="+3.2%" detail="completed first task" icon={<MousePointerClick className="h-5 w-5" />} tone="pink" />
      </div>

      <Panel glow>
        <PanelHeader
          title="Engagement trend"
          description={`Daily activity scaled to the selected ${period} view`}
          action={<SegmentedControl options={["Sessions", "Conversations", "Documents"]} value={metric} onChange={setMetric} ariaLabel="Chart metric" />}
        />
        <div className="h-[350px] p-4 pt-6 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
              <defs><linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={metric === "Sessions" ? CHART_COLORS.cyan : metric === "Conversations" ? CHART_COLORS.violet : CHART_COLORS.blue} stopOpacity={0.45} /><stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
              <Area type="monotone" dataKey={metric.toLowerCase()} stroke={metric === "Sessions" ? CHART_COLORS.cyan : metric === "Conversations" ? CHART_COLORS.violet : CHART_COLORS.blue} strokeWidth={2.5} fill="url(#analyticsArea)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Feature adoption" description="Share of active product usage" />
          <div className="grid items-center gap-2 p-5 sm:grid-cols-[220px_1fr]">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={featureUsage} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={3} stroke="none">{featureUsage.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {featureUsage.map((item) => <div key={item.name} className="flex items-center gap-3"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} /><span className="flex-1 text-xs text-slate-400">{item.name}</span><strong className="text-xs text-white">{item.value}%</strong></div>)}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Audience by region" description="Active users and global share" />
          <div className="h-[286px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 16, right: 8 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 6" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} tickFormatter={(value) => `${value / 1000}K`} />
                <YAxis type="category" dataKey="region" width={100} axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
                <Bar dataKey="users" fill={CHART_COLORS.blue} radius={[0, 7, 7, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          <PanelHeader title="Conversion funnel" description="From first visit to recurring usage" />
          <div className="grid gap-4 p-5 sm:grid-cols-4">
            {[{ label: "Visited", value: "84.2K", width: "100%", color: "from-cyan-400 to-blue-500" }, { label: "Signed up", value: "31.8K", width: "78%", color: "from-blue-500 to-indigo-500" }, { label: "First AI task", value: "21.7K", width: "62%", color: "from-indigo-500 to-violet-500" }, { label: "Retained D30", value: "12.4K", width: "46%", color: "from-violet-500 to-fuchsia-500" }].map((step, index) => <div key={step.label} className="relative rounded-xl border border-blue-500/10 bg-[#03091d]/50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">0{index + 1}</p><p className="mt-3 text-xl font-extrabold text-white">{step.value}</p><p className="mt-1 text-xs text-slate-400">{step.label}</p><div className="mt-4 h-1.5 rounded-full bg-slate-800"><div className={`h-full rounded-full bg-gradient-to-r ${step.color}`} style={{ width: step.width }} /></div></div>)}
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Activity className="h-5 w-5" /></div>
          <p className="mt-4 text-sm font-bold text-white">Retention is trending up</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">30-day retention reached 39.1%, up 4.8 points after onboarding improvements.</p>
          <ActionButton variant="secondary" className="mt-5 w-full" onClick={() => setRetentionOpen(true)}>View cohort detail</ActionButton>
        </Panel>
      </div>

      <Modal open={retentionOpen} onClose={() => setRetentionOpen(false)} title="Retention cohorts" description="Illustrative cohort performance for the frontend demo." footer={<ActionButton onClick={() => setRetentionOpen(false)}>Done</ActionButton>}>
        <div className="space-y-3">{[{ cohort: "June 2025", d1: 78, d7: 56, d30: 41 }, { cohort: "May 2025", d1: 75, d7: 52, d30: 39 }, { cohort: "April 2025", d1: 71, d7: 49, d30: 35 }].map((row) => <div key={row.cohort} className="grid grid-cols-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-xs"><strong className="text-white">{row.cohort}</strong><span className="text-center text-slate-400">D1 · {row.d1}%</span><span className="text-center text-slate-400">D7 · {row.d7}%</span><span className="text-right text-emerald-300">D30 · {row.d30}%</span></div>)}</div>
      </Modal>
    </div>
  );
}
