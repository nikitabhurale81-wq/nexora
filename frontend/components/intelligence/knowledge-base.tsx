"use client";

import { useMemo, useState } from "react";
import { BookOpen, Database, FileText, FolderPlus, Globe2, Link2, MoreHorizontal, Plus, SearchX, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { MetricTile, NeonSurface, PageIntro, Pill, SearchBox, SurfaceHeader, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";

const seeds = [
  { id: 1, title: "Product Documentation", description: "Roadmap, requirements, architecture, and release notes.", sources: 24, chunks: 418, type: "Collection", updated: "12 min ago", color: "blue" },
  { id: 2, title: "Customer Research", description: "Interview transcripts, personas, objections, and feedback.", sources: 18, chunks: 302, type: "Collection", updated: "Yesterday", color: "violet" },
  { id: 3, title: "Company Handbook", description: "Policies, team rituals, onboarding, and operating principles.", sources: 12, chunks: 164, type: "Collection", updated: "May 12", color: "cyan" },
  { id: 4, title: "Competitor Intelligence", description: "Public pages, pricing comparisons, and market notes.", sources: 31, chunks: 590, type: "Web", updated: "May 11", color: "emerald" },
];

export function KnowledgeBase() {
  const [collections, setCollections] = useState(seeds);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const visible = useMemo(() => collections.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [collections, query]);

  function createCollection() {
    if (!name.trim()) { toast.error("Collection name is required"); return; }
    setCollections((current) => [{ id: Date.now(), title: name, description: description || "New knowledge collection.", sources: 0, chunks: 0, type: "Collection", updated: "Just now", color: "blue" }, ...current]);
    setName(""); setDescription(""); setModalOpen(false); toast.success("Knowledge collection created");
  }

  function addUrl() {
    if (!/^https?:\/\//i.test(url)) { toast.error("Enter a full http(s) URL"); return; }
    toast.success("Web source queued in mock mode"); setUrl(""); setUrlOpen(false);
  }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Connected knowledge" title="Knowledge Base" description="Organize trusted source collections that power cited answers across NEXORA." actions={<><button onClick={() => setUrlOpen(true)} className={secondaryButton}><Link2 className="h-4 w-4" /> Add URL</button><button onClick={() => setModalOpen(true)} className={primaryButton}><FolderPlus className="h-4 w-4" /> New Collection</button></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="Collections" value={String(collections.length)} detail="4 active indexes" icon={BookOpen} tone="blue" /><MetricTile label="Sources" value="85" detail="Documents and URLs" icon={FileText} tone="violet" /><MetricTile label="Knowledge Chunks" value="1,474" detail="Ready for retrieval" icon={Database} tone="cyan" /><MetricTile label="Coverage" value="96%" detail="Healthy indexing" icon={Sparkles} tone="emerald" /></div>

      <NeonSurface className="overflow-hidden"><SurfaceHeader title="Knowledge Collections" description="Open a collection to manage its sources and retrieval settings" action={<SearchBox value={query} onChange={setQuery} placeholder="Search collections..." className="hidden w-64 sm:block" />} /><div className="p-4 sm:p-5"><SearchBox value={query} onChange={setQuery} placeholder="Search collections..." className="mb-4 sm:hidden" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <article key={item.id} className="group rounded-2xl border border-[#203d7d]/65 bg-[#07152f] p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-400/35"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl border ${item.type === "Web" ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-300" : "border-blue-400/25 bg-blue-500/12 text-blue-300"}`}>{item.type === "Web" ? <Globe2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}</span><div className="flex gap-1"><button onClick={() => toast("Collection actions opened")} className={iconButton} aria-label="Collection actions"><MoreHorizontal className="h-4 w-4" /></button><button onClick={() => setPendingDelete(item.id)} className={`${iconButton} hover:text-rose-300`} aria-label="Delete collection"><Trash2 className="h-4 w-4" /></button></div></div><h2 className="mt-4 text-[14px] font-bold text-white">{item.title}</h2><p className="mt-2 min-h-10 text-[10px] leading-5 text-slate-400">{item.description}</p><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-blue-500/8 p-2.5"><span className="block text-[15px] font-bold text-blue-300">{item.sources}</span><span className="text-[9px] text-slate-500">Sources</span></div><div className="rounded-lg bg-violet-500/8 p-2.5"><span className="block text-[15px] font-bold text-violet-300">{item.chunks}</span><span className="text-[9px] text-slate-500">Chunks</span></div></div><div className="mt-4 flex items-center justify-between"><Pill tone="green">Indexed</Pill><span className="text-[9px] text-slate-600">{item.updated}</span></div><button onClick={() => toast.success(`${item.title} opened`)} className="mt-4 h-9 w-full rounded-xl border border-[#244687]/65 text-[10px] font-bold text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300">Manage collection</button></article>)}{!visible.length && <div className="col-span-full py-16 text-center"><SearchX className="mx-auto h-10 w-10 text-slate-700" /><p className="mt-2 text-xs text-slate-500">No knowledge collections found.</p></div>}</div></div></NeonSurface>

      <NeonSurface className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-300" /><h2 className="text-[13px] font-bold text-white">Retrieval playground</h2></div><p className="mt-1 text-[11px] text-slate-400">Test how your indexed collections answer a question before using them in chat.</p></div><button onClick={() => toast("Playground will use the selected collections in mock mode")} className={primaryButton}>Open Playground</button></NeonSurface>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create knowledge collection" description="Group related sources under one retrieval context."><div className="space-y-4"><label className="block text-[11px] text-slate-300">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#244585]/65 bg-[#07152f] px-3 text-white outline-none" placeholder="e.g. Product Documentation" /></label><label className="block text-[11px] text-slate-300">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-[#244585]/65 bg-[#07152f] p-3 text-white outline-none" placeholder="What belongs in this collection?" /></label><div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className={secondaryButton}>Cancel</button><button onClick={createCollection} className={primaryButton}><Plus className="h-4 w-4" /> Create</button></div></div></Modal>
      <Modal open={urlOpen} onClose={() => setUrlOpen(false)} title="Add web source" description="This frontend step validates the URL; crawling will be handled by the backend."><label className="block text-[11px] text-slate-300">Website URL<input value={url} onChange={(event) => setUrl(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#244585]/65 bg-[#07152f] px-3 text-white outline-none" placeholder="https://example.com/docs" /></label><div className="mt-5 flex justify-end gap-2"><button onClick={() => setUrlOpen(false)} className={secondaryButton}>Cancel</button><button onClick={addUrl} className={primaryButton}>Add Source</button></div></Modal>
      <Modal open={pendingDelete !== null} onClose={() => setPendingDelete(null)} title="Delete collection?" description="Sources remain untouched outside this mock interface."><p className="text-[12px] text-slate-300">This collection will disappear from local state.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingDelete(null)} className={secondaryButton}>Cancel</button><button onClick={() => { setCollections((current) => current.filter((item) => item.id !== pendingDelete)); setPendingDelete(null); toast.success("Collection removed"); }} className="h-10 rounded-xl bg-rose-500 px-4 text-xs font-bold text-white">Delete</button></div></Modal>
    </WorkspacePage>
  );
}
