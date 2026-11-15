"use client";

import { useState } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Highlighter,
  Maximize2,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { NeonSurface, PageIntro, Pill, WorkspacePage, iconButton, primaryButton } from "@/components/shared/workspace-ui";

type Message = { id: number; role: "user" | "assistant"; text: string; citation?: string };

const suggestions = ["Summarize the document", "What are the key risks?", "List the recommended actions", "Explain the revenue forecast"];

export function DocumentChat() {
  const [page, setPage] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", text: "I’ve indexed Nexora_Proposal.pdf. Ask about its strategy, market analysis, budget, or timeline.", citation: "Pages 1–18" },
    { id: 2, role: "user", text: "Give me the executive summary." },
    { id: 3, role: "assistant", text: "The proposal recommends a phased launch focused on document intelligence and team workflows. It targets a 16-week MVP, controlled model costs, and a pilot with 150 early users before expansion.", citation: "Page 3 · Executive Summary" },
  ]);

  function send(value = prompt) {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: "Based on the document, the strongest evidence appears in the implementation roadmap and validation metrics. This mock answer will be replaced with retrieved passages from the backend.", citation: "Pages 8–10" }]);
    setPrompt("");
  }

  return (
    <WorkspacePage className="flex min-h-full flex-col">
      <PageIntro eyebrow="Cited document answers" title="PDF / DOCX Chat" description="Read the source and ask questions side by side, with page-level references." actions={<button onClick={() => toast.success("Summary refreshed from mock document")} className={primaryButton}><Sparkles className="h-4 w-4" /> Refresh Summary</button>} />

      <div className="grid min-h-[650px] flex-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)]">
        <NeonSurface className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18316b]/60 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><FileText className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-[12px] font-bold text-white">Nexora_Proposal.pdf</p><p className="text-[9px] text-slate-500">2.4 MB · 18 pages · Indexed</p></div></div>
            <div className="flex gap-1"><button onClick={() => toast("Document search opened")} className={iconButton} aria-label="Search document"><Search className="h-4 w-4" /></button><button onClick={() => toast("Highlight mode enabled")} className={iconButton} aria-label="Highlight text"><Highlighter className="h-4 w-4" /></button><button onClick={() => toast("Preview expanded")} className={iconButton} aria-label="Expand preview"><Maximize2 className="h-4 w-4" /></button></div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#050b18] p-4 sm:p-6">
            <article className="mx-auto min-h-[720px] max-w-[620px] rounded-md bg-white px-8 py-10 text-slate-800 shadow-2xl sm:px-12">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">NEXORA AI</p><h2 className="mt-1 text-xl font-bold">Product Strategy Proposal</h2></div><span className="text-xs text-slate-400">03</span></div>
              <h3 className="mt-8 text-lg font-bold">Executive Summary</h3>
              <p className="mt-3 text-[13px] leading-7 text-slate-600">NEXORA brings conversational AI, document intelligence, structured data analysis, code assistance, and personal memory into one focused productivity environment.</p>
              <div className="my-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-[12px] leading-6 text-blue-900">The recommended launch uses a phased rollout: validate the core workspace, test with early users, and expand capabilities after measuring repeated weekly use.</div>
              <h3 className="text-base font-bold">Primary objectives</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[12px] leading-6 text-slate-600"><li>Reduce context switching between specialized AI tools.</li><li>Make uploaded knowledge searchable and citable.</li><li>Give teams transparent usage and cost controls.</li><li>Preserve user control over personalized AI memory.</li></ul>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-slate-100 p-3"><strong className="block text-lg text-blue-600">16</strong><span className="text-[9px] text-slate-500">Weeks to MVP</span></div><div className="rounded-lg bg-slate-100 p-3"><strong className="block text-lg text-blue-600">150</strong><span className="text-[9px] text-slate-500">Pilot users</span></div><div className="rounded-lg bg-slate-100 p-3"><strong className="block text-lg text-blue-600">8</strong><span className="text-[9px] text-slate-500">Core workflows</span></div></div>
            </article>
          </div>

          <div className="flex items-center justify-between border-t border-[#18316b]/60 px-4 py-3"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className={iconButton} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="text-[11px] text-slate-400">Page <strong className="text-white">{page}</strong> of 18</span><button onClick={() => setPage((current) => Math.min(18, current + 1))} disabled={page === 18} className={iconButton} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div>
        </NeonSurface>

        <NeonSurface className="flex min-h-[620px] flex-col overflow-hidden">
          <div className="border-b border-[#18316b]/60 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-cyan-300" /><h2 className="text-[14px] font-bold text-white">Ask this document</h2></div><Pill tone="green">Sources on</Pill></div><div className="mt-3 rounded-xl border border-violet-400/20 bg-violet-500/8 p-3"><p className="text-[10px] font-bold text-violet-300">AI Summary</p><p className="mt-1 text-[11px] leading-5 text-slate-400">A phased AI workspace proposal with a 16-week MVP and measurable pilot rollout.</p></div></div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${message.role === "assistant" ? "bg-cyan-500/15 text-cyan-300" : "bg-violet-500/15 text-violet-300"}`}>{message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <span className="text-[9px] font-bold">AJ</span>}</span><div className="max-w-[84%]"><div className={`rounded-xl border px-3 py-2.5 text-[11px] leading-5 ${message.role === "assistant" ? "border-[#1d3b7b]/60 bg-[#071630] text-slate-300" : "border-violet-400/25 bg-violet-500/12 text-white"}`}>{message.text}</div>{message.citation && <button onClick={() => { const match = message.citation?.match(/\d+/); if (match) setPage(Number(match[0])); toast("Opened cited page"); }} className="mt-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[9px] text-blue-300 hover:bg-blue-500/20">{message.citation}</button>}<button onClick={() => { navigator.clipboard.writeText(message.text); toast.success("Copied"); }} className="ml-1 mt-1.5 p-1 text-slate-600 hover:text-cyan-300" aria-label="Copy answer"><Copy className="h-3 w-3" /></button></div></div>)}
          </div>

          <div className="border-t border-[#18316b]/60 p-3"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} className="shrink-0 rounded-full border border-[#244587]/60 bg-[#081733] px-3 py-1.5 text-[9px] text-slate-400 hover:text-cyan-300">{suggestion}</button>)}</div><div className="relative"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} placeholder="Ask about this document..." className="w-full resize-none rounded-xl border border-[#244587]/70 bg-[#07152f] py-3 pl-3 pr-11 text-[11px] text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50" /><button onClick={() => send()} className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#2563eb,#06b6d4)] text-white" aria-label="Send question"><Send className="h-4 w-4" /></button></div></div>
        </NeonSurface>
      </div>
    </WorkspacePage>
  );
}
