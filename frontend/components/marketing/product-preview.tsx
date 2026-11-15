import { BarChart3, Bot, FileText, MessageSquare, Mic, Plus, Search, Send, Sparkles } from "lucide-react";

export function ProductPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl px-1 sm:px-5">
      <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[conic-gradient(from_180deg,rgba(37,99,235,0.17),rgba(124,58,237,0.25),rgba(6,182,212,0.18),rgba(37,99,235,0.17))] blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-blue-400/35 bg-[#050d27] p-1.5 shadow-[0_0_55px_rgba(37,99,235,0.25),0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-[26px] sm:p-2">
        <div className="grid min-h-[400px] grid-cols-[58px_1fr] overflow-hidden rounded-xl border border-white/5 bg-[#050b20] sm:grid-cols-[176px_1fr] sm:rounded-[19px]">
          <aside className="border-r border-blue-400/10 bg-[#050a1b] p-2.5 sm:p-4">
            <div className="mb-7 flex items-center gap-2 px-1 text-xs font-black tracking-[0.12em] text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-[11px] italic shadow-[0_0_14px_rgba(59,130,246,0.5)]">N</span>
              <span className="hidden sm:inline">NEXORA</span>
            </div>
            <div className="space-y-1.5">
              {[
                [MessageSquare, "AI Chat", true],
                [FileText, "Documents", false],
                [BarChart3, "Data Lab", false],
                [Mic, "Voice Room", false],
              ].map(([Icon, label, active]) => {
                const IconComponent = Icon as typeof MessageSquare;
                return (
                  <div key={String(label)} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] ${active ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.25)]" : "text-slate-500"}`}>
                    <IconComponent className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">{String(label)}</span>
                  </div>
                );
              })}
            </div>
          </aside>
          <div className="min-w-0">
            <div className="flex h-14 items-center justify-between border-b border-blue-400/10 px-4 sm:px-5">
              <div><p className="text-xs font-bold text-white">AI Workspace</p><p className="text-[9px] text-emerald-400">● Online</p></div>
              <div className="hidden w-48 items-center gap-2 rounded-lg border border-white/5 bg-blue-950/50 px-3 py-2 text-[9px] text-slate-500 sm:flex"><Search className="h-3 w-3" /> Search anything...</div>
              <button aria-label="Create new" className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="relative flex h-[344px] flex-col p-4 sm:p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-600/10 blur-3xl" />
              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600"><Bot className="h-4 w-4" /></span>
                <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-blue-400/15 bg-blue-500/10 px-3.5 py-2.5 text-left text-[10px] leading-5 text-slate-300 sm:text-xs">Welcome back, Alex. What are we creating today?</div>
              </div>
              <div className="mt-5 flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-violet-600 px-3.5 py-2.5 text-left text-[10px] leading-5 text-white sm:text-xs">Turn my research notes into a clear launch strategy.</div>
              </div>
              <div className="mt-5 flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600"><Sparkles className="h-4 w-4" /></span>
                <div className="max-w-[82%] space-y-2 rounded-2xl rounded-tl-sm border border-blue-400/15 bg-blue-500/10 px-3.5 py-3 text-left text-[10px] text-slate-300 sm:text-xs">
                  <p className="font-bold text-white">Your launch strategy is ready</p>
                  <div className="h-1.5 w-full rounded-full bg-blue-950"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" /></div>
                  <p className="text-slate-500">I found 4 audience insights and 3 priority channels.</p>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-3 rounded-xl border border-blue-400/20 bg-[#071433] px-3 py-2.5 text-[10px] text-slate-500 shadow-[0_0_18px_rgba(37,99,235,0.1)] sm:text-xs">
                Ask NEXORA anything...
                <span className="ml-auto grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white"><Send className="h-3.5 w-3.5" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
