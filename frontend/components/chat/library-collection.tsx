"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Clock3,
  Code2,
  FileText,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  SearchX,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import {
  NeonSurface,
  PageIntro,
  Pill,
  SearchBox,
  WorkspacePage,
  iconButton,
  primaryButton,
  secondaryButton,
} from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

type CollectionKind = "history" | "favorites" | "saved";
type Item = { id: number; title: string; preview: string; type: "chat" | "document" | "code"; date: string; group: string; starred: boolean };

const seedItems: Item[] = [
  { id: 1, title: "AI in Education", preview: "A practical analysis of adaptive learning and classroom workflows.", type: "chat", date: "Today · 2:30 PM", group: "Today", starred: true },
  { id: 2, title: "Business Ideas for 2026", preview: "Validated product concepts for small B2B teams.", type: "chat", date: "Today · 11:15 AM", group: "Today", starred: true },
  { id: 3, title: "Python API Helper", preview: "FastAPI endpoint structure and validation examples.", type: "code", date: "Yesterday · 6:20 PM", group: "This Week", starred: true },
  { id: 4, title: "Q3 Research Summary", preview: "Highlights and citations from the uploaded market report.", type: "document", date: "May 12 · 10:05 AM", group: "This Week", starred: false },
  { id: 5, title: "Marketing Calendar", preview: "A twelve-week launch calendar with measurable outcomes.", type: "chat", date: "May 08 · 4:40 PM", group: "This Month", starred: false },
  { id: 6, title: "Authentication Refactor", preview: "Saved explanation of token refresh and route protection.", type: "code", date: "May 02 · 1:10 PM", group: "This Month", starred: true },
];

const config = {
  history: { title: "Chat History", description: "Find and continue every conversation across your workspace.", eyebrow: "Conversation archive" },
  favorites: { title: "Favorites", description: "Your starred conversations, files, and code responses in one place.", eyebrow: "Pinned knowledge" },
  saved: { title: "Saved Items", description: "Reusable answers, snippets, citations, and notes you saved for later.", eyebrow: "Personal library" },
};

const typeIcon = { chat: MessageSquareText, document: FileText, code: Code2 };

export function LibraryCollection({ kind }: { kind: CollectionKind }) {
  const [items, setItems] = useState(seedItems);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("All");
  const [type, setType] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (kind === "favorites" && !item.starred) return false;
      const matchesQuery = `${item.title} ${item.preview}`.toLowerCase().includes(query.toLowerCase());
      const matchesRange = range === "All" || item.group === range;
      const matchesType = type === "all" || item.type === type;
      return matchesQuery && matchesRange && matchesType;
    });
  }, [items, kind, query, range, type]);

  function toggleStar(id: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, starred: !item.starred } : item));
    toast.success("Favorite updated");
  }

  function deleteItem() {
    if (!pendingDelete) return;
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    toast.success("Item removed from this mock workspace");
    setPendingDelete(null);
  }

  return (
    <WorkspacePage>
      <PageIntro {...config[kind]} actions={<Link href="/chat" className={primaryButton}><Plus className="h-4 w-4" /> New Chat</Link>} />

      <NeonSurface className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={`Search ${config[kind].title.toLowerCase()}...`} className="w-full lg:max-w-md" />
          <div className="flex flex-wrap gap-2">
            {(["All", "Today", "This Week", "This Month"] as const).map((value) => (
              <button key={value} onClick={() => setRange(value)} className={cn("h-9 rounded-xl border px-3 text-[11px] font-semibold", range === value ? "border-blue-400/35 bg-blue-500/20 text-blue-200" : "border-[#213d7a]/60 bg-[#07142e] text-slate-400 hover:text-white")}>{value}</button>
            ))}
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-9 rounded-xl border border-[#213d7a]/60 bg-[#07142e] px-3 text-[11px] text-slate-300 outline-none">
              <option value="all">All types</option><option value="chat">Chats</option><option value="document">Documents</option><option value="code">Code</option>
            </select>
          </div>
        </div>
      </NeonSurface>

      {visible.length ? (
        <div className={cn("grid gap-3", kind === "history" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
          {visible.map((item) => {
            const TypeIcon = typeIcon[item.type];
            return (
              <NeonSurface key={item.id} className="group flex min-w-0 items-center gap-3 p-4 transition-all hover:border-cyan-400/35">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-400/25 bg-blue-500/15 text-blue-300"><TypeIcon className="h-5 w-5" /></span>
                <Link href={`/chat?thread=${item.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h2 className="truncate text-[13px] font-bold text-white">{item.title}</h2><Pill tone={item.type === "code" ? "violet" : item.type === "document" ? "green" : "blue"}>{item.type}</Pill></div>
                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">{item.preview}</p>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-600"><Clock3 className="h-3 w-3" /> {item.date}</p>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => toggleStar(item.id)} className={iconButton} aria-label={item.starred ? "Remove favorite" : "Add favorite"}><Star className={cn("h-4 w-4", item.starred && "fill-amber-300 text-amber-300")} /></button>
                  <button onClick={() => setPendingDelete(item)} className={`${iconButton} hover:border-rose-400/40 hover:text-rose-300`} aria-label="Delete item"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => toast("More actions opened")} className={`${iconButton} hidden sm:grid`} aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </NeonSurface>
            );
          })}
        </div>
      ) : (
        <NeonSurface className="grid min-h-72 place-items-center p-8 text-center"><div><SearchX className="mx-auto h-10 w-10 text-slate-600" /><h2 className="mt-3 font-bold text-white">Nothing found</h2><p className="mt-1 text-[12px] text-slate-500">Try another search or clear your filters.</p><button onClick={() => { setQuery(""); setRange("All"); setType("all"); }} className={`${secondaryButton} mt-4`}>Clear filters</button></div></NeonSurface>
      )}

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Remove item?" description="This only updates local mock data and can be restored on refresh.">
        <p className="text-[13px] text-slate-300">Remove <strong>{pendingDelete?.title}</strong> from {config[kind].title.toLowerCase()}?</p>
        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingDelete(null)} className={secondaryButton}>Cancel</button><button onClick={deleteItem} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500 px-4 text-[12px] font-bold text-white"><Trash2 className="h-4 w-4" /> Remove</button></div>
      </Modal>
    </WorkspacePage>
  );
}
