"use client";

import { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  Lightbulb,
  Table2,
  Upload,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { MetricTile, NeonSurface, PageIntro, Pill, WorkspacePage, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

const rows = [
  { month: "Jan", revenue: 42000, orders: 312, region: "North", growth: 8.2 },
  { month: "Feb", revenue: 51000, orders: 364, region: "West", growth: 12.4 },
  { month: "Mar", revenue: 57000, orders: 391, region: "South", growth: 11.7 },
  { month: "Apr", revenue: 68000, orders: 448, region: "East", growth: 19.3 },
  { month: "May", revenue: 74000, orders: 492, region: "North", growth: 8.8 },
  { month: "Jun", revenue: 83000, orders: 541, region: "West", growth: 12.2 },
];

const regionData = [
  { name: "North", value: 31, color: "#2563eb" },
  { name: "West", value: 27, color: "#8b5cf6" },
  { name: "East", value: 24, color: "#06b6d4" },
  { name: "South", value: 18, color: "#10b981" },
];

export function DataLab() {
  const [tab, setTab] = useState<"Data" | "Charts" | "Insights">("Data");
  const [region, setRegion] = useState("All regions");
  const [fileName, setFileName] = useState("Sales_Performance_2026.xlsx");
  const fileRef = useRef<HTMLInputElement>(null);
  const filteredRows = useMemo(() => region === "All regions" ? rows : rows.filter((row) => row.region === region), [region]);

  function upload(file?: File) {
    if (!file) return;
    setFileName(file.name);
    toast.success(`${file.name} loaded with mock preview data`);
  }

  function downloadReport() {
    const csv = ["Month,Revenue,Orders,Region,Growth", ...filteredRows.map((row) => `${row.month},${row.revenue},${row.orders},${row.region},${row.growth}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "nexora-data-report.csv"; anchor.click(); URL.revokeObjectURL(url);
    toast.success("CSV report downloaded");
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Spreadsheet intelligence" title="Data Lab" description="Explore CSV and Excel datasets with previews, charts, filters, and AI-generated observations." actions={<><input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => upload(event.target.files?.[0])} /><button onClick={() => fileRef.current?.click()} className={primaryButton}><Upload className="h-4 w-4" /> Upload CSV / Excel</button></>} />

      <NeonSurface className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-300"><FileSpreadsheet className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-[13px] font-bold text-white">{fileName}</p><p className="text-[10px] text-slate-500">6 rows shown · 12,000 total rows · 8 columns</p></div><Pill tone="green">Ready</Pill></div>
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-slate-500" /><select value={region} onChange={(event) => setRegion(event.target.value)} className="h-9 rounded-xl border border-[#244484]/65 bg-[#07152f] px-3 text-[11px] text-slate-300 outline-none"><option>All regions</option><option>North</option><option>West</option><option>East</option><option>South</option></select><button onClick={downloadReport} className={secondaryButton}><Download className="h-4 w-4" /> Report</button></div>
      </NeonSurface>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="Total Revenue" value="$375K" detail="+12.8% vs prior" icon={BarChart3} tone="blue" />
        <MetricTile label="Average Order" value="$153" detail="+6.2%" icon={Database} tone="violet" />
        <MetricTile label="Top Region" value="North" detail="31% contribution" icon={Table2} tone="cyan" />
        <MetricTile label="Rows Analyzed" value="12K" detail="No missing values" icon={Lightbulb} tone="emerald" />
      </div>

      <NeonSurface className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18316b]/55 px-4 py-3 sm:px-5"><div className="flex gap-1 rounded-xl border border-[#1c3977]/60 bg-[#050f25] p-1">{(["Data", "Charts", "Insights"] as const).map((value) => <button key={value} onClick={() => setTab(value)} className={cn("h-8 rounded-lg px-4 text-[10px] font-bold", tab === value ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,.25)]" : "text-slate-500 hover:text-white")}>{value}</button>)}</div><p className="text-[10px] text-slate-500">Auto-saved locally · Mock dataset</p></div>

        {tab === "Data" && <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#07152f]"><tr>{["Month", "Revenue", "Orders", "Region", "Growth"].map((heading) => <th key={heading} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#17306a]/45">{filteredRows.map((row) => <tr key={`${row.month}-${row.region}`} className="hover:bg-blue-500/5"><td className="px-5 py-3 text-[12px] font-semibold text-white">{row.month}</td><td className="px-5 py-3 text-[12px] text-slate-300">${row.revenue.toLocaleString()}</td><td className="px-5 py-3 text-[12px] text-slate-300">{row.orders}</td><td className="px-5 py-3"><Pill tone="blue">{row.region}</Pill></td><td className="px-5 py-3 text-[12px] font-semibold text-emerald-400">+{row.growth}%</td></tr>)}</tbody></table>{!filteredRows.length && <div className="p-12 text-center text-sm text-slate-500">No rows match this region.</div>}</div>}

        {tab === "Charts" && <div className="grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr] sm:p-5"><div className="rounded-xl border border-[#1d3a78]/60 bg-[#050f26] p-4"><h3 className="text-[12px] font-bold text-white">Revenue by Month</h3><div className="mt-3 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredRows}><CartesianGrid stroke="rgba(59,130,246,.12)" vertical={false} /><XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#07152f", border: "1px solid #244484", borderRadius: 10 }} /><Bar dataKey="revenue" fill="#3b82f6" radius={[6,6,0,0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></div><div className="rounded-xl border border-[#1d3a78]/60 bg-[#050f26] p-4"><h3 className="text-[12px] font-bold text-white">Regional Share</h3><div className="mt-3 h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={regionData} dataKey="value" innerRadius={55} outerRadius={88} paddingAngle={3} isAnimationActive={false}>{regionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ background: "#07152f", border: "1px solid #244484", borderRadius: 10 }} /><Legend wrapperStyle={{ fontSize: 10 }} /></PieChart></ResponsiveContainer></div></div></div>}

        {tab === "Insights" && <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 sm:p-5">{[{ title: "Growth is accelerating", body: "Revenue increased in five of six periods, led by April and June.", tone: "blue" }, { title: "North leads contribution", body: "North contributes 31%, but West has the strongest repeat purchase signal.", tone: "violet" }, { title: "Recommended next step", body: "Compare acquisition cost by region before increasing the July media budget.", tone: "green" }].map((insight) => <div key={insight.title} className="rounded-xl border border-[#21417f]/65 bg-[#07152f] p-5"><Pill tone={insight.tone as "blue" | "violet" | "green"}>AI insight</Pill><h3 className="mt-3 text-[13px] font-bold text-white">{insight.title}</h3><p className="mt-2 text-[11px] leading-5 text-slate-400">{insight.body}</p></div>)}</div>}
      </NeonSurface>
    </WorkspacePage>
  );
}
