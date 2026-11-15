"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, BarChart3, Bot, Braces, Check, FileStack, Fingerprint,
  Layers3, MemoryStick, MessageSquareText, Mic2, ShieldCheck, Sparkles,
} from "lucide-react";
import { GlowCard, PageHero, SectionHeading } from "./section-heading";

const featureTabs = [
  { id: "chat", label: "AI Chat", icon: MessageSquareText, title: "A thinking partner that understands the work", description: "Ask follow-up questions, build on earlier decisions, and shape a rough idea into something useful without restating your context.", prompts: ["Turn these notes into a project brief", "Challenge the assumptions in my plan", "Give me three sharper alternatives"] },
  { id: "docs", label: "Documents", icon: FileStack, title: "Answers grounded in your own material", description: "Bring PDFs, DOCX files, notes, and spreadsheets into a searchable library. NEXORA cites the source behind every answer.", prompts: ["Compare the two proposals", "Summarize the risks on page 14", "Extract every next action"] },
  { id: "data", label: "Data Lab", icon: BarChart3, title: "Clear answers from messy data", description: "Explore patterns, create visualizations, and generate reports from your files without losing the logic behind the analysis.", prompts: ["Show revenue by segment", "Find unexpected changes", "Build an executive summary"] },
  { id: "code", label: "Code Studio", icon: Braces, title: "A focused space to build and debug", description: "Get implementation help, explanations, and thoughtful reviews with your code and technical intent side by side.", prompts: ["Explain this architecture", "Find the edge case", "Draft tests for this module"] },
];

const platformFeatures = [
  [Mic2, "Voice Room", "Capture a natural conversation, live transcript, concise summary, and next actions."],
  [MemoryStick, "Controllable memory", "Keep useful preferences and project details. Review or remove them whenever you want."],
  [Layers3, "Connected context", "Move between chat, documents, data, and code without breaking your train of thought."],
  [ShieldCheck, "Private by design", "Encryption in transit and at rest, clear access controls, and no hidden data sharing."],
  [Fingerprint, "Made personal", "Adapt the workspace to your role, preferred style, and recurring workflows."],
  [Bot, "Purpose-built agents", "Create repeatable assistants for research, reporting, analysis, and internal knowledge."],
];

export function FeaturesPage() {
  const [active, setActive] = useState(featureTabs[0]);

  return (
    <>
      <PageHero eyebrow="Product capabilities" title="One workspace." accent="More momentum." description="NEXORA connects the tools you use to think, understand, build, and communicate, with one intelligent layer across all of them.">
        <div className="mt-8 flex justify-center gap-3"><Link href="/signup" className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-[0_0_25px_rgba(37,99,235,.3)]">Explore NEXORA free</Link><Link href="/contact" className="rounded-xl border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/5">Talk to us</Link></div>
      </PageHero>

      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureTabs.map((feature) => {
              const Icon = feature.icon;
              const selected = active.id === feature.id;
              return <button key={feature.id} type="button" onClick={() => setActive(feature)} className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold ${selected ? "border-cyan-300/40 bg-cyan-400/10 text-white shadow-[0_0_20px_rgba(34,211,238,.1)]" : "border-blue-400/15 bg-blue-950/20 text-slate-500 hover:text-slate-200"}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white" : "bg-white/5"}`}><Icon className="h-4 w-4" /></span>{feature.label}</button>;
            })}
          </div>
          <GlowCard className="mt-4 overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{active.label}</p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">{active.title}</h2>
                <p className="mt-5 leading-7 text-slate-400">{active.description}</p>
                <div className="mt-7 space-y-3">{active.prompts.map(prompt => <div key={prompt} className="flex items-center gap-3 text-sm text-slate-300"><Check className="h-4 w-4 text-emerald-400" />{prompt}</div>)}</div>
              </div>
              <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-blue-400/20 bg-[#030b23] p-5 shadow-[inset_0_0_40px_rgba(37,99,235,.06)]">
                <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="flex items-center gap-2 text-xs font-bold text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600"><Sparkles className="h-3.5 w-3.5" /></span>{active.label} workspace</span><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">READY</span></div>
                <div className="mt-6 flex justify-end"><span className="max-w-[82%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-xs leading-5 text-white">{active.prompts[0]}</span></div>
                <div className="mt-5 flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-600/60"><Bot className="h-4 w-4" /></span><div className="space-y-3 rounded-2xl rounded-tl-sm border border-violet-300/15 bg-violet-500/8 p-4"><div className="h-2 w-36 rounded bg-slate-600/60" /><div className="h-2 w-full rounded bg-slate-700/50" /><div className="h-2 w-[86%] rounded bg-slate-700/50" /><div className="grid grid-cols-3 gap-2 pt-2"><div className="h-12 rounded-lg bg-cyan-500/10" /><div className="h-12 rounded-lg bg-blue-500/10" /><div className="h-12 rounded-lg bg-violet-500/10" /></div></div></div>
              </div>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="border-y border-blue-400/10 bg-blue-950/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Built around your flow" title="Intelligence across the whole workspace" description="Each part works well alone. Together, they keep the full thread of your work connected." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{platformFeatures.map(([Icon, title, text]) => { const FeatureIcon = Icon as typeof Mic2; return <GlowCard key={String(title)} className="p-6"><FeatureIcon className="h-6 w-6 text-cyan-300" /><h3 className="mt-5 text-lg font-black text-white">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{String(text)}</p></GlowCard>; })}</div>
        </div>
      </section>

      <section className="px-5 py-24 text-center sm:px-8 lg:px-10"><h2 className="text-3xl font-black text-white sm:text-5xl">Ready to put it all in one place?</h2><p className="mx-auto mt-4 max-w-xl text-slate-400">Start with an idea. NEXORA will help you turn it into something finished.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#07142f]">Start creating <ArrowRight className="h-4 w-4" /></Link></section>
    </>
  );
}
