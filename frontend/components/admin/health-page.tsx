"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  History,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { healthMetrics, serviceHealth } from "./admin-data";
import {
  ActionButton,
  CHART_COLORS,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  SegmentedControl,
  StatusBadge,
  tooltipStyle,
} from "./admin-ui";

export function HealthPage() {
  const [range, setRange] = useState("24 hours");
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState("14:34 UTC");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  function runChecks() {
    setChecking(true);
    window.setTimeout(() => {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChecking(false);
      setCheckedAt(time);
      toast.success("Frontend health simulation complete", { description: "5 operational services and 1 degraded service." });
    }, 850);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform operations"
        title="System Health"
        description="Monitor service availability, request performance, and recent operational incidents."
        actions={<><ActionButton variant="ghost" onClick={() => setHistoryOpen(true)}><History className="h-4 w-4" /> Incident history</ActionButton><ActionButton disabled={checking} onClick={runChecks}><RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} /> {checking ? "Running checks..." : "Run checks"}</ActionButton></>}
      />

      <Panel className="border-emerald-400/20 bg-[linear-gradient(110deg,rgba(16,185,129,.09),rgba(7,17,39,.82)_42%,rgba(37,99,235,.07))] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,.14)]"><ShieldCheck className="h-6 w-6" /></span>
          <div className="flex-1"><div className="flex items-center gap-2"><h2 className="text-base font-bold text-white">Core platform is operational</h2><i className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_9px_#34d399]" /></div><p className="mt-1 text-xs text-slate-400">One non-critical service has elevated processing latency. Last local check: {checkedAt}.</p></div>
          <StatusBadge tone="success">99.98% platform uptime</StatusBadge>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Global uptime" value="99.98%" detail="30-day rolling" icon={<Activity className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="API latency" value="56 ms" change="-8 ms" detail="p50 response" icon={<Zap className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Error rate" value="0.17%" change="-0.03%" detail="past 24 hours" icon={<AlertTriangle className="h-5 w-5" />} tone="amber" />
        <MetricCard label="Compute load" value="52%" detail="across 24 clusters" icon={<Cpu className="h-5 w-5" />} tone="violet" />
      </div>

      <Panel glow>
        <PanelHeader title="Performance telemetry" description="API latency and compute load" action={<SegmentedControl options={["1 hour", "24 hours", "7 days"]} value={range} onChange={setRange} ariaLabel="Telemetry range" />} />
        <div className="h-[330px] p-4 pt-6 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthMetrics} margin={{ left: -12, right: 4 }}>
              <defs><linearGradient id="healthLoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.34} /><stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="load" name="Compute load (%)" stroke={CHART_COLORS.violet} strokeWidth={2} fill="url(#healthLoad)" />
              <Line type="monotone" dataKey="latency" name="API latency (ms)" stroke={CHART_COLORS.cyan} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-bold text-white">Service status</h2><p className="mt-1 text-xs text-slate-500">Live-style status cards using local mock metrics</p></div><span className="hidden text-[10px] text-slate-600 sm:block">6 services monitored</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviceHealth.map((service) => (
            <Panel key={service.name} className={`p-4 ${service.status === "Degraded" ? "border-amber-400/20" : "hover:border-emerald-400/20"}`}>
              <div className="flex items-start gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${service.status === "Degraded" ? "bg-amber-400/10 text-amber-300" : "bg-emerald-400/10 text-emerald-300"}`}><Server className="h-4 w-4" /></span><div className="flex-1"><p className="text-xs font-bold text-white">{service.name}</p><p className="mt-0.5 text-[9px] text-slate-600">{service.region}</p></div><StatusBadge tone={service.status === "Operational" ? "success" : "warning"}><i className="h-1.5 w-1.5 rounded-full bg-current" />{service.status}</StatusBadge></div>
              <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-[#03091d]/60 p-2.5"><p className="text-[8px] uppercase tracking-wider text-slate-600">Uptime</p><p className="mt-1 text-xs font-semibold text-slate-200">{service.uptime}</p></div><div className="rounded-lg bg-[#03091d]/60 p-2.5"><p className="text-[8px] uppercase tracking-wider text-slate-600">Latency</p><p className="mt-1 text-xs font-semibold text-slate-200">{service.latency}</p></div></div>
              <div className="mt-3 flex h-8 items-end gap-1">{service.history.map((point, index) => <i key={index} className={`flex-1 rounded-sm ${point < 98 ? "bg-amber-400/65" : "bg-emerald-400/45"}`} style={{ height: `${Math.max(18, point - 82)}px` }} />)}</div>
            </Panel>
          ))}
        </div>
      </div>

      <Panel>
        <PanelHeader title="Active incident" description="Document processing · US East" action={<StatusBadge tone={acknowledged ? "info" : "warning"}>{acknowledged ? "Acknowledged" : "Monitoring"}</StatusBadge>} />
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><AlertTriangle className="h-5 w-5" /></span>
          <div className="flex-1"><p className="text-sm font-bold text-white">Elevated document processing latency</p><p className="mt-1 text-xs leading-5 text-slate-500">Large PDF indexing jobs are taking 30–60 seconds longer than normal. Interactive chat and other services remain unaffected.</p></div>
          <div className="text-left lg:text-right"><p className="flex items-center gap-1 text-[10px] text-slate-500 lg:justify-end"><Clock3 className="h-3 w-3" /> Started 41 min ago</p><ActionButton variant="secondary" size="sm" className="mt-2" onClick={() => { setAcknowledged((value) => !value); toast.success(acknowledged ? "Local acknowledgement removed." : "Incident acknowledged in this demo."); }}>{acknowledged ? "Undo acknowledgement" : "Acknowledge"}</ActionButton></div>
        </div>
      </Panel>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Incident history" description="Past 30 days · illustrative operational records" size="lg" footer={<ActionButton onClick={() => setHistoryOpen(false)}>Done</ActionButton>}>
        <div className="space-y-3">{[
          { title: "Object storage latency", date: "Jun 11, 2025", duration: "18 min", impact: "Minor", status: "Resolved" },
          { title: "OAuth callback errors", date: "Jun 4, 2025", duration: "7 min", impact: "Minor", status: "Resolved" },
          { title: "Inference provider timeout", date: "May 29, 2025", duration: "26 min", impact: "Moderate", status: "Resolved" },
        ].map((incident) => <div key={incident.title} className="flex flex-col gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 sm:flex-row sm:items-center"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /><div className="flex-1"><p className="text-xs font-semibold text-white">{incident.title}</p><p className="mt-1 text-[10px] text-slate-500">{incident.date} · {incident.duration} · {incident.impact} impact</p></div><StatusBadge tone="success">{incident.status}</StatusBadge></div>)}</div>
      </Modal>
    </div>
  );
}
