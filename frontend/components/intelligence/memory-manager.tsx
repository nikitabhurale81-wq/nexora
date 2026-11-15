"use client";

import { useMemo, useState } from "react";
import { Archive, CheckSquare, Download, Eraser, Filter, MemoryStick, SearchX, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { MetricTile, NeonSurface, PageIntro, Pill, SearchBox, SurfaceHeader, WorkspacePage, secondaryButton } from "@/components/shared/workspace-ui";

const initialRows = [
  { id: 1, memory: "Prefers concise, example-led answers", category: "Preference", source: "AI Chat", created: "May 14", used: "12 times", active: true },
  { id: 2, memory: "NEXORA frontend uses Next.js App Router", category: "Project", source: "Code Studio", created: "May 13", used: "8 times", active: true },
  { id: 3, memory: "Weekly reports should include growth and risks", category: "Routine", source: "Reports", created: "May 11", used: "5 times", active: true },
  { id: 4, memory: "Interested in RAG and document intelligence", category: "Interest", source: "Documents", created: "May 08", used: "9 times", active: true },
  { id: 5, memory: "Focus hours are 9 AM to noon", category: "Personal", source: "Manual", created: "May 05", used: "2 times", active: false },
  { id: 6, memory: "Use USD for financial summaries", category: "Preference", source: "Data Lab", created: "May 02", used: "7 times", active: true },
];

export function MemoryManager() {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selected, setSelected] = useState<number[]>([]);
  const [retention, setRetention] = useState("Until deleted");
  const [confirmClear, setConfirmClear] = useState(false);

  const visible = useMemo(() => rows.filter((row) => `${row.memory} ${row.source}`.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || row.category === category)), [category, query, rows]);

  function toggleSelection(id: number) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function bulkDelete() {
    setRows((current) => current.filter((row) => !selected.includes(row.id)));
    toast.success(`${selected.length} memories removed`);
    setSelected([]);
  }

  function exportMemories() {
    const payload = JSON.stringify(rows, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "nexora-memories.json"; anchor.click(); URL.revokeObjectURL(url);
    toast.success("Memory export downloaded");
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Memory controls" title="Memory Management" description="Audit where memories came from, control retention, and make bulk changes." actions={<><button onClick={exportMemories} className={secondaryButton}><Download className="h-4 w-4" /> Export</button><button onClick={() => setConfirmClear(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 text-[12px] font-bold text-rose-300 hover:bg-rose-500/15"><Eraser className="h-4 w-4" /> Clear All</button></>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="Total Memories" value={String(rows.length)} detail="Across 6 sources" icon={MemoryStick} tone="violet" /><MetricTile label="Active" value={String(rows.filter((row) => row.active).length)} detail="Available to AI" icon={ShieldCheck} tone="emerald" /><MetricTile label="Selected" value={String(selected.length)} detail="Bulk action queue" icon={CheckSquare} tone="blue" /><MetricTile label="Archived" value="12" detail="Not used in chats" icon={Archive} tone="amber" /></div>

      <NeonSurface className="p-4"><div className="grid gap-4 md:grid-cols-2"><label className="text-[11px] font-semibold text-slate-300">Default retention<select value={retention} onChange={(event) => { setRetention(event.target.value); toast.success("Retention updated"); }} className="mt-2 h-10 w-full rounded-xl border border-[#234383]/65 bg-[#07152f] px-3 text-[11px] text-white outline-none"><option>Until deleted</option><option>90 days</option><option>30 days</option><option>Session only</option></select></label><div className="rounded-xl border border-blue-400/20 bg-blue-500/8 p-3"><p className="text-[11px] font-bold text-blue-300">Privacy note</p><p className="mt-1 text-[10px] leading-5 text-slate-400">Memory controls here affect mock frontend state. Backend retention enforcement will be configured separately.</p></div></div></NeonSurface>

      <NeonSurface className="overflow-hidden"><SurfaceHeader title="Memory Inventory" description={`${visible.length} records visible`} action={selected.length ? <button onClick={bulkDelete} className="inline-flex h-8 items-center gap-2 rounded-lg bg-rose-500 px-3 text-[10px] font-bold text-white"><Trash2 className="h-3.5 w-3.5" /> Delete {selected.length}</button> : undefined} /><div className="flex flex-col gap-3 border-b border-[#18316b]/50 p-3 md:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search memory records..." className="flex-1" /><label className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-[#234383]/65 bg-[#07152f] pl-9 pr-4 text-[11px] text-slate-300 outline-none"><option>All categories</option>{[...new Set(rows.map((row) => row.category))].map((value) => <option key={value}>{value}</option>)}</select></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-[#07152f]"><tr><th className="w-12 px-4 py-3"><button onClick={() => setSelected(selected.length === visible.length ? [] : visible.map((row) => row.id))} className="h-4 w-4 rounded border border-blue-400/40" aria-label="Select all" /></th>{["Memory", "Category", "Source", "Created", "Usage", "Status"].map((heading) => <th key={heading} className="px-3 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#17306a]/45">{visible.map((row) => <tr key={row.id} className="hover:bg-blue-500/5"><td className="px-4 py-3"><button onClick={() => toggleSelection(row.id)} className={`grid h-4 w-4 place-items-center rounded border ${selected.includes(row.id) ? "border-blue-400 bg-blue-600" : "border-slate-600"}`} aria-label={`Select ${row.memory}`}>{selected.includes(row.id) && <span className="text-[9px] text-white">✓</span>}</button></td><td className="max-w-sm px-3 py-3 text-[11px] font-medium text-slate-200">{row.memory}</td><td className="px-3 py-3"><Pill tone="violet">{row.category}</Pill></td><td className="px-3 py-3 text-[10px] text-slate-400">{row.source}</td><td className="px-3 py-3 text-[10px] text-slate-500">{row.created}</td><td className="px-3 py-3 text-[10px] text-slate-400">{row.used}</td><td className="px-3 py-3"><Switch checked={row.active} onCheckedChange={(checked) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, active: checked } : item))} label={`Toggle ${row.memory}`} /></td></tr>)}</tbody></table>{!visible.length && <div className="grid min-h-56 place-items-center text-center"><div><SearchX className="mx-auto h-9 w-9 text-slate-700" /><p className="mt-2 text-xs text-slate-500">No memories found.</p></div></div>}</div>
      </NeonSurface>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear every memory?" description="This action updates frontend mock state only."><p className="text-[12px] leading-5 text-slate-300">All {rows.length} memory records will be removed from this session. You can restore sample data by refreshing the page.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirmClear(false)} className={secondaryButton}>Cancel</button><button onClick={() => { setRows([]); setSelected([]); setConfirmClear(false); toast.success("All mock memories cleared"); }} className="h-10 rounded-xl bg-rose-500 px-4 text-xs font-bold text-white">Clear all</button></div></Modal>
    </WorkspacePage>
  );
}
