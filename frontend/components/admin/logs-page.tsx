"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileClock,
  Pause,
  Play,
  ShieldAlert,
} from "lucide-react";
import { auditLogs, type AuditLog } from "./admin-data";
import {
  ActionButton,
  downloadCsv,
  EmptyState,
  inputClass,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  SearchField,
  SegmentedControl,
  StatusBadge,
} from "./admin-ui";

const resultTone = { Success: "success", Warning: "warning", Failed: "danger" } as const;
const categoryTone = { Authentication: "violet", User: "info", Model: "info", Storage: "warning", Billing: "success" } as const;

export function LogsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [result, setResult] = useState("All results");
  const [period, setPeriod] = useState("Today");
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const filtered = useMemo(() => auditLogs.filter((log) =>
    (category === "All categories" || log.category === category) &&
    (result === "All results" || log.result === result) &&
    `${log.id} ${log.actor} ${log.action} ${log.resource} ${log.ip}`.toLowerCase().includes(query.toLowerCase())
  ), [query, category, result]);

  function exportLogs() {
    downloadCsv(`nexora-audit-logs-${period.toLowerCase().replace(" ", "-")}.csv`, [
      ["Event ID", "Timestamp", "Actor", "Action", "Resource", "Category", "Result", "IP"],
      ...filtered.map((log) => [log.id, log.timestamp, log.actor, log.action, log.resource, log.category, log.result, log.ip]),
    ]);
    toast.success("Filtered audit events downloaded.");
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Event ID copied.");
    } catch {
      toast.error("Clipboard access is unavailable in this browser.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security trail"
        title="Audit Logs"
        description="Search and inspect administrator, user, system, and provider events in the demo event stream."
        actions={<><SegmentedControl options={["Today", "7 days", "30 days"]} value={period} onChange={setPeriod} ariaLabel="Audit period" /><ActionButton variant="ghost" onClick={() => { setLive((value) => !value); toast.info(live ? "Live demo stream paused." : "Live demo stream resumed."); }}>{live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{live ? "Pause live" : "Resume live"}</ActionButton><ActionButton onClick={exportLogs}><Download className="h-4 w-4" /> Export</ActionButton></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Events today" value="18,492" change="+6.4%" detail="vs yesterday" icon={<FileClock className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Successful" value="99.74%" detail="18,444 events" icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="Warnings" value="41" detail="requires review" icon={<AlertTriangle className="h-5 w-5" />} tone="amber" />
        <MetricCard label="Failed events" value="7" detail="0.04% of volume" icon={<ShieldAlert className="h-5 w-5" />} tone="pink" />
      </div>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-blue-500/10 p-4 xl:flex-row xl:items-center">
          <SearchField value={query} onChange={setQuery} placeholder="Search actor, action, resource, IP, or event ID..." className="w-full xl:max-w-lg" />
          <div className="flex flex-1 flex-wrap gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={`${inputClass} w-auto min-w-40`} aria-label="Filter event category"><option>All categories</option><option>Authentication</option><option>User</option><option>Model</option><option>Storage</option><option>Billing</option></select>
            <select value={result} onChange={(event) => setResult(event.target.value)} className={`${inputClass} w-auto min-w-36`} aria-label="Filter event result"><option>All results</option><option>Success</option><option>Warning</option><option>Failed</option></select>
            <div className="ml-auto flex items-center gap-2 rounded-xl border border-blue-500/10 bg-[#03091d]/50 px-3 text-[10px] font-semibold text-slate-500"><i className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"}`} />{live ? "Live stream" : "Stream paused"}</div>
          </div>
        </div>

        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left"><thead className="border-b border-blue-500/10 text-[9px] uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Resource</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Result</th><th className="px-5 py-3">Source IP</th><th className="px-5 py-3 text-right">Detail</th></tr></thead><tbody className="divide-y divide-blue-500/10">{filtered.map((log) => <tr key={log.id} className="hover:bg-blue-500/5"><td className="whitespace-nowrap px-5 py-3.5"><p className="font-mono text-[10px] text-slate-400">{log.timestamp}</p><p className="mt-0.5 font-mono text-[9px] text-slate-700">{log.id}</p></td><td className="px-5 py-3.5 text-xs font-semibold text-slate-300">{log.actor}</td><td className="px-5 py-3.5 text-xs text-slate-300">{log.action}</td><td className="max-w-48 truncate px-5 py-3.5 text-xs text-slate-500">{log.resource}</td><td className="px-5 py-3.5"><StatusBadge tone={categoryTone[log.category]}>{log.category}</StatusBadge></td><td className="px-5 py-3.5"><StatusBadge tone={resultTone[log.result]}><i className="h-1.5 w-1.5 rounded-full bg-current" />{log.result}</StatusBadge></td><td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{log.ip}</td><td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelected(log)} className="inline-grid h-8 w-8 place-items-center rounded-lg border border-blue-500/15 text-slate-500 hover:border-cyan-400/30 hover:text-cyan-300" aria-label={`View event ${log.id}`}><Eye className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table></div> : <EmptyState message="No audit events match the current filters." />}
        <div className="flex flex-col gap-2 border-t border-blue-500/10 px-5 py-3 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{filtered.length} events shown from the local sample</span><span>Retention policy: 365 days · immutable archive</span></div>
      </Panel>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Audit event detail" description={selected?.id} footer={<>{selected && <ActionButton variant="secondary" onClick={() => copyId(selected.id)}><Clipboard className="h-4 w-4" /> Copy event ID</ActionButton>}<ActionButton onClick={() => setSelected(null)}>Close</ActionButton></>}>
        {selected && <div className="space-y-5"><div className="flex flex-wrap gap-2"><StatusBadge tone={categoryTone[selected.category]}>{selected.category}</StatusBadge><StatusBadge tone={resultTone[selected.result]}>{selected.result}</StatusBadge></div><p className="text-sm leading-6 text-slate-300">{selected.details}</p><dl className="grid gap-3 sm:grid-cols-2">{[["Timestamp", selected.timestamp], ["Actor", selected.actor], ["Action", selected.action], ["Resource", selected.resource], ["Source IP", selected.ip], ["Event ID", selected.id]].map(([label, value]) => <div key={label} className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-3"><dt className="text-[9px] uppercase tracking-wider text-slate-600">{label}</dt><dd className="mt-1 break-all text-xs font-semibold text-slate-200">{value}</dd></div>)}</dl><p className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-[10px] leading-5 text-slate-500">This record is realistic mock data for the frontend showcase. No production audit store was queried.</p></div>}
      </Modal>
    </div>
  );
}
