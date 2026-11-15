"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Edit3,
  FileUp,
  Menu,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { NeonSurface, iconButton, primaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";
import {
  ensureGuestToken,
  readError,
  sendChatMessage,
} from "@/lib/api/services";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

const initialMessages: ChatMessage[] = [
  { id: 1, role: "assistant", content: "Hello! I am NEXORA AI. How can I help you today?" },
];

export function ChatWorkspace() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState(searchParams.get("prompt") ?? "");
  const [model, setModel] = useState("Nexora Pro");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit() {
    const value = input.trim();
    if (!value || generating) return;
    const userMessage: ChatMessage = { id: Date.now(), role: "user", content: value };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await ensureGuestToken();

      // 1. Try RAG first — search uploaded documents for context
      let ragContext = "";
      let ragSources: string[] = [];
      try {
        const token = typeof window !== "undefined"
          ? (window.localStorage.getItem("nexora_token") ?? (() => {
              for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key?.startsWith("sb-") && key?.endsWith("-auth-token")) {
                  try { return JSON.parse(window.localStorage.getItem(key) ?? "{}")?.access_token ?? null; }
                  catch { return null; }
                }
              }
              return null;
            })())
          : null;

        if (token) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
          const ragRes = await fetch(`${baseUrl}/rag/query`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ question: value, top_k: 3 }),
            signal: controller.signal,
          });
          if (ragRes.ok) {
            const ragData = await ragRes.json();
            if (ragData.success && ragData.data?.answer) {
              ragContext = ragData.data.answer;
              ragSources = ragData.data.sources?.map((s: { document_name?: string }) => s.document_name ?? "Document").filter(Boolean) ?? [];
            }
          }
        }
      } catch { /* RAG failed — fallback to plain chat */ }

      // 2. If RAG returned an answer, show it directly
      if (ragContext && ragSources.length > 0) {
        setMessages((current) => [
          ...current,
          { id: Date.now() + 1, role: "assistant", content: ragContext, sources: ragSources },
        ]);
      } else {
        // 3. Fallback to regular chat
        const result = await sendChatMessage(value, conversationId, controller.signal);
        if (result.conversation_id) setConversationId(result.conversation_id);
        setMessages((current) => [
          ...current,
          { id: Date.now() + 1, role: "assistant", content: result.content },
        ]);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = readError(error, "The AI service is unavailable right now.");
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: `⚠️ ${message}` },
      ]);
      toast.error(message);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setGenerating(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
    toast("Generation stopped");
  }

  function newChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
    setConversationId(null);
    setMessages([{ id: Date.now(), role: "assistant", content: "Fresh workspace ready. What would you like to work on?" }]);
    setInput("");
    toast.success("New chat created");
  }

  async function copyMessage(message: ChatMessage) {
    await navigator.clipboard.writeText(message.content);
    setCopied(message.id);
    setTimeout(() => setCopied(null), 1200);
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser || generating) return;
    setInput(lastUser.content);
    toast("Prompt restored. Edit it or send again.");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#17316d]/60 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button className={`${iconButton} lg:hidden`} aria-label="Open chat history"><Menu className="h-4 w-4" /></button>
          <div>
            <h1 className="text-[16px] font-bold text-white">AI Chat</h1>
            <p className="text-[10px] text-emerald-400">● Online · Context enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative hidden sm:block">
            <select value={model} onChange={(event) => setModel(event.target.value)} className="h-9 appearance-none rounded-xl border border-[#234384]/70 bg-[#081732] pl-3 pr-8 text-[11px] font-semibold text-slate-200 outline-none">
              <option>Nexora Pro</option><option>Nexora Fast</option><option>Nexora Reasoning</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          </label>
          <button onClick={newChat} className={primaryButton}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Chat</span></button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl border", message.role === "assistant" ? "border-cyan-400/30 bg-[linear-gradient(145deg,#0ea5e9,#7c3aed)] text-white" : "border-violet-400/25 bg-violet-500/15 text-violet-300")}>
                {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </div>
              <div className={cn("group max-w-[82%]", message.role === "user" && "text-right")}>
                <div className={cn("rounded-2xl border px-4 py-3 text-left text-[13px] leading-6", message.role === "assistant" ? "border-[#1d3b7c]/65 bg-[#071632] text-slate-200" : "border-violet-400/30 bg-[linear-gradient(120deg,rgba(37,99,235,.45),rgba(124,58,237,.45))] text-white")}>
                  {message.content}
                </div>
                {message.sources && <div className="mt-2 flex flex-wrap gap-2">{message.sources.map((source, idx) => <span key={`${source}-${idx}`} className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 text-[9px] text-cyan-300">{source}</span>)}</div>}
                <div className={cn("mt-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100", message.role === "user" && "justify-end")}>
                  <button onClick={() => copyMessage(message)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300" aria-label="Copy message">{copied === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button>
                  {message.role === "user" && <button onClick={() => setInput(message.content)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300" aria-label="Edit prompt"><Edit3 className="h-3.5 w-3.5" /></button>}
                  {message.role === "assistant" && <button onClick={regenerate} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300" aria-label="Regenerate response"><RefreshCw className="h-3.5 w-3.5" /></button>}
                </div>
              </div>
            </div>
          ))}
          {generating && <div className="flex items-center gap-3 text-[12px] text-cyan-300"><span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/15"><Sparkles className="h-4 w-4 animate-pulse" /></span><span>NEXORA is thinking<span className="animate-pulse">...</span></span></div>}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#16306a]/55 bg-[#030a1d]/85 p-3 sm:p-4">
        <NeonSurface className="mx-auto max-w-3xl p-2">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={2} placeholder="Ask NEXORA anything..." className="max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-500" />
          <div className="flex items-center justify-between gap-3 border-t border-[#17316c]/50 px-2 pt-2">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) toast.success(`${file.name} attached (mock)`); }} />
              <button onClick={() => fileRef.current?.click()} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-cyan-300" aria-label="Attach a file"><Paperclip className="h-4 w-4" /></button>
              <button onClick={() => fileRef.current?.click()} className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-cyan-300 sm:block" aria-label="Upload document"><FileUp className="h-4 w-4" /></button>
              <span className="ml-1 text-[9px] text-slate-600">{model}</span>
            </div>
            {generating ? <button onClick={stop} className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/15 text-rose-300" aria-label="Stop generation"><Square className="h-3.5 w-3.5 fill-current" /></button> : <button onClick={submit} disabled={!input.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#2563eb,#06b6d4)] text-white disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>}
          </div>
        </NeonSurface>
        <p className="mt-2 text-center text-[9px] text-slate-600">Connected to NEXORA AI · can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}
