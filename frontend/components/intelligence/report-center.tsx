"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Download, FileBarChart, FileSpreadsheet, FileText, MoreHorizontal, Plus, SearchX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { MetricTile, NeonSurface, PageIntro, Pill, SearchBox, SurfaceHeader, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

type Report = { id: number; title: string; template: string; date: string; status: "Ready" | "Draft"; format: "PDF" | "DOCX" | "XLSX"; color: string };
const seedReports: Report[] = [
  { id: 1, title: "Q2 Business Performance", template: "Business Report", date: "May 14, 2026", status: "Ready", format: "PDF", color: "blue" },
  { id: 2, title: "AI Market Research", template: "Research Report", date: "May 12, 2026", status: "Ready", format: "DOCX", color: "violet" },
  { id: 3, title: "Sales Data Analysis", template: "Data Analysis", date: "May 10, 2026", status: "Ready", format: "XLSX", color: "cyan" },
  { id: 4, title: "Product Launch Brief", template: "Executive Brief", date: "May 08, 2026", status: "Draft", format: "PDF", color: "emerald" },
];
const templates = [
  { name: "Business Report", description: "KPIs, trends, risks, and recommendations", icon: BarChart3, color: "blue" },
  { name: "Research Report", description: "Evidence, citations, findings, and synthesis", icon: FileText, color: "violet" },
  { name: "Data Analysis", description: "Charts, observations, and downloadable tables", icon: FileSpreadsheet, color: "cyan" },
  { name: "Executive Brief", description: "One-page decision summary for leadership", icon: Sparkles, color: "emerald" },
];

export function ReportCenter() {
  const [reports, setReports] = useState(seedReports);
  const [tab, setTab] = useState("All Reports");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("Business Report");
  const [format, setFormat] = useState<Report["format"]>("PDF");

  const visible = useMemo(() => reports.filter((report) => report.title.toLowerCase().includes(query.toLowerCase()) && (tab !== "Drafts" || report.status === "Draft")), [query, reports, tab]);

  function createReport() {
    if (!title.trim()) { toast.error("Report title is required"); return; }
    setReports((current) => [{ id: Date.now(), title, template, date: "Just now", status: "Draft", format, color: "blue" }, ...current]);
    setModalOpen(false); setTitle(""); toast.success("Draft report created");
  }

  function download(report: Report) {
    const text = `NEXORA AI REPORT\n\n${report.title}\nTemplate: ${report.template}\nGenerated in frontend mock mode.`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${report.title.replaceAll(" ", "-").toLowerCase()}.${report.format.toLowerCase()}.txt`; anchor.click(); URL.revokeObjectURL(url);
    toast.success(`${report.format} mock export downloaded`);
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="AI report builder" title="Report Center" description="Turn conversations, documents, and datasets into polished downloadable reports." actions={<button onClick={() => setModalOpen(true)} className={primaryButton}><Plus className="h-4 w-4" /> New Report</button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="All Reports" value={String(reports.length)} detail="Across 4 templates" icon={FileBarChart} tone="blue" /><MetricTile label="Generated This Month" value="12" detail="+20% vs April" icon={CalendarDays} tone="violet" /><MetricTile label="Ready to Export" value={String(reports.filter((report) => report.status === "Ready").length)} detail="PDF, DOCX, XLSX" icon={Download} tone="emerald" /><MetricTile label="Drafts" value={String(reports.filter((report) => report.status === "Draft").length)} detail="Continue editing" icon={FileText} tone="amber" /></div>

      <NeonSurface className="overflow-hidden"><SurfaceHeader title="Report Templates" description="Start from a structured format designed for the task" /><div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">{templates.map((item) => { const TemplateIcon = item.icon; return <button key={item.name} onClick={() => { setTemplate(item.name); setModalOpen(true); }} className="rounded-xl border border-[#203d7c]/60 bg-[#07152f] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/35"><span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/12 text-blue-300"><TemplateIcon className="h-5 w-5" /></span><h3 className="mt-3 text-[12px] font-bold text-white">{item.name}</h3><p className="mt-1 text-[9px] leading-4 text-slate-500">{item.description}</p></button>; })}</div></NeonSurface>

      <NeonSurface className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#18316b]/55 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 rounded-xl border border-[#1c3977]/60 bg-[#050f25] p-1">{["All Reports", "Drafts", "Templates"].map((value) => <button key={value} onClick={() => setTab(value)} className={cn("h-8 rounded-lg px-4 text-[10px] font-bold", tab === value ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white")}>{value}</button>)}</div><SearchBox value={query} onChange={setQuery} placeholder="Search reports..." className="w-full lg:w-72" /></div>
        {tab === "Templates" ? <div className="grid gap-3 p-4 md:grid-cols-2 sm:p-5">{templates.map((item) => <button key={item.name} onClick={() => { setTemplate(item.name); setModalOpen(true); }} className="flex items-center justify-between rounded-xl border border-[#203d7c]/60 bg-[#07152f] p-4 text-left hover:border-cyan-400/35"><span><strong className="block text-[12px] text-white">{item.name}</strong><span className="mt-1 block text-[10px] text-slate-500">{item.description}</span></span><Plus className="h-4 w-4 text-blue-300" /></button>)}</div> : <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">{visible.map((report) => <article key={report.id} className="overflow-hidden rounded-2xl border border-[#203e7e]/65 bg-[#07152f]"><div className="relative h-36 overflow-hidden bg-[linear-gradient(145deg,rgba(37,99,235,.22),rgba(124,58,237,.16),rgba(6,182,212,.08))] p-5"><div className="absolute -right-6 -top-8 h-28 w-28 rounded-full border border-cyan-300/15" /><div className="absolute right-3 top-4 h-20 w-28 rounded-lg border border-white/10 bg-white/5 p-2"><div className="h-2 w-16 rounded bg-blue-400/40" /><div className="mt-2 h-1.5 w-full rounded bg-white/10" /><div className="mt-1 h-1.5 w-4/5 rounded bg-white/10" /><div className="mt-3 flex h-8 items-end gap-1">{[35,60,45,75,55].map((height, index) => <span key={index} className="flex-1 rounded-t bg-[linear-gradient(180deg,#22d3ee,#7c3aed)]" style={{ height: `${height}%` }} />)}</div></div><FileBarChart className="h-8 w-8 text-cyan-300" /><p className="mt-3 text-[9px] uppercase tracking-widest text-blue-300">{report.template}</p></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[13px] font-bold text-white">{report.title}</h3><p className="mt-1 text-[9px] text-slate-500">{report.date}</p></div><Pill tone={report.status === "Ready" ? "green" : "amber"}>{report.status}</Pill></div><div className="mt-4 flex gap-2"><Link href={`/reports/preview?id=${report.id}`} className={`${secondaryButton} flex-1`}>Preview</Link><button onClick={() => download(report)} className={iconButton} aria-label="Download report"><Download className="h-4 w-4" /></button><button onClick={() => toast("More report actions opened")} className={iconButton} aria-label="More report actions"><MoreHorizontal className="h-4 w-4" /></button></div></div></article>)}{!visible.length && <div className="col-span-full py-16 text-center"><SearchX className="mx-auto h-10 w-10 text-slate-700" /><p className="mt-2 text-xs text-slate-500">No reports match your search.</p></div>}</div>}
      </NeonSurface>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a report" description="Choose the source, template, and preferred export format."><div className="space-y-4"><label className="block text-[11px] text-slate-300">Report title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. May Performance Review" className="mt-2 h-10 w-full rounded-xl border border-[#244585]/65 bg-[#07152f] px-3 text-white outline-none" /></label><label className="block text-[11px] text-slate-300">Template<select value={template} onChange={(event) => setTemplate(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#244585]/65 bg-[#07152f] px-3 text-white outline-none">{templates.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label className="block text-[11px] text-slate-300">Source<select className="mt-2 h-10 w-full rounded-xl border border-[#244585]/65 bg-[#07152f] px-3 text-white outline-none"><option>Q2 Sales Dataset</option><option>Nexora Product Proposal</option><option>Current AI Chat</option></select></label><div><p className="mb-2 text-[11px] text-slate-300">Export format</p><div className="grid grid-cols-3 gap-2">{(["PDF", "DOCX", "XLSX"] as const).map((value) => <button key={value} onClick={() => setFormat(value)} className={cn("h-10 rounded-xl border text-[10px] font-bold", format === value ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-300" : "border-[#244585]/60 text-slate-500")}>{value}</button>)}</div></div><div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className={secondaryButton}>Cancel</button><button onClick={createReport} className={primaryButton}>Create Draft</button></div></div></Modal>
    </WorkspacePage>
  );
}
