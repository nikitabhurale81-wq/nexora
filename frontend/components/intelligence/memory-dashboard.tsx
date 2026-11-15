"use client";

import { useMemo, useState } from "react";
import { Brain, BriefcaseBusiness, CalendarDays, Edit3, Heart, Lightbulb, Plus, Sparkles, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { MetricTile, NeonSurface, PageIntro, Pill, SearchBox, SurfaceHeader, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

type Memory = { id: number; title: string; detail: string; category: "Preferences" | "Work" | "Personal" | "Goals"; enabled: boolean; updated: string };
const seeds: Memory[] = [
  { id: 1, title: "Prefers dark theme", detail: "Use dark interfaces and high-contrast charts by default.", category: "Preferences", enabled: true, updated: "Today" },
  { id: 2, title: "Learning AI automation", detail: "Interested in practical workflows, RAG, and frontend product design.", category: "Goals", enabled: true, updated: "Yesterday" },
  { id: 3, title: "Weekly product review", detail: "Prepare a concise product progress summary every Friday.", category: "Work", enabled: true, updated: "May 12" },
  { id: 4, title: "Concise answer style", detail: "Prefer direct explanations with a short example and next step.", category: "Preferences", enabled: true, updated: "May 10" },
  { id: 5, title: "Focus hours", detail: "Deep work usually happens between 9 AM and noon.", category: "Personal", enabled: false, updated: "May 08" },
];
const categoryIcon = { Preferences: Sparkles, Work: BriefcaseBusiness, Personal: UserRound, Goals: Lightbulb };

export function MemoryDashboard() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memories, setMemories] = useState(seeds);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [formCategory, setFormCategory] = useState<Memory["category"]>("Preferences");
  const [pendingDelete, setPendingDelete] = useState<Memory | null>(null);

  const visible = useMemo(() => memories.filter((memory) => (category === "All" || memory.category === category) && `${memory.title} ${memory.detail}`.toLowerCase().includes(query.toLowerCase())), [category, memories, query]);

  function openForm(memory?: Memory) {
    setEditing(memory ?? null); setTitle(memory?.title ?? ""); setDetail(memory?.detail ?? ""); setFormCategory(memory?.category ?? "Preferences"); setModalOpen(true);
  }

  function save() {
    if (!title.trim() || !detail.trim()) { toast.error("Add a title and memory detail"); return; }
    if (editing) setMemories((current) => current.map((memory) => memory.id === editing.id ? { ...memory, title, detail, category: formCategory, updated: "Just now" } : memory));
    else setMemories((current) => [{ id: Date.now(), title, detail, category: formCategory, enabled: true, updated: "Just now" }, ...current]);
    setModalOpen(false); toast.success(editing ? "Memory updated" : "Memory added");
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Personal intelligence" title="AI Memory" description="Control the useful details NEXORA remembers to personalize future work." actions={<button onClick={() => openForm()} className={primaryButton}><Plus className="h-4 w-4" /> Add Memory</button>} />

      <NeonSurface className="relative overflow-hidden p-5"><div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-600/15 blur-3xl" /><div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-300 shadow-[0_0_24px_rgba(124,58,237,.18)]"><Brain className="h-7 w-7" /></span><div><div className="flex items-center gap-2"><h2 className="text-[16px] font-bold text-white">Memory Status</h2><Pill tone={memoryEnabled ? "green" : "slate"}>{memoryEnabled ? "Enabled" : "Paused"}</Pill></div><p className="mt-1 text-[11px] text-slate-400">{memoryEnabled ? "NEXORA can use enabled memories in new chats." : "New chats will not use saved memories."}</p></div></div><Switch checked={memoryEnabled} onCheckedChange={(checked) => { setMemoryEnabled(checked); toast.success(checked ? "AI memory enabled" : "AI memory paused"); }} label="Enable AI memory" /></div></NeonSurface>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="Saved Memories" value={String(memories.length)} detail={`${memories.filter((item) => item.enabled).length} active`} icon={Brain} tone="violet" /><MetricTile label="Preferences" value={String(memories.filter((item) => item.category === "Preferences").length)} detail="Response personalization" icon={Heart} tone="rose" /><MetricTile label="Work Context" value={String(memories.filter((item) => item.category === "Work").length)} detail="Projects and routines" icon={BriefcaseBusiness} tone="blue" /><MetricTile label="Last Updated" value="Today" detail="Memory stays editable" icon={CalendarDays} tone="cyan" /></div>

      <NeonSurface className="overflow-hidden"><SurfaceHeader title="Saved Memories" description="Review, edit, pause, or remove individual details" action={<SearchBox value={query} onChange={setQuery} placeholder="Search memory..." className="hidden w-64 md:block" />} /><div className="border-b border-[#18316b]/50 p-3"><div className="flex flex-wrap gap-2">{["All", "Preferences", "Work", "Personal", "Goals"].map((value) => <button key={value} onClick={() => setCategory(value)} className={cn("rounded-lg border px-3 py-1.5 text-[10px] font-semibold", category === value ? "border-violet-400/35 bg-violet-500/15 text-violet-300" : "border-[#203c79]/55 text-slate-500 hover:text-white")}>{value}</button>)}</div><SearchBox value={query} onChange={setQuery} placeholder="Search memory..." className="mt-3 md:hidden" /></div><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">{visible.map((memory) => { const CategoryIcon = categoryIcon[memory.category]; return <article key={memory.id} className="rounded-xl border border-[#203d7c]/60 bg-[#07152f] p-4 transition-colors hover:border-violet-400/35"><div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/12 text-violet-300"><CategoryIcon className="h-4 w-4" /></span><Switch checked={memory.enabled} onCheckedChange={(checked) => setMemories((current) => current.map((item) => item.id === memory.id ? { ...item, enabled: checked } : item))} label={`Toggle ${memory.title}`} /></div><h3 className="mt-3 text-[12px] font-bold text-white">{memory.title}</h3><p className="mt-1.5 line-clamp-2 text-[10px] leading-5 text-slate-400">{memory.detail}</p><div className="mt-4 flex items-center justify-between"><div><Pill tone="violet">{memory.category}</Pill><span className="ml-2 text-[9px] text-slate-600">{memory.updated}</span></div><div className="flex gap-1"><button onClick={() => openForm(memory)} className={iconButton} aria-label="Edit memory"><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => setPendingDelete(memory)} className={`${iconButton} hover:text-rose-300`} aria-label="Delete memory"><Trash2 className="h-3.5 w-3.5" /></button></div></div></article>; })}{!visible.length && <div className="col-span-full py-14 text-center text-[12px] text-slate-500">No memories match these filters.</div>}</div></NeonSurface>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit memory" : "Add memory"} description="Save a useful fact that can personalize future AI responses."><div className="space-y-4"><label className="block text-[11px] font-semibold text-slate-300">Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Preferred writing style" className="mt-2 h-10 w-full rounded-xl border border-[#244483]/65 bg-[#07152f] px-3 text-[12px] text-white outline-none focus:border-cyan-400/50" /></label><label className="block text-[11px] font-semibold text-slate-300">What should NEXORA remember?<textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows={4} placeholder="Describe the preference or context…" className="mt-2 w-full resize-none rounded-xl border border-[#244483]/65 bg-[#07152f] p-3 text-[12px] text-white outline-none focus:border-cyan-400/50" /></label><label className="block text-[11px] font-semibold text-slate-300">Category<select value={formCategory} onChange={(event) => setFormCategory(event.target.value as Memory["category"])} className="mt-2 h-10 w-full rounded-xl border border-[#244483]/65 bg-[#07152f] px-3 text-[12px] text-white outline-none"><option>Preferences</option><option>Work</option><option>Personal</option><option>Goals</option></select></label><div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className={secondaryButton}>Cancel</button><button onClick={save} className={primaryButton}>Save Memory</button></div></div></Modal>
      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete memory?" description="This removes the item from local mock state."><p className="text-[12px] text-slate-300">NEXORA will no longer remember <strong>{pendingDelete?.title}</strong>.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingDelete(null)} className={secondaryButton}>Cancel</button><button onClick={() => { if (pendingDelete) setMemories((current) => current.filter((item) => item.id !== pendingDelete.id)); setPendingDelete(null); toast.success("Memory removed"); }} className="h-10 rounded-xl bg-rose-500 px-4 text-xs font-bold text-white">Delete</button></div></Modal>
    </WorkspacePage>
  );
}
