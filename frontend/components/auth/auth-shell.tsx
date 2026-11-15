import Link from "next/link";
import { ArrowLeft, Check, Orbit, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/marketing/brand";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-5 py-7 text-slate-100 sm:px-8 lg:grid lg:place-items-center lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,.22),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(109,40,217,.22),transparent_32%)]" />
      <div className="relative mx-auto w-full max-w-[1120px]">
        <div className="mb-7 flex items-center justify-between">
          <Brand />
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-300"><ArrowLeft className="h-3.5 w-3.5" />Back to home</Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-[#050d27]/95 shadow-[0_0_65px_rgba(37,99,235,.18),0_30px_80px_rgba(0,0,0,.45)]">
          <div className="grid lg:grid-cols-[.92fr_1.08fr]">
            <section className="flex min-h-[650px] items-center p-6 sm:p-10 lg:p-14">
              <div className="mx-auto w-full max-w-md">
                <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{eyebrow}</p>
                <h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                <div className="mt-8">{children}</div>
              </div>
            </section>
            <AuthVisual />
          </div>
        </div>
        <p className="mt-5 text-center text-[11px] text-slate-700">By continuing, you agree to NEXORA&apos;s Terms and acknowledge the Privacy Policy.</p>
      </div>
    </main>
  );
}

function AuthVisual() {
  return (
    <aside className="relative hidden min-h-[650px] overflow-hidden border-l border-blue-400/15 bg-[radial-gradient(circle_at_50%_38%,rgba(37,99,235,.32),transparent_30%),radial-gradient(circle_at_84%_15%,rgba(6,182,212,.18),transparent_28%),linear-gradient(145deg,#061943,#15083d)] p-10 lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(59,130,246,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />AI workspace online</span><ShieldCheck className="h-5 w-5 text-blue-300" /></div>
      <div className="relative mx-auto grid h-72 w-72 place-items-center">
        <div className="absolute inset-8 animate-[spin_18s_linear_infinite] rounded-[50%] border border-cyan-300/25" /><div className="absolute inset-x-0 top-16 h-40 rotate-45 rounded-[50%] border border-violet-300/30" /><div className="absolute inset-x-0 top-16 h-40 -rotate-45 rounded-[50%] border border-blue-300/35" /><span className="absolute left-8 top-20 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#22d3ee]" /><span className="absolute bottom-16 right-12 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_#c4b5fd]" />
        <div className="relative grid h-32 w-32 rotate-45 place-items-center rounded-[30px] border border-cyan-200/40 bg-gradient-to-br from-blue-500 via-cyan-400 to-violet-600 shadow-[0_0_60px_rgba(59,130,246,.65)]"><div className="grid h-[116px] w-[116px] place-items-center rounded-[25px] bg-[#071337]/70"><span className="-rotate-45 text-6xl font-black italic text-white">N</span></div></div>
        <Orbit className="absolute h-72 w-72 text-blue-300/10" strokeWidth={.5} />
      </div>
      <div className="relative">
        <h2 className="text-3xl font-black leading-tight text-white">Think deeper.<br /><span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Create smarter.</span></h2>
        <div className="mt-5 grid grid-cols-2 gap-3">{["Your context, connected", "Private by design"].map(item => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[11px] font-bold text-slate-300"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/10"><Check className="h-3 w-3 text-emerald-300" /></span>{item}</div>)}</div>
        <p className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-slate-600"><Sparkles className="h-3 w-3 text-violet-300" />Join 10 million curious minds</p>
      </div>
    </aside>
  );
}

export const authInputClass = "h-11 w-full rounded-xl border border-blue-400/15 bg-[#040c23] px-3.5 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10";
