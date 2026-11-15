"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const CHART_COLORS = {
  cyan: "#22d3ee",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  pink: "#ec4899",
  emerald: "#34d399",
  amber: "#fbbf24",
  grid: "rgba(71, 85, 105, 0.25)",
  text: "#94a3b8",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-blue-500/15 bg-[#071127]/80 shadow-[0_16px_50px_rgba(0,0,0,0.18)]",
        glow && "shadow-[0_0_35px_rgba(37,99,235,0.12)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-blue-500/10 px-4 py-4 sm:px-5">
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  tone = "cyan",
  detail,
}: {
  label: string;
  value: string;
  change?: string;
  icon: ReactNode;
  tone?: "cyan" | "violet" | "emerald" | "amber" | "pink";
  detail?: string;
}) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-cyan-500/10",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-violet-500/10",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-emerald-500/10",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-amber-500/10",
    pink: "border-pink-400/20 bg-pink-400/10 text-pink-300 shadow-pink-500/10",
  };

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</p>
          {(change || detail) && (
            <p className="mt-1.5 text-xs text-slate-500">
              {change && <span className="mr-1 font-semibold text-emerald-400">{change}</span>}
              {detail}
            </p>
          )}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-[0_0_24px]", tones[tone])}>
          {icon}
        </div>
      </div>
    </Panel>
  );
}

export function ActionButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const variants = {
    primary:
      "border-cyan-300/30 bg-[linear-gradient(110deg,#0284c7,#2563eb_56%,#7c3aed)] text-white shadow-[0_0_22px_rgba(37,99,235,0.24)] hover:brightness-110",
    secondary: "border-blue-400/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20",
    ghost: "border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-cyan-400/30 hover:text-white",
    danger: "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="inline-flex rounded-xl border border-blue-500/15 bg-[#03091d]/70 p-1" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
            value === option
              ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.3)]"
              : "text-slate-500 hover:text-slate-200"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-blue-500/15 bg-[#03091d]/70 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
      />
    </label>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "violet" | "neutral";
}) {
  const tones = {
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    info: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    neutral: "border-slate-600/30 bg-slate-700/20 text-slate-400",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold", tones[tone])}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button
        type="button"
        className="absolute inset-0 bg-[#01040e]/85 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={cn(
          "relative max-h-[88dvh] w-full overflow-y-auto rounded-2xl border border-cyan-400/20 bg-[#071127] shadow-[0_0_70px_rgba(37,99,235,0.22)]",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-xl",
          size === "lg" && "max-w-3xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-500/15 px-5 py-4">
          <div>
            <h2 id="admin-modal-title" className="font-bold text-white">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-700/60 text-slate-400 hover:border-cyan-400/30 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-blue-500/15 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-xl border border-blue-500/15 bg-[#03091d]/80 px-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const tooltipStyle = {
  background: "#071127",
  border: "1px solid rgba(34, 211, 238, 0.2)",
  borderRadius: "12px",
  color: "#e2e8f0",
  boxShadow: "0 12px 35px rgba(0,0,0,.35)",
  fontSize: "12px",
};
