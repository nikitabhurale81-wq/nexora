"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, GraduationCap, Lightbulb, Palette, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { GlowCard, PageHero, SectionHeading } from "./section-heading";

const audiences = [
  { id: "teams", label: "Teams", icon: UsersRound, headline: "Shared intelligence, without shared chaos", copy: "Give every project one place for source material, decisions, drafts, and analysis. Your team moves faster because context stays visible.", outcomes: ["Create reusable team assistants", "Keep project knowledge searchable", "Turn meetings into clear action"], stat: "31%", statLabel: "less time spent searching" },
  { id: "founders", label: "Founders", icon: Lightbulb, headline: "Go from open question to confident decision", copy: "Research markets, pressure-test strategy, shape investor updates, and keep the company story coherent as priorities move.", outcomes: ["Synthesize customer evidence", "Draft plans and updates", "Challenge strategic assumptions"], stat: "2.4×", statLabel: "faster research cycles" },
  { id: "creators", label: "Creators", icon: Palette, headline: "Protect your voice while multiplying your output", copy: "Develop ideas, organize research, and transform one strong concept into a complete set of useful content.", outcomes: ["Build from your own references", "Repurpose without sounding generic", "Keep a consistent point of view"], stat: "6 hrs", statLabel: "saved each week" },
  { id: "students", label: "Students", icon: GraduationCap, headline: "Understand more, not just answer faster", copy: "Question course material, connect ideas across sources, and build study systems designed around how you learn.", outcomes: ["Ask questions across readings", "Create active recall material", "Explain difficult ideas clearly"], stat: "47%", statLabel: "faster note review" },
];

const useCases = [
  [BriefcaseBusiness, "Research and strategy", "Collect evidence, compare sources, surface gaps, and arrive at a recommendation you can defend."],
  [Sparkles, "Content and communication", "Move from brief to polished output with your references, audience, and voice kept in view."],
  [ShieldCheck, "Knowledge and operations", "Turn scattered documentation into a reliable, conversational source of internal knowledge."],
];

export function SolutionsPage() {
  const [active, setActive] = useState(audiences[0]);
  const ActiveIcon = active.icon;
  return (
    <>
      <PageHero eyebrow="Solutions for real work" title="Built for how" accent="you think." description="Different work demands different context. NEXORA adapts to the people, material, and outcomes that matter to you.">
        <div className="mt-8"><Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_0_28px_rgba(37,99,235,.3)]">Find your workflow <ArrowRight className="h-4 w-4" /></Link></div>
      </PageHero>

      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto pb-3 sm:justify-center">{audiences.map(item => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setActive(item)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${active.id === item.id ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 bg-white/[.025] text-slate-500 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>
          <GlowCard className="mt-4 overflow-hidden">
            <div className="grid lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-7 sm:p-10 lg:p-14">
                <p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">For {active.label}</p>
                <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">{active.headline}</h2>
                <p className="mt-5 max-w-xl leading-7 text-slate-400">{active.copy}</p>
                <div className="mt-8 space-y-3">{active.outcomes.map(outcome => <div key={outcome} className="flex items-center gap-3 text-sm text-slate-200"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/10"><Check className="h-3.5 w-3.5 text-emerald-400" /></span>{outcome}</div>)}</div>
                <Link href="/contact" className="mt-9 inline-flex items-center gap-2 text-sm font-black text-cyan-300">Discuss your use case <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="relative min-h-[390px] overflow-hidden border-t border-blue-400/10 bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,.22),transparent_48%),linear-gradient(145deg,#061536,#10082f)] p-8 lg:border-l lg:border-t-0">
                <div className="absolute left-[14%] top-[15%] h-48 w-48 rounded-full border border-cyan-300/15" /><div className="absolute left-[22%] top-[23%] h-48 w-48 rounded-full border border-violet-300/15" />
                <div className="relative mx-auto mt-12 max-w-sm rounded-2xl border border-blue-300/20 bg-[#06122f]/90 p-5 shadow-[0_0_45px_rgba(37,99,235,.2)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600"><ActiveIcon className="h-5 w-5 text-white" /></span><div><p className="text-sm font-black text-white">{active.label} workspace</p><p className="text-[10px] text-cyan-300">Context synchronized</p></div></div>
                  <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-blue-500/10 p-3"><p className="text-2xl font-black text-white">{active.stat}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{active.statLabel}</p></div><div className="rounded-xl bg-violet-500/10 p-3"><p className="text-2xl font-black text-white">4.9<span className="text-xs text-violet-300">/5</span></p><p className="mt-1 text-[10px] leading-4 text-slate-500">workspace satisfaction</p></div></div>
                  <div className="mt-3 rounded-xl bg-white/[.03] p-4"><div className="mb-3 flex items-end gap-1.5">{[38,55,44,72,62,90,82,100].map((height, i) => <span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-cyan-300" style={{height: `${height * .65}px`}} />)}</div><p className="text-[9px] uppercase tracking-widest text-slate-600">Momentum · last 8 weeks</p></div>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="border-y border-blue-400/10 bg-[#03091c] px-5 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="High-impact workflows" title="Turn demanding work into a repeatable flow" description="Use NEXORA for one task or connect the full path from source material to finished decision." /><div className="mt-14 grid gap-4 lg:grid-cols-3">{useCases.map(([Icon, title, text], index) => { const UseIcon = Icon as typeof BriefcaseBusiness; return <GlowCard key={String(title)} className="relative overflow-hidden p-7"><span className="absolute right-5 top-4 text-6xl font-black text-white/[.025]">0{index + 1}</span><UseIcon className="h-7 w-7 text-cyan-300" /><h3 className="mt-6 text-xl font-black text-white">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{String(text)}</p></GlowCard>; })}</div></div></section>

      <section className="px-5 py-24 text-center sm:px-8 lg:px-10"><h2 className="text-3xl font-black text-white sm:text-5xl">Your workflow is unique. Your AI should know that.</h2><p className="mx-auto mt-5 max-w-xl text-slate-400">Tell us what you are building and we will show you the clearest path through NEXORA.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#07142f]">Start free</Link><Link href="/contact" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-black text-white">Contact sales</Link></div></section>
    </>
  );
}
