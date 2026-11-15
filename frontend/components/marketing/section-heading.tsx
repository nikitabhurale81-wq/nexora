import { Sparkles } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <div className={`mb-4 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
        <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</span>
      </div>
      <h2 className="text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">{description}</p>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-24 sm:px-8 sm:pb-24 sm:pt-28 lg:px-10">
      <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute right-[8%] top-12 h-56 w-56 rounded-full bg-violet-600/15 blur-[100px]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />{eyebrow}
        </div>
        <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
          {title} <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">{accent}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-blue-400/15 bg-[linear-gradient(145deg,rgba(8,25,63,0.88),rgba(5,13,37,0.94))] shadow-[0_18px_50px_rgba(0,0,0,0.22)] ${className}`}>
      {children}
    </div>
  );
}
