"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BarChart3, Check, Download, Edit3, FileSpreadsheet, FileText, Printer, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { NeonSurface, PageIntro, Pill, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

const sections = ["Executive Summary", "Performance Overview", "Growth Analysis", "Key Risks", "Recommendations"];
const chartBars = [48, 62, 55, 78, 71, 89];

export function ReportPreview() {
  const [active, setActive] = useState(sections[0]);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("NEXORA recorded steady business growth during Q2, with revenue increasing 18.6% and customer retention reaching 92%. Product engagement remains strongest in document intelligence and AI chat workflows.");

  function exportFile(format: string) {
    const body = `NEXORA AI — Q2 Business Performance\n\n${summary}\n\nRevenue: $375,000\nGrowth: 18.6%\nRetention: 92%\n\nFrontend mock export (${format}).`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `q2-business-performance.${format.toLowerCase()}.txt`; anchor.click(); URL.revokeObjectURL(url);
    toast.success(`${format} mock export downloaded`);
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Generated report" title="Report Preview" description="Review, edit, and export the generated Q2 Business Performance report." actions={<><Link href="/reports" className={secondaryButton}><ArrowLeft className="h-4 w-4" /> Reports</Link><button onClick={() => setEditing((value) => !value)} className={secondaryButton}>{editing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}{editing ? "Finish Editing" : "Edit"}</button><button onClick={() => toast.success("Share link copied") } className={iconButton} aria-label="Share report"><Share2 className="h-4 w-4" /></button></>} />

      <NeonSurface className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-2"><Pill tone="green">Ready</Pill><span className="text-[10px] text-slate-500">Last generated 2 minutes ago · 8 pages</span></div><div className="flex flex-wrap gap-2"><button onClick={() => exportFile("PDF")} className={secondaryButton}><FileText className="h-4 w-4 text-rose-300" /> PDF</button><button onClick={() => exportFile("DOCX")} className={secondaryButton}><FileText className="h-4 w-4 text-blue-300" /> DOCX</button><button onClick={() => exportFile("XLSX")} className={secondaryButton}><FileSpreadsheet className="h-4 w-4 text-emerald-300" /> Excel</button><button onClick={() => window.print()} className={iconButton} aria-label="Print report"><Printer className="h-4 w-4" /></button></div></NeonSurface>

      <div className="grid items-start gap-5 xl:grid-cols-[220px_minmax(0,1fr)_270px]">
        <NeonSurface className="overflow-hidden xl:sticky xl:top-5"><div className="border-b border-[#18316b]/55 p-4"><h2 className="text-[12px] font-bold text-white">Report Outline</h2><p className="mt-1 text-[9px] text-slate-500">8 pages · 5 sections</p></div><nav className="p-2">{sections.map((section, index) => <button key={section} onClick={() => setActive(section)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[10px] font-semibold", active === section ? "bg-blue-600/25 text-blue-200" : "text-slate-500 hover:bg-blue-500/5 hover:text-white")}><span className="grid h-6 w-6 place-items-center rounded-lg bg-white/5 text-[9px]">{index + 1}</span>{section}</button>)}</nav></NeonSurface>

        <div className="overflow-hidden rounded-md bg-white text-slate-800 shadow-[0_25px_65px_rgba(0,0,0,.38)]">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f2a62,#312e81,#0e7490)] px-7 py-9 text-white sm:px-12"><div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-cyan-200/15" /><p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-200">NEXORA Intelligence Report</p><h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Q2 Business Performance</h2><p className="mt-2 text-[11px] text-blue-100/75">Prepared for Alex Johnson · May 14, 2026</p></div>
          <article className="px-7 py-8 sm:px-12 sm:py-10"><div className="flex items-center justify-between border-b border-slate-200 pb-3"><h3 className="text-xl font-bold">{active}</h3><span className="text-[10px] text-slate-400">NEXORA / 03</span></div>{editing ? <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={6} className="mt-6 w-full rounded-lg border border-blue-300 p-4 text-[13px] leading-7 outline-none focus:ring-2 focus:ring-blue-200" /> : <p className="mt-6 text-[13px] leading-7 text-slate-600">{summary}</p>}
            <div className="mt-8 grid grid-cols-3 gap-3"><div className="rounded-xl bg-blue-50 p-4 text-center"><strong className="block text-xl text-blue-700">$375K</strong><span className="text-[9px] text-slate-500">Revenue</span></div><div className="rounded-xl bg-violet-50 p-4 text-center"><strong className="block text-xl text-violet-700">18.6%</strong><span className="text-[9px] text-slate-500">Growth</span></div><div className="rounded-xl bg-emerald-50 p-4 text-center"><strong className="block text-xl text-emerald-700">92%</strong><span className="text-[9px] text-slate-500">Retention</span></div></div>
            <div className="mt-9"><div className="flex items-center justify-between"><h4 className="font-bold">Monthly Revenue Trend</h4><span className="text-[10px] text-emerald-600">+18.6%</span></div><div className="mt-5 flex h-44 items-end gap-4 border-b border-l border-slate-200 px-4">{chartBars.map((height, index) => <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-12 rounded-t-md bg-[linear-gradient(180deg,#3b82f6,#7c3aed)]" style={{ height: `${height}%` }} /><span className="text-[9px] text-slate-400">{["Jan","Feb","Mar","Apr","May","Jun"][index]}</span></div>)}</div></div>
            <div className="mt-10 rounded-xl border border-blue-100 bg-slate-50 p-5"><h4 className="font-bold">Recommendation</h4><p className="mt-2 text-[12px] leading-6 text-slate-600">Increase investment in the document workflow while monitoring model cost per active workspace. Run a retention-focused experiment for new Data Lab users in July.</p></div>
          </article>
        </div>

        <div className="space-y-4 xl:sticky xl:top-5"><NeonSurface className="p-4"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-300" /><h2 className="text-[12px] font-bold text-white">AI Review</h2></div><div className="mt-4 space-y-3">{["All required sections included", "3 data sources cited", "No unsupported claims detected", "Tone matches executive audience"].map((item) => <div key={item} className="flex gap-2 text-[10px] leading-4 text-slate-400"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{item}</div>)}</div></NeonSurface><NeonSurface className="p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-300" /><h2 className="text-[12px] font-bold text-white">Report Quality</h2></div><div className="mt-4 text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(#22d3ee_0_94%,#172554_94%)]"><div className="grid h-19 w-19 place-items-center rounded-full bg-[#07152f]"><strong className="text-xl text-white">94</strong></div></div><p className="mt-3 text-[10px] text-emerald-300">Excellent quality</p></div></NeonSurface><button onClick={() => exportFile("PDF")} className={`${primaryButton} w-full`}><Download className="h-4 w-4" /> Download Report</button></div>
      </div>
    </WorkspacePage>
  );
}
