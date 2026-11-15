import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="NEXORA home"
      className="group inline-flex items-center gap-2.5 text-white"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-300/35 bg-[linear-gradient(145deg,#1166ff,#6d28d9)] shadow-[0_0_22px_rgba(34,211,238,0.3)]">
        <span className="absolute inset-[1px] rounded-[10px] bg-[#061438]/70" />
        <span className="relative text-base font-black italic tracking-[-0.15em] text-white">N</span>
        <Sparkles className="absolute right-0.5 top-0.5 h-2.5 w-2.5 text-cyan-200" />
      </span>
      {!compact && (
        <span className="text-[15px] font-black tracking-[0.18em]">NEXORA</span>
      )}
    </Link>
  );
}
