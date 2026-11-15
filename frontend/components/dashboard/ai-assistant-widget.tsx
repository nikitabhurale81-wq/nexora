"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Bot, Sparkles } from "lucide-react";

export function AIAssistantWidget() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;
    router.push(`/chat?prompt=${encodeURIComponent(value)}`);
  }

  return (
    <section className="relative flex h-full min-h-[258px] flex-col overflow-hidden rounded-2xl border border-cyan-400/35 bg-[linear-gradient(145deg,rgba(7,22,57,0.98),rgba(6,17,43,0.98))] p-5 shadow-[0_0_28px_rgba(14,165,233,0.1)]">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 left-6 h-28 w-28 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="relative grid h-[70px] w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-200/40 bg-[linear-gradient(180deg,#22d3ee_0%,#10b981_48%,#fb923c_100%)] shadow-[0_0_22px_rgba(34,211,238,0.22)]">
          <span className="absolute inset-[3px] rounded-[9px] border border-white/25" />
          <Bot className="relative h-6 w-6 text-white" />
          <Sparkles className="absolute right-1 top-1 h-3 w-3 text-white" />
        </div>
        <div className="min-w-0 pt-1">
          <h2 className="text-[17px] font-bold text-white">AI Assistant</h2>
          <p className="mt-3 max-w-[210px] text-[13px] leading-5 text-slate-300">
            How can I help you today?
          </p>
        </div>
      </div>

      <div className="relative mt-auto pt-5">
        <form onSubmit={submit} className="relative">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask anything..."
            aria-label="Ask AI Assistant"
            className="h-11 w-full rounded-xl border border-[#24468e]/65 bg-[#0b2454]/85 pl-4 pr-12 text-[12px] text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
          />
          <button
            type="submit"
            aria-label="Send to AI Chat"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 transition-colors hover:bg-cyan-400/20 hover:text-white"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
