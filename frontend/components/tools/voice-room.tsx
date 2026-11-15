"use client";

import { useEffect, useState } from "react";
import {
  CircleStop,
  Clock3,
  History,
  Mic,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { NeonSurface, PageIntro, Pill, SurfaceHeader, WorkspacePage, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

const transcriptParts = [
  "Hi NEXORA, help me plan the priorities for today.",
  "I need to review the product proposal, prepare the sales summary,",
  "and create a short update for the team before 4 PM.",
];

export function VoiceRoom() {
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voice, setVoice] = useState("Nova · Warm");
  const [transcriptCount, setTranscriptCount] = useState(0);
  const [sessions, setSessions] = useState([
    { title: "Morning planning", time: "Yesterday · 4:12", duration: "03:28" },
    { title: "Proposal brainstorm", time: "May 12 · 11:20", duration: "08:16" },
    { title: "Weekly reflection", time: "May 09 · 17:40", duration: "05:02" },
  ]);

  useEffect(() => {
    if (!active || paused) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
      setTranscriptCount((value) => Math.min(transcriptParts.length, value + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, paused]);

  function start() {
    setActive(true); setPaused(false); setSeconds(0); setTranscriptCount(0);
    toast.success("Voice simulation started");
  }

  function finish() {
    if (active) setSessions((current) => [{ title: "Today’s voice conversation", time: "Just now", duration: format(seconds) }, ...current]);
    setActive(false); setPaused(false);
    toast.success("Transcript saved locally");
  }

  const waveform = Array.from({ length: 42 }, (_, index) => 12 + ((index * 17) % 44));

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Natural voice workspace" title="Voice Room" description="Think out loud with a live transcript, voice controls, and conversation history." actions={<label className="flex h-10 items-center gap-2 rounded-xl border border-[#234483]/65 bg-[#07152f] px-3 text-[11px] text-slate-300"><Volume2 className="h-4 w-4 text-cyan-300" /><select value={voice} onChange={(event) => { setVoice(event.target.value); toast.success("Voice changed"); }} className="bg-transparent outline-none"><option>Nova · Warm</option><option>Atlas · Clear</option><option>Luma · Calm</option></select></label>} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.72fr)]">
        <NeonSurface className="relative min-h-[580px] overflow-hidden p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(37,99,235,.12))]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 opacity-50"><svg viewBox="0 0 800 120" preserveAspectRatio="none" className="h-full w-full"><defs><linearGradient id="mountains" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#2563eb" /><stop offset=".55" stopColor="#7c3aed" /><stop offset="1" stopColor="#ec4899" /></linearGradient></defs><path d="M0 120 L0 92 L90 60 L150 88 L245 34 L330 83 L430 42 L520 86 L630 30 L720 72 L800 50 L800 120Z" fill="url(#mountains)" fillOpacity=".25" /><path d="M0 92 L90 60 L150 88 L245 34 L330 83 L430 42 L520 86 L630 30 L720 72 L800 50" fill="none" stroke="url(#mountains)" strokeOpacity=".55" /></svg></div>

          <div className="relative flex h-full min-h-[520px] flex-col items-center justify-center text-center">
            <Pill tone={active ? "green" : "slate"}>{active ? paused ? "Paused" : "Listening" : "Ready"}</Pill>
            <div className="relative mt-8"><span className={cn("absolute inset-0 rounded-full blur-2xl transition-colors", active ? "bg-cyan-400/35 animate-pulse" : "bg-violet-500/15")} /><button onClick={active ? () => setPaused((value) => !value) : start} className={cn("relative grid h-28 w-28 place-items-center rounded-full border-2 text-white transition-all", active ? "border-cyan-200/70 bg-[radial-gradient(circle,#7c3aed,#2563eb_55%,#07152f_72%)] shadow-[0_0_50px_rgba(34,211,238,.4)]" : "border-violet-400/40 bg-[radial-gradient(circle,#7c3aed,#312e81_55%,#07152f_72%)] shadow-[0_0_35px_rgba(124,58,237,.25)]")} aria-label={active ? "Pause or resume" : "Start voice session"}>{active && paused ? <Play className="h-9 w-9 fill-current" /> : <Mic className="h-10 w-10" />}</button></div>
            <h2 className="mt-6 text-xl font-bold text-white">{active ? paused ? "Conversation paused" : "I’m listening…" : "Start a voice conversation"}</h2>
            <p className="mt-2 text-[12px] text-slate-500">{active ? format(seconds) : "Frontend voice simulation · No audio is uploaded"}</p>

            <div className="mt-8 flex h-16 w-full max-w-xl items-center justify-center gap-1 overflow-hidden">{waveform.map((height, index) => <span key={index} className={cn("w-1 rounded-full bg-[linear-gradient(180deg,#22d3ee,#8b5cf6,#ec4899)] transition-all", active && !paused && "animate-pulse")} style={{ height: active ? `${height}px` : `${Math.max(5, height / 5)}px`, animationDelay: `${index * 35}ms` }} />)}</div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">{!active ? <button onClick={start} className={primaryButton}><Mic className="h-4 w-4" /> Start Session</button> : <><button onClick={() => setPaused((value) => !value)} className={secondaryButton}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {paused ? "Resume" : "Pause"}</button><button onClick={() => { setSeconds(0); setTranscriptCount(0); }} className={secondaryButton}><RotateCcw className="h-4 w-4" /> Restart</button><button onClick={finish} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500 px-4 text-[12px] font-bold text-white"><CircleStop className="h-4 w-4" /> Finish</button></>}</div>
          </div>
        </NeonSurface>

        <div className="space-y-5">
          <NeonSurface className="overflow-hidden"><SurfaceHeader title="Live Transcript" description="Appears locally while the simulation runs" action={<Radio className={cn("h-4 w-4", active && !paused ? "animate-pulse text-rose-400" : "text-slate-600")} />} /><div className="min-h-[230px] p-4"><div className="space-y-3">{transcriptParts.slice(0, transcriptCount).map((part, index) => <p key={part} className="rounded-xl border border-[#1d3a78]/55 bg-[#07152f] p-3 text-[11px] leading-5 text-slate-300"><span className="mr-2 text-cyan-400">{index + 1}.</span>{part}</p>)}{transcriptCount === 0 && <div className="grid min-h-[180px] place-items-center text-center"><div><Sparkles className="mx-auto h-7 w-7 text-slate-700" /><p className="mt-2 text-[11px] text-slate-600">Start speaking to see the live transcript.</p></div></div>}</div></div></NeonSurface>

          <NeonSurface className="overflow-hidden"><SurfaceHeader title="Conversation History" action={<History className="h-4 w-4 text-violet-300" />} /><div className="divide-y divide-[#17306a]/45">{sessions.slice(0, 4).map((session) => <button key={`${session.title}-${session.time}`} onClick={() => toast(`Opened ${session.title}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-500/5"><Clock3 className="h-4 w-4 shrink-0 text-blue-300" /><span className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-white">{session.title}</strong><span className="text-[9px] text-slate-600">{session.time}</span></span><span className="text-[9px] text-slate-500">{session.duration}</span></button>)}</div></NeonSurface>
        </div>
      </div>
    </WorkspacePage>
  );
}

function format(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
