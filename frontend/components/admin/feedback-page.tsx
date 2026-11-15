"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bug,
  CheckCircle2,
  Download,
  Eye,
  Lightbulb,
  MessageSquareMore,
  Smile,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { feedbackItems, type FeedbackItem } from "./admin-data";
import {
  ActionButton,
  downloadCsv,
  EmptyState,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  SearchField,
  SegmentedControl,
  StatusBadge,
} from "./admin-ui";

const categoryTone = { Bug: "danger", Feature: "violet", Quality: "warning", Praise: "success" } as const;
const priorityTone = { High: "danger", Medium: "warning", Low: "neutral" } as const;
const statusColumns: Array<FeedbackItem["status"]> = ["New", "Reviewing", "Resolved"];

export function FeedbackPage() {
  const [items, setItems] = useState(feedbackItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const filtered = useMemo(() => items.filter((item) =>
    (category === "All" || item.category === category) &&
    `${item.title} ${item.message} ${item.user} ${item.id}`.toLowerCase().includes(query.toLowerCase())
  ), [items, query, category]);

  function updateItem(id: string, patch: Partial<FeedbackItem>, message: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    setSelected((current) => current?.id === id ? { ...current, ...patch } : current);
    toast.success(message, { description: "Updated in this frontend session only." });
  }

  function exportFeedback() {
    downloadCsv("nexora-feedback-triage.csv", [
      ["ID", "Title", "Category", "Priority", "Status", "User", "Votes", "Assignee"],
      ...filtered.map((item) => [item.id, item.title, item.category, item.priority, item.status, item.user, item.votes, item.assignee ?? "Unassigned"]),
    ]);
    toast.success("Feedback triage CSV downloaded.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Voice of customer"
        title="Feedback Triage"
        description="Review product feedback, assign ownership, and move mock items through the triage workflow."
        actions={<ActionButton onClick={exportFeedback}><Download className="h-4 w-4" /> Export triage</ActionButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open feedback" value={items.filter((item) => item.status !== "Resolved").length.toString()} change="+12" detail="this week" icon={<MessageSquareMore className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="High priority" value={items.filter((item) => item.priority === "High" && item.status !== "Resolved").length.toString()} detail="needs attention" icon={<Bug className="h-5 w-5" />} tone="pink" />
        <MetricCard label="Feature requests" value={items.filter((item) => item.category === "Feature").length.toString()} detail="in current dataset" icon={<Lightbulb className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Positive sentiment" value="87%" change="+4.1%" detail="30-day trend" icon={<Smile className="h-5 w-5" />} tone="emerald" />
      </div>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField value={query} onChange={setQuery} placeholder="Search feedback, user, or ID..." className="w-full lg:max-w-md" />
          <SegmentedControl options={["All", "Bug", "Feature", "Quality", "Praise"]} value={category} onChange={setCategory} ariaLabel="Feedback category" />
        </div>
      </Panel>

      {filtered.length ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {statusColumns.map((status) => {
            const columnItems = filtered.filter((item) => item.status === status);
            return (
              <section key={status} className="min-w-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${status === "New" ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : status === "Reviewing" ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-emerald-400 shadow-[0_0_8px_#34d399]"}`} /><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">{status}</h2></div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{columnItems.length}</span>
                </div>
                <div className="space-y-3">
                  {columnItems.length ? columnItems.map((item) => (
                    <Panel key={item.id} className="p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/25">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5"><StatusBadge tone={categoryTone[item.category]}>{item.category}</StatusBadge><StatusBadge tone={priorityTone[item.priority]}>{item.priority}</StatusBadge></div>
                        <span className="text-[9px] font-semibold text-slate-600">{item.id}</span>
                      </div>
                      <h3 className="mt-3 text-sm font-bold leading-5 text-white">{item.title}</h3>
                      <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-500">{item.message}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-blue-500/10 pt-3"><div><p className="text-[10px] font-semibold text-slate-300">{item.user}</p><p className="mt-0.5 text-[9px] text-slate-600">{item.created}{item.assignee ? ` · ${item.assignee}` : ""}</p></div><span className="flex items-center gap-1 text-[10px] text-slate-500"><ThumbsUp className="h-3 w-3" />{item.votes}</span></div>
                      <div className="mt-3 flex gap-2">
                        <ActionButton variant="ghost" size="sm" className="flex-1" onClick={() => setSelected(item)}><Eye className="h-3.5 w-3.5" /> View</ActionButton>
                        {!item.assignee && <ActionButton variant="secondary" size="sm" onClick={() => updateItem(item.id, { assignee: "Alex", status: "Reviewing" }, `${item.id} assigned to Alex.`)} aria-label={`Assign ${item.id} to me`}><UserPlus className="h-3.5 w-3.5" /></ActionButton>}
                        {item.status !== "Resolved" && <ActionButton variant="secondary" size="sm" onClick={() => updateItem(item.id, { status: "Resolved", assignee: item.assignee ?? "Alex" }, `${item.id} marked resolved.`)} aria-label={`Resolve ${item.id}`}><CheckCircle2 className="h-3.5 w-3.5" /></ActionButton>}
                      </div>
                    </Panel>
                  )) : <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-blue-500/15 text-[11px] text-slate-600">No matching items</div>}
                </div>
              </section>
            );
          })}
        </div>
      ) : <Panel><EmptyState message="No feedback matches the current search and category." /></Panel>}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Feedback detail"} description={selected ? `${selected.id} · submitted by ${selected.user}` : undefined} footer={<>{selected && !selected.assignee && <ActionButton variant="secondary" onClick={() => updateItem(selected.id, { assignee: "Alex", status: "Reviewing" }, `${selected.id} assigned to Alex.`)}><UserPlus className="h-4 w-4" /> Assign to me</ActionButton>}{selected?.status !== "Resolved" && <ActionButton onClick={() => selected && updateItem(selected.id, { status: "Resolved", assignee: selected.assignee ?? "Alex" }, `${selected.id} marked resolved.`)}><CheckCircle2 className="h-4 w-4" /> Resolve</ActionButton>}<ActionButton variant="ghost" onClick={() => setSelected(null)}>Close</ActionButton></>}>
        {selected && <div><div className="flex flex-wrap gap-2"><StatusBadge tone={categoryTone[selected.category]}>{selected.category}</StatusBadge><StatusBadge tone={priorityTone[selected.priority]}>{selected.priority} priority</StatusBadge><StatusBadge tone={selected.status === "Resolved" ? "success" : selected.status === "Reviewing" ? "warning" : "info"}>{selected.status}</StatusBadge></div><p className="mt-5 text-sm leading-7 text-slate-300">{selected.message}</p><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Created", selected.created], ["Votes", selected.votes.toString()], ["Assignee", selected.assignee ?? "Unassigned"]].map(([label, value]) => <div key={label} className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-3"><p className="text-[9px] uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 text-xs font-semibold text-white">{value}</p></div>)}</div></div>}
      </Modal>
    </div>
  );
}
