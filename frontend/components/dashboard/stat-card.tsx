import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { StatCard as StatCardType } from "@/lib/mock/dashboard";
import { TrendingUp } from "lucide-react";

const accents: Record<string, { card: string; icon: string }> = {
  primary: {
    card: "border-blue-500/35 bg-[linear-gradient(145deg,rgba(8,31,76,0.98),rgba(8,20,52,0.98))]",
    icon: "border-blue-400/25 bg-blue-500/20 text-blue-300 shadow-[0_0_18px_rgba(37,99,235,0.22)]",
  },
  secondary: {
    card: "border-orange-400/30 bg-[linear-gradient(145deg,rgba(45,29,47,0.98),rgba(9,20,52,0.98))]",
    icon: "border-orange-400/25 bg-orange-400/20 text-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.2)]",
  },
  accent: {
    card: "border-emerald-400/30 bg-[linear-gradient(145deg,rgba(4,50,56,0.98),rgba(8,21,52,0.98))]",
    icon: "border-emerald-400/25 bg-emerald-400/20 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.2)]",
  },
  success: {
    card: "border-violet-500/35 bg-[linear-gradient(145deg,rgba(40,22,88,0.98),rgba(9,20,52,0.98))]",
    icon: "border-violet-400/25 bg-violet-500/20 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.22)]",
  },
};

export function StatCard({ stat }: { stat: StatCardType }) {
  const accent = accents[stat.accent];

  return (
    <article
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5",
        accent.card
      )}
    >
      <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-500/8 blur-xl" />
      <div className="relative flex items-center gap-3">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border", accent.icon)}>
          <Icon name={stat.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-400">{stat.label}</p>
          <p className="mt-0.5 text-[24px] font-extrabold leading-none tracking-tight text-white">
            {stat.value}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {stat.change}
          </p>
        </div>
      </div>
    </article>
  );
}
