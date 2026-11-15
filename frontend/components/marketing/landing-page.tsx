import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Braces,
  Check,
  FileSearch,
  MessageSquareText,
  Mic2,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { ProductPreview } from "./product-preview";
import { GlowCard, SectionHeading } from "./section-heading";

const capabilities = [
  { icon: MessageSquareText, title: "AI Chat", text: "Move from first thought to finished work with an assistant that keeps up.", color: "cyan" },
  { icon: FileSearch, title: "Document intelligence", text: "Summarize, compare, and question every file in your private library.", color: "blue" },
  { icon: BarChart3, title: "Data Lab", text: "Turn raw spreadsheets into charts, insights, and ready-to-share reports.", color: "violet" },
  { icon: Braces, title: "Code Studio", text: "Plan, write, explain, and improve code in a focused technical workspace.", color: "cyan" },
  { icon: Mic2, title: "Voice Room", text: "Think out loud, capture the transcript, and leave with organized next steps.", color: "violet" },
  { icon: ShieldCheck, title: "Private memory", text: "Give NEXORA useful context while staying in control of what it remembers.", color: "blue" },
];

const iconColors: Record<string, string> = {
  cyan: "border-cyan-300/25 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
  blue: "border-blue-300/25 bg-blue-500/10 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.12)]",
  violet: "border-violet-300/25 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.12)]",
};

export function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[760px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="pointer-events-none absolute -right-36 top-48 h-80 w-80 rounded-full border border-violet-400/15 bg-violet-600/10 blur-2xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3.5 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
            <Sparkles className="h-3.5 w-3.5" /> Your ideas, amplified by intelligence
          </div>
          <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-7xl lg:text-[86px]">
            Think deeper. Create <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">smarter.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-xl sm:leading-8">
            NEXORA brings chat, documents, data, code, and voice into one focused AI workspace built for meaningful work.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-6 text-sm font-black text-white shadow-[0_0_30px_rgba(37,99,235,0.36)] hover:brightness-110 sm:w-auto">
              Start creating free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/guest" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.035] px-6 text-sm font-bold text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-300/5 sm:w-auto">
              <Play className="h-4 w-4 fill-current text-cyan-300" /> Try guest mode
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {["No credit card", "10 free conversations", "Set up in seconds"].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />{item}</span>)}
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-blue-400/10 bg-blue-950/10 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-7 text-center sm:grid-cols-4">
          {[["10M+", "ideas explored"], ["99.99%", "platform uptime"], ["50+", "AI tools"], ["120+", "countries creating"]].map(([value, label]) => (
            <div key={label}><p className="text-2xl font-black text-white sm:text-3xl">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="One connected workspace" title={<>Every tool your ideas <span className="text-cyan-300">need to move</span></>} description="Stop switching between disconnected AI tools. NEXORA keeps your thinking, source material, and outputs together." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text, color }) => (
              <GlowCard key={title} className="group p-6 transition-transform hover:-translate-y-1 hover:border-cyan-300/25 sm:p-7">
                <div className={`grid h-11 w-11 place-items-center rounded-xl border ${iconColors[color]}`}><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                <Link href="/features" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 opacity-80 group-hover:opacity-100">Explore feature <ArrowRight className="h-3.5 w-3.5" /></Link>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[linear-gradient(120deg,rgba(10,32,78,0.96),rgba(35,15,80,0.9))] px-6 py-14 text-center shadow-[0_0_65px_rgba(76,29,149,0.16)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-[90px]" /><div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
          <Zap className="relative mx-auto h-8 w-8 text-cyan-300" />
          <h2 className="relative mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Make your next idea the one that ships.</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-slate-400">Open a focused workspace, bring your context, and let NEXORA help you get to the work that matters.</p>
          <Link href="/signup" className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#07142f] hover:bg-cyan-50">Create your free workspace <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
