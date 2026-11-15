import Link from "next/link";
import { ArrowRight, BrainCircuit, Compass, HeartHandshake, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import { GlowCard, PageHero, SectionHeading } from "./section-heading";

const values = [
  [Compass, "Clarity over spectacle", "Useful intelligence should make the next step clearer. We prioritize understandable answers, visible sources, and thoughtful defaults."],
  [Users, "People stay in charge", "NEXORA helps people make and communicate decisions. It does not hide judgment behind automation."],
  [ShieldCheck, "Trust is a product feature", "Privacy, control, and transparent behavior belong in the experience from the first sketch, not in a later policy."],
  [Lightbulb, "Curiosity compounds", "The best work starts with a better question. We build for exploration, healthy challenge, and ideas that improve through iteration."],
];

export function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About NEXORA" title="AI should expand" accent="human potential." description="We are building a calmer, more connected way to work with intelligence, so people can spend less energy managing tools and more energy making progress." />

      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Why we started</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">Good ideas were getting lost between too many tools.</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-400">
              <p>AI made individual tasks faster, but the work around those tasks stayed fragmented. Context lived in one app, source material in another, and the decisions that mattered disappeared into chat history.</p>
              <p>NEXORA began with a simple premise: intelligence becomes more useful when it understands the full shape of the work. We brought conversation, documents, data, code, and voice into one coherent workspace.</p>
              <p>Our goal is not to produce more noise. It is to help every person reach a clearer thought, a stronger decision, and work they are proud to share.</p>
            </div>
          </div>
          <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-blue-400/20 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,.3),transparent_34%),linear-gradient(145deg,#061536,#12092e)] shadow-[0_0_60px_rgba(37,99,235,.13)]">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" /><div className="absolute left-1/2 top-1/2 h-44 w-80 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[50%] border border-violet-300/25" /><div className="absolute left-1/2 top-1/2 h-44 w-80 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-[50%] border border-blue-300/25" />
            <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28px] border border-cyan-200/40 bg-gradient-to-br from-blue-500 via-cyan-400 to-violet-600 shadow-[0_0_55px_rgba(34,211,238,.5)]"><span className="grid h-[118px] w-[118px] place-items-center rounded-[24px] bg-[#071332]/75 text-6xl font-black italic text-white">N</span></div>
            {["top-[14%] left-[18%]", "right-[16%] top-[22%]", "bottom-[18%] left-[21%]", "bottom-[14%] right-[20%]"].map((position, index) => <span key={position} className={`absolute ${position} h-2.5 w-2.5 rounded-full ${index % 2 ? "bg-violet-300" : "bg-cyan-300"} shadow-[0_0_14px_currentColor]`} />)}
            <p className="absolute inset-x-0 bottom-8 text-center text-xs font-bold uppercase tracking-[.25em] text-slate-500">Think deeper · Create smarter</p>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-400/10 bg-blue-950/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="What guides us" title="Principles for useful intelligence" description="We use these ideas to make product decisions, resolve trade-offs, and hold ourselves accountable." /><div className="mt-14 grid gap-4 md:grid-cols-2">{values.map(([Icon, title, text]) => { const ValueIcon = Icon as typeof Compass; return <GlowCard key={String(title)} className="p-7 sm:p-8"><ValueIcon className="h-7 w-7 text-cyan-300" /><h3 className="mt-5 text-xl font-black text-white">{String(title)}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{String(text)}</p></GlowCard>; })}</div></div></section>

      <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><Sparkles className="h-7 w-7 text-violet-300" /><h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">Small team.<br />Wide perspective.</h2><p className="mt-5 leading-7 text-slate-400">We are designers, engineers, researchers, and operators united by the belief that powerful tools can still feel calm and human.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-cyan-300">Meet us through a conversation <ArrowRight className="h-4 w-4" /></Link></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{[[BrainCircuit,"AI research"],[HeartHandshake,"Customer success"],[Sparkles,"Product design"],[ShieldCheck,"Trust & safety"],[Users,"Community"],[Lightbulb,"Engineering"]].map(([Icon,label]) => { const TeamIcon = Icon as typeof BrainCircuit; return <div key={String(label)} className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.025] text-center"><TeamIcon className="h-6 w-6 text-violet-300" /><p className="mt-3 text-xs font-bold text-slate-300">{String(label)}</p></div>; })}</div></div></div></section>

      <section className="px-5 pb-24 text-center sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-blue-950/80 to-violet-950/70 p-8 sm:p-14"><h2 className="text-3xl font-black text-white sm:text-4xl">Help shape a better way to work.</h2><p className="mx-auto mt-4 max-w-xl text-slate-400">Join people around the world who are turning scattered inputs into clear, meaningful output.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#07142f]">Build with NEXORA <ArrowRight className="h-4 w-4" /></Link></div></section>
    </>
  );
}
