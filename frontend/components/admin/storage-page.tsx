"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Database,
  Download,
  File,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { storageBreakdown, storageFiles, type StorageFile } from "./admin-data";
import {
  ActionButton,
  EmptyState,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  SearchField,
  SegmentedControl,
  StatusBadge,
  tooltipStyle,
} from "./admin-ui";

const typeIcons = { Document: FileText, Dataset: Database, Media: ImageIcon, Export: Archive };
const typeTones = { Document: "text-cyan-300 bg-cyan-400/10", Dataset: "text-violet-300 bg-violet-400/10", Media: "text-blue-300 bg-blue-400/10", Export: "text-pink-300 bg-pink-400/10" };

export function StoragePage() {
  const [files, setFiles] = useState(storageFiles);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<StorageFile | null>(null);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => files.filter((file) =>
    (filter === "All" || file.type === filter) && `${file.name} ${file.owner}`.toLowerCase().includes(query.toLowerCase())
  ), [files, filter, query]);

  function addFile(file?: globalThis.File) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    const type: StorageFile["type"] = ["csv", "xlsx", "json"].includes(extension ?? "") ? "Dataset" : ["png", "jpg", "jpeg", "mp4"].includes(extension ?? "") ? "Media" : "Document";
    setFiles((current) => [{ id: Date.now(), name: file.name, type, owner: "Alex Johnson", size: `${Math.max(0.1, file.size / 1024 / 1024).toFixed(1)} MB`, updated: "Just now" }, ...current]);
    if (inputRef.current) inputRef.current.value = "";
    toast.success(`${file.name} added to the local file list.`, { description: "The file was not uploaded to a server." });
  }

  function downloadFile(file: StorageFile) {
    const url = URL.createObjectURL(new Blob([`NEXORA frontend demo placeholder for ${file.name}`], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${file.name}.demo.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Demo placeholder downloaded locally.");
  }

  function removeFile() {
    if (!deleteTarget) return;
    setFiles((current) => current.filter((file) => file.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed from the local table.`);
    setDeleteTarget(null);
  }

  function runCleanup() {
    const exportsCount = files.filter((file) => file.type === "Export").length;
    setFiles((current) => current.filter((file) => file.type !== "Export"));
    setCleanupOpen(false);
    toast.success(`${exportsCount} demo export${exportsCount === 1 ? "" : "s"} removed.`, { description: "No storage service was contacted." });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Data operations"
        title="Storage"
        description="Inspect storage allocation and manage the files represented in this frontend-only admin view."
        actions={<><ActionButton variant="ghost" onClick={() => setCleanupOpen(true)}><Trash2 className="h-4 w-4" /> Clean up</ActionButton><ActionButton onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" /> Add file</ActionButton><input ref={inputRef} type="file" className="hidden" onChange={(event) => addFile(event.target.files?.[0])} /></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Storage used" value="9.8 TB" change="+420 GB" detail="this month" icon={<HardDrive className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Total capacity" value="12 TB" detail="81.7% allocated" icon={<Database className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Stored objects" value="284.6K" change="+6.8%" detail="month over month" icon={<File className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="Largest category" value="Documents" detail="4.2 TB · 35%" icon={<FileText className="h-5 w-5" />} tone="pink" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.4fr)]">
        <Panel>
          <PanelHeader title="Capacity allocation" description="12 TB total capacity" />
          <div className="grid items-center gap-2 p-5 sm:grid-cols-[210px_1fr] xl:grid-cols-1 2xl:grid-cols-[210px_1fr]">
            <div className="relative h-[210px]">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={storageBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={86} paddingAngle={2} stroke="none">{storageBreakdown.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value} TB`} /></PieChart></ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-extrabold text-white">81.7%</p><p className="text-[9px] uppercase tracking-wider text-slate-500">used</p></div></div>
            </div>
            <div className="space-y-3">{storageBreakdown.map((item) => <div key={item.name} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="flex-1 text-[11px] text-slate-400">{item.name}</span><strong className="text-[11px] text-white">{item.value} TB</strong></div>)}</div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex h-full flex-col justify-between gap-6">
            <div><p className="text-sm font-bold text-white">Storage trend</p><p className="mt-1 text-xs text-slate-500">Capacity consumed over the last six months</p></div>
            <div className="flex h-44 items-end gap-3 sm:gap-5">
              {[61, 65, 69, 72, 77, 82].map((value, index) => <div key={value} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="relative flex-1"><div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-[linear-gradient(180deg,#22d3ee,#2563eb_55%,#7c3aed)] shadow-[0_0_18px_rgba(37,99,235,.18)]" style={{ height: `${value}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-500">{value}%</span></div></div><span className="text-center text-[9px] text-slate-600">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span></div>)}
            </div>
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-[11px] leading-5 text-amber-100/70">At the current growth rate, storage will reach 90% capacity in approximately 7 weeks.</div>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-blue-500/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchField value={query} onChange={setQuery} placeholder="Search files or owners..." className="w-full lg:max-w-sm" />
          <SegmentedControl options={["All", "Document", "Dataset", "Media", "Export"]} value={filter} onChange={setFilter} ariaLabel="File type filter" />
        </div>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-blue-500/10 text-[9px] uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-5 py-3">File</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Owner</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Updated</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-blue-500/10">{filtered.map((file) => { const Icon = typeIcons[file.type]; return <tr key={file.id} className="hover:bg-blue-500/5"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${typeTones[file.type]}`}><Icon className="h-4 w-4" /></span><span className="max-w-[260px] truncate text-xs font-semibold text-slate-200">{file.name}</span></div></td><td className="px-5 py-3.5"><StatusBadge tone={file.type === "Dataset" ? "violet" : file.type === "Media" ? "info" : "neutral"}>{file.type}</StatusBadge></td><td className="px-5 py-3.5 text-xs text-slate-400">{file.owner}</td><td className="px-5 py-3.5 text-xs text-slate-400">{file.size}</td><td className="px-5 py-3.5 text-xs text-slate-500">{file.updated}</td><td className="px-5 py-3.5"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => downloadFile(file)} className="grid h-8 w-8 place-items-center rounded-lg border border-blue-500/15 text-slate-500 hover:border-cyan-400/30 hover:text-cyan-300" aria-label={`Download ${file.name}`}><Download className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setDeleteTarget(file)} className="grid h-8 w-8 place-items-center rounded-lg border border-rose-500/10 text-slate-500 hover:border-rose-400/30 hover:text-rose-300" aria-label={`Delete ${file.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>; })}</tbody></table></div> : <EmptyState message="No files match the selected type or search." />}
        <div className="border-t border-blue-500/10 px-5 py-3 text-[10px] text-slate-500">{filtered.length} of {files.length} files shown in the demo dataset</div>
      </Panel>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Remove file from demo?" description={deleteTarget?.name} size="sm" footer={<><ActionButton variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</ActionButton><ActionButton variant="danger" onClick={removeFile}>Remove</ActionButton></>}><p className="text-sm leading-6 text-slate-400">This removes the row from local component state. No real file or storage object will be deleted.</p></Modal>

      <Modal open={cleanupOpen} onClose={() => setCleanupOpen(false)} title="Review storage cleanup" description="Frontend-only cleanup preview" footer={<><ActionButton variant="ghost" onClick={() => setCleanupOpen(false)}>Cancel</ActionButton><ActionButton variant="danger" onClick={runCleanup}>Remove demo exports</ActionButton></>}>
        <div className="space-y-3"><div className="flex items-center justify-between rounded-xl border border-blue-500/10 bg-blue-500/5 p-4"><div><p className="text-xs font-semibold text-white">Generated exports</p><p className="mt-1 text-[10px] text-slate-500">Old reports represented in the current table</p></div><strong className="text-sm text-cyan-300">0.9 TB</strong></div><p className="text-xs leading-5 text-slate-500">Confirming only removes Export rows from this browser session.</p></div>
      </Modal>
    </div>
  );
}
