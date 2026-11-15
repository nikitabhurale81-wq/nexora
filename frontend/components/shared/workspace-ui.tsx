import type { LucideIcon } from "lucide-react";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspacePage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] space-y-5 p-4 sm:p-5 lg:p-6", className)}>
      {children}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
            <Sparkles className="h-3 w-3" /> {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">{title}</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function NeonSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#1c397c]/70 bg-[linear-gradient(145deg,rgba(7,20,52,0.97),rgba(4,13,37,0.97))] shadow-[0_16px_36px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SurfaceHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#18316b]/55 px-4 py-3.5 sm:px-5">
      <div>
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "blue" | "cyan" | "violet" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    blue: "border-blue-400/25 bg-blue-500/15 text-blue-300",
    cyan: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300",
    violet: "border-violet-400/25 bg-violet-500/15 text-violet-300",
    emerald: "border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
    amber: "border-amber-400/25 bg-amber-500/15 text-amber-300",
    rose: "border-rose-400/25 bg-rose-500/15 text-rose-300",
  };
  return (
    <NeonSurface className="flex min-h-[96px] items-center gap-3 p-4">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="truncate text-xl font-extrabold text-white">{value}</p>
        {detail && <p className="text-[10px] text-emerald-400">{detail}</p>}
      </div>
    </NeonSurface>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#1c3979]/70 bg-[#07152f] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/10"
      />
    </label>
  );
}

export function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "violet" | "slate";
}) {
  const tones = {
    blue: "bg-blue-500/15 text-blue-300 border-blue-400/20",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    red: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    violet: "bg-violet-500/15 text-violet-300 border-violet-400/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-400/15",
  };
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", tones[tone])}>{children}</span>;
}

export const primaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#2563eb,#7c3aed)] px-4 text-[12px] font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#26468b]/70 bg-[#091936] px-4 text-[12px] font-semibold text-slate-200 transition-colors hover:border-cyan-400/45 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50";

export const iconButton =
  "grid h-9 w-9 place-items-center rounded-xl border border-[#223f80]/70 bg-[#081732] text-slate-400 transition-colors hover:border-cyan-400/45 hover:text-cyan-300";
