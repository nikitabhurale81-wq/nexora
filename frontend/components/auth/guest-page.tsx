"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { Bot, FileText, Lock, Menu, Paperclip, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/marketing/brand";

type Message = { role: "assistant" | "user"; content: string };

const starters = ["Plan a focused workday", "Explain a complex idea simply", "Turn notes into an outline"];
const replies = [
  "Here’s a clear way to begin: define the outcome in one sentence, list the information you already have, then choose the smallest useful next step. I can help you shape any of those pieces.",
  "I’d structure this in three layers: the core idea, one concrete example, and the practical implication. That keeps the explanation accurate without making it feel heavy.",
  "Start by grouping the notes around themes rather than chronology. Give each theme a one-line claim, place the strongest evidence underneath, and finish with the decision or next action.",
];

export function GuestPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Welcome to NEXORA Guest. Ask a question or choose a starting point below. You have three conversations to explore the workspace." }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mobileInfo, setMobileInfo] = useState(false);
  const used = messages.filter(message => message.role === "user").length;
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt) { toast.error("Write a question first."); inputRef.current?.focus(); return; }
    if (used >= 3) { toast.info("Guest limit reached. Create a free account to keep going."); return; }
    setMessages(current => [...current, { role: "user", content: prompt }]);
    setInput("");
    setThinking(true);
    await new Promise(resolve => setTimeout(resolve, 650));
    setMessages(current => [...current, { role: "assistant", content: replies[used] }]);
    setThinking(false);
  };

  const chooseStarter = (starter: string) => { setInput(starter); inputRef.current?.focus(); };
  const reset = () => { setMessages([{ role: "assistant", content: "Fresh canvas ready. What would you like to think through?" }]); setInput(""); toast.success("Guest conversation cleared."); };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(37,99,235,.18),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(109,40,217,.15),transparent_30%)]" />
      <header className="relative z-20 flex h-[68px] items-center justify-between border-b border-blue-400/15 bg-[#040a1c]/90 px-4 backdrop-blur-xl sm:px-6">
        <Brand />
        <div className="flex items-center gap-2 sm:gap-3"><span className="hidden items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/5 px-3 py-1.5 text-[10px] font-bold text-amber-200 sm:inline-flex"><Lock className="h-3 w-3" />Guest session · {3-used} prompts left</span><button type="button" onClick={() => setMobileInfo(value => !value)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 md:hidden" aria-label="Toggle guest information">{mobileInfo ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button><Link href="/login" className="hidden rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:text-white sm:block">Sign in</Link><Link href="/signup" className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3.5 py-2 text-xs font-black text-white shadow-[0_0_18px_rgba(37,99,235,.25)]">Create free account</Link></div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 md:grid-cols-[230px_1fr] lg:grid-cols-[250px_1fr_270px]">
        <aside className={`${mobileInfo ? "absolute inset-x-0 top-0 z-30 flex" : "hidden"} h-full flex-col border-r border-blue-400/10 bg-[#040a1b]/98 p-4 md:static md:flex`}>
          <button type="button" onClick={reset} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-500/10 text-xs font-black text-blue-200 hover:bg-blue-500/15"><RotateCcw className="h-3.5 w-3.5" />New conversation</button>
          <div className="mt-6"><p className="px-2 text-[9px] font-black uppercase tracking-[.2em] text-slate-700">Try asking</p><div className="mt-3 space-y-1.5">{starters.map(starter => <button key={starter} type="button" onClick={() => { chooseStarter(starter); setMobileInfo(false); }} className="w-full rounded-lg px-2.5 py-2.5 text-left text-[11px] leading-4 text-slate-500 hover:bg-white/5 hover:text-cyan-200">{starter}</button>)}</div></div>
          <div className="mt-auto rounded-xl border border-violet-400/15 bg-violet-500/[.055] p-4"><Sparkles className="h-4 w-4 text-violet-300" /><p className="mt-3 text-xs font-black text-white">Keep your work</p><p className="mt-1 text-[10px] leading-4 text-slate-600">Guest chats disappear when this session ends.</p><Link href="/signup" className="mt-3 block text-[10px] font-black text-violet-300">Create an account →</Link></div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-blue-400/10 px-4 sm:px-6"><div><h1 className="text-sm font-black text-white">Guest AI Chat</h1><p className="text-[9px] text-emerald-400">● Ready to explore</p></div><span className="text-[10px] text-slate-700">No chat history saved</span></div>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message, index) => message.role === "assistant" ? (
                <div key={index} className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_18px_rgba(34,211,238,.2)]"><Bot className="h-4 w-4" /></span><div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-blue-400/15 bg-blue-500/[.07] px-4 py-3 text-sm leading-6 text-slate-300">{message.content}</div></div>
              ) : (
                <div key={index} className="flex justify-end"><div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm leading-6 text-white shadow-[0_0_18px_rgba(37,99,235,.12)]">{message.content}</div></div>
              ))}
              {thinking && <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/20"><Bot className="h-4 w-4 text-cyan-300" /></span><span className="flex gap-1 rounded-xl border border-white/5 bg-white/[.03] px-4 py-3">{[0,1,2].map(i => <i key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" style={{animationDelay:`${i*120}ms`}} />)}</span></div>}
              {messages.length === 1 && <div className="grid gap-2 pt-3 sm:grid-cols-3">{starters.map(starter => <button key={starter} type="button" onClick={() => chooseStarter(starter)} className="rounded-xl border border-white/10 bg-white/[.025] p-3 text-left text-[11px] leading-4 text-slate-400 hover:border-cyan-300/25 hover:text-cyan-200">{starter}</button>)}</div>}
            </div>
          </div>
          <div className="border-t border-blue-400/10 bg-[#03091c]/90 p-3 sm:p-5"><form onSubmit={submit} className="mx-auto max-w-3xl"><div className="flex items-center gap-2 rounded-2xl border border-blue-400/25 bg-[#06122e] p-2 shadow-[0_0_28px_rgba(37,99,235,.1)] focus-within:border-cyan-300/40"><button type="button" onClick={() => toast.info("File uploads are available with a free account.")} aria-label="Attach a file" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-white/5 hover:text-cyan-300"><Paperclip className="h-4 w-4" /></button><input ref={inputRef} value={input} onChange={event => setInput(event.target.value)} disabled={thinking || used >= 3} maxLength={500} placeholder={used >= 3 ? "Guest limit reached — create a free account" : "Ask NEXORA anything..."} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700 disabled:cursor-not-allowed" /><button type="submit" disabled={thinking || used >= 3} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_18px_rgba(34,211,238,.22)] disabled:opacity-30"><Send className="h-4 w-4" /></button></div><p className="mt-2 text-center text-[9px] text-slate-700">NEXORA can make mistakes. Check important information.</p></form></div>
        </section>

        <aside className="hidden border-l border-blue-400/10 bg-[#040a1b]/70 p-5 lg:block"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-700">Guest mode</p><div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[.035] p-4"><p className="text-xs font-black text-white">A quick, private preview</p><p className="mt-2 text-[10px] leading-5 text-slate-600">Explore core chat without creating an account. Your messages stay in this browser session.</p></div><p className="mt-7 text-[9px] font-black uppercase tracking-[.2em] text-slate-700">Free workspace adds</p><div className="mt-3 space-y-3">{["Saved conversation history", "Document uploads", "Personal AI memory", "Data and code tools"].map(item => <div key={item} className="flex items-center gap-2 text-[10px] text-slate-500"><FileText className="h-3.5 w-3.5 text-violet-300" />{item}</div>)}</div><Link href="/signup" className="mt-7 flex h-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/10 text-[11px] font-black text-violet-200">Unlock your workspace</Link></aside>
      </div>
    </main>
  );
}
