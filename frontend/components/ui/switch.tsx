"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50",
        checked
          ? "border-cyan-300/40 bg-[linear-gradient(90deg,#06b6d4,#2563eb)] shadow-[0_0_12px_rgba(34,211,238,.2)]"
          : "border-slate-600 bg-slate-800"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[21px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
