"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#01040d]/80 backdrop-blur-sm" onClick={onClose} aria-label="Close dialog" />
      <div className={cn("relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-400/30 bg-[#06122e] shadow-[0_25px_80px_rgba(0,0,0,.55),0_0_40px_rgba(37,99,235,.13)]", className)}>
        <div className="flex items-start justify-between gap-4 border-b border-[#1b3473]/60 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {description && <p className="mt-1 text-[12px] text-slate-400">{description}</p>}
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
