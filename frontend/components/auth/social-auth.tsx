"use client";

import { Code2 } from "lucide-react";
import { toast } from "sonner";

export function SocialAuth() {
  const connect = (provider: string) => toast.info(`${provider} sign-in is ready for backend connection.`);
  return (
    <>
      <div className="flex items-center gap-3"><span className="h-px flex-1 bg-white/10" /><span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-700">or continue with</span><span className="h-px flex-1 bg-white/10" /></div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <button type="button" onClick={() => connect("Google")} aria-label="Continue with Google" className="grid h-11 place-items-center rounded-xl border border-white/10 bg-white/[.025] text-sm font-black text-white hover:border-blue-300/30 hover:bg-blue-500/5"><span className="text-base font-black text-blue-300">G</span></button>
        <button type="button" onClick={() => connect("GitHub")} aria-label="Continue with GitHub" className="grid h-11 place-items-center rounded-xl border border-white/10 bg-white/[.025] text-white hover:border-blue-300/30 hover:bg-blue-500/5"><Code2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => connect("Microsoft")} aria-label="Continue with Microsoft" className="grid h-11 place-items-center rounded-xl border border-white/10 bg-white/[.025] hover:border-blue-300/30 hover:bg-blue-500/5"><span className="grid grid-cols-2 gap-[2px]">{["bg-red-400","bg-green-400","bg-blue-400","bg-amber-400"].map(color => <i key={color} className={`h-1.5 w-1.5 ${color}`} />)}</span></button>
      </div>
    </>
  );
}
