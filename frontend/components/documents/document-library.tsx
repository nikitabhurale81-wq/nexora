"use client";

import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  SearchX,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import {
  MetricTile,
  NeonSurface,
  PageIntro,
  Pill,
  SearchBox,
  SurfaceHeader,
  WorkspacePage,
  iconButton,
  primaryButton,
  secondaryButton,
} from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api/client";

// ---- Types ----------------------------------------------------------------
type DocStatus = "Ready" | "Processing" | "Failed";
type DocItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  pages: number;
  status: DocStatus;
  updated: string;
  progress?: number;
};

const fileIcon: Record<string, typeof FileText> = {
  PDF: FileText,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
  CSV: FileSpreadsheet,
  TXT: File,
};

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ---- API helpers ----------------------------------------------------------
interface BackendDoc {
  id: string;
  name: string;          // backend uses 'name' not 'filename'
  file_type: string;     // backend uses 'file_type' not 'mime_type'
  size_bytes: number;
  status: string;
  page_count: number | null;
  created_at: string;
  error?: string | null;
}

function toDocItem(doc: BackendDoc): DocItem {
  // file_type could be "application/pdf" or "PDF" — extract extension
  const fileType = doc.file_type ?? "";
  const ext = fileType.includes("/")
    ? fileType.split("/").pop()?.toUpperCase().replace("VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT", "DOCX").replace("VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET", "XLSX") ?? "FILE"
    : fileType.toUpperCase() || (doc.name?.split(".").pop()?.toUpperCase() ?? "FILE");

  const statusMap: Record<string, DocStatus> = {
    ready: "Ready",
    processing: "Processing",
    failed: "Failed",
    indexed: "Ready",
    pending: "Processing",
    uploaded: "Processing",
    completed: "Ready",   // ← backend uses 'completed' not 'ready'
  };

  return {
    id: doc.id,
    name: doc.name ?? "Unknown",
    type: ext,
    size: formatSize(doc.size_bytes ?? 0),
    pages: doc.page_count ?? 1,
    status: statusMap[doc.status?.toLowerCase()] ?? "Processing",
    updated: timeAgo(doc.created_at),
  };
}

// ---- Component ------------------------------------------------------------
export function DocumentLibrary() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<DocItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load documents from backend
  const loadDocuments = useCallback(async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: BackendDoc[] }>("/documents");
      if (res.success) {
        setDocuments(res.data.map(toDocItem));
      }
    } catch {
      // If backend not available, show empty state
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Poll processing documents
  useEffect(() => {
    const processing = documents.filter((d) => d.status === "Processing");
    if (!processing.length) return;
    const timer = setInterval(async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: BackendDoc[] }>("/documents");
        if (res.success) {
          const updated = res.data.map(toDocItem);
          setDocuments(updated);
          const stillProcessing = updated.filter((d) => d.status === "Processing");
          if (!stillProcessing.length) clearInterval(timer);
        }
      } catch { clearInterval(timer); }
    }, 3000);
    return () => clearInterval(timer);
  }, [documents]);

  const visible = useMemo(
    () =>
      documents.filter((doc) => {
        const matchesQuery = doc.name.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
          filter === "All" || doc.status === filter || doc.type === filter;
        return matchesQuery && matchesFilter;
      }),
    [documents, filter, query]
  );

  // Upload files to backend
  async function ingest(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}`;
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
      setDocuments((prev) => [
        { id: tempId, name: file.name, type: ext, size: formatSize(file.size), pages: 1, status: "Processing", updated: "Just now" },
        ...prev,
      ]);
      try {
        const form = new FormData();
        form.append("file", file, file.name);

        // Get token — check nexora_token first, then Supabase session
        let token: string | null = null;
        if (typeof window !== "undefined") {
          token = window.localStorage.getItem("nexora_token");
          if (!token) {
            for (let i = 0; i < window.localStorage.length; i++) {
              const key = window.localStorage.key(i);
              if (key?.startsWith("sb-") && key?.endsWith("-auth-token")) {
                try {
                  const parsed = JSON.parse(window.localStorage.getItem(key) ?? "{}");
                  token = parsed?.access_token ?? null;
                  if (token) break;
                } catch { /* ignore */ }
              }
            }
          }
        }

        if (!token) {
          toast.error("Please sign in to upload documents.");
          setDocuments((prev) => prev.filter((d) => d.id !== tempId));
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
        const res = await fetch(`${baseUrl}/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? `Upload failed (${res.status})`);
        }

        const data = await res.json();
        if (data.success) {
          setDocuments((prev) =>
            prev.map((d) => (d.id === tempId ? toDocItem(data.data) : d))
          );
          toast.success(`${file.name} uploaded!`);
        }
      } catch (err: unknown) {
        setDocuments((prev) =>
          prev.map((d) => d.id === tempId ? { ...d, status: "Failed" as DocStatus } : d)
        );
        toast.error((err as { message?: string })?.message ?? "Upload failed");
      }
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) ingest(event.dataTransfer.files);
  }

  // Download from backend
  async function download(doc: DocItem) {
    try {
      const res = await apiRequest<{ success: boolean; data: { url: string } }>(
        `/documents/${doc.id}/download`
      );
      if (res.success && res.data.url) {
        window.open(res.data.url, "_blank");
      }
    } catch {
      toast.error("Download failed");
    }
  }

  // Preview document
  async function openPreview(doc: DocItem) {
    setPreview(doc);
    setPreviewContent("Loading preview...");
    try {
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = window.localStorage.getItem("nexora_token");
        if (!token) {
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key?.startsWith("sb-") && key?.endsWith("-auth-token")) {
              try {
                const parsed = JSON.parse(window.localStorage.getItem(key) ?? "{}");
                token = parsed?.access_token ?? null;
                if (token) break;
              } catch { /* ignore */ }
            }
          }
        }
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/documents/${doc.id}/preview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPreviewContent(data.data.text || "No text content found.");
      } else {
        setPreviewContent("Preview not available.");
      }
    } catch {
      setPreviewContent("Failed to load preview.");
    }
  }

  // Delete document
  async function remove() {
    if (!pendingDelete) return;
    try {
      await apiRequest(`/documents/${pendingDelete.id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== pendingDelete.id));
      toast.success("Document deleted");
    } catch {
      toast.error("Delete failed");
    }
    setPendingDelete(null);
  }

  const readyCount = documents.filter((d) => d.status === "Ready").length;
  const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);
  const totalSize = documents.reduce((sum) => sum, 0);

  return (
    <WorkspacePage>
      <PageIntro
        eyebrow="Document intelligence"
        title="Document Library"
        description="Upload, process, preview, search, and organize your source files."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.xlsx"
              className="hidden"
              onChange={(e) => e.target.files && ingest(e.target.files)}
            />
            <button onClick={() => fileRef.current?.click()} className={primaryButton}>
              <UploadCloud className="h-4 w-4" /> Upload Documents
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="All Documents" value={String(documents.length)} detail="Uploaded files" icon={FolderOpen} tone="blue" />
        <MetricTile label="Ready for Chat" value={String(readyCount)} detail="Indexed & ready" icon={CheckCircle2} tone="emerald" />
        <MetricTile label="Total Pages" value={String(totalPages)} detail="Across workspace" icon={FileText} tone="violet" />
        <MetricTile label="Storage" value={formatSize(totalSize)} detail="Used" icon={FileSpreadsheet} tone="cyan" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <NeonSurface className="p-4">
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
              "grid min-h-[245px] cursor-pointer place-items-center rounded-2xl border border-dashed p-6 text-center transition-colors",
              dragging ? "border-cyan-300 bg-cyan-400/10" : "border-blue-400/40 bg-blue-500/5 hover:bg-blue-500/10"
            )}
            onClick={() => fileRef.current?.click()}
          >
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/30 bg-[linear-gradient(145deg,rgba(37,99,235,.28),rgba(124,58,237,.25))] text-cyan-300 shadow-[0_0_25px_rgba(37,99,235,.16)]">
                <UploadCloud className="h-8 w-8" />
              </span>
              <h2 className="mt-4 text-[14px] font-bold text-white">Drag & drop files here</h2>
              <p className="mt-1 text-[11px] text-slate-500">or click to browse your device</p>
              <p className="mt-4 text-[9px] uppercase tracking-wider text-slate-600">PDF · DOCX · TXT · CSV · XLSX</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#1b3775]/60 bg-[#07142e] p-3">
            <p className="text-[11px] font-semibold text-white">Processing pipeline</p>
            <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500">
              <span>Extract → Chunk → Index</span>
              <span className="text-emerald-400">Backend connected</span>
            </div>
          </div>
        </NeonSurface>

        <NeonSurface className="min-w-0 overflow-hidden">
          <SurfaceHeader
            title="Your Documents"
            description={`${visible.length} documents`}
            action={<SearchBox value={query} onChange={setQuery} placeholder="Search files..." className="hidden w-64 md:block" />}
          />
          <div className="border-b border-[#18316b]/55 p-3">
            <div className="flex flex-wrap gap-2">
              {["All", "Ready", "Processing", "Failed", "PDF", "DOCX", "XLSX"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold",
                    filter === v ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-300" : "border-[#203d7a]/55 text-slate-500 hover:text-white"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <SearchBox value={query} onChange={setQuery} placeholder="Search files..." className="mt-3 md:hidden" />
          </div>

          <div className="divide-y divide-[#17306a]/45">
            {loading && (
              <div className="grid min-h-56 place-items-center">
                <p className="text-[12px] text-slate-400">Loading documents...</p>
              </div>
            )}
            {!loading && visible.map((doc) => {
              const FileIcon = fileIcon[doc.type] ?? File;
              return (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-500/5 sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/12 text-blue-300">
                    <FileIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[12px] font-semibold text-white">{doc.name}</p>
                      <Pill tone={doc.status === "Ready" ? "green" : doc.status === "Failed" ? "red" : "amber"}>
                        {doc.status}
                      </Pill>
                    </div>
                    <p className="mt-1 text-[9px] text-slate-500">{doc.type} · {doc.size} · {doc.pages} pages · {doc.updated}</p>
                    {doc.status === "Processing" && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full animate-pulse rounded-full bg-[linear-gradient(90deg,#06b6d4,#6366f1)]" style={{ width: "60%" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => openPreview(doc)} className={iconButton} aria-label="Preview"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => download(doc)} className={`${iconButton} hidden sm:grid`} aria-label="Download"><Download className="h-4 w-4" /></button>
                    <button onClick={() => setPendingDelete(doc)} className={`${iconButton} hover:text-rose-300`} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
            {!loading && !visible.length && (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <SearchX className="mx-auto h-9 w-9 text-slate-600" />
                  <p className="mt-2 text-[12px] text-slate-400">
                    {documents.length === 0 ? "No documents yet — upload your first file!" : "No documents match your filter"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </NeonSurface>
      </div>

      {/* Preview Modal */}
      <Modal
        open={Boolean(preview)}
        onClose={() => { setPreview(null); setPreviewContent(""); }}
        title={preview?.name ?? "Document preview"}
        description={`${preview?.type} · ${preview?.size} · ${preview?.pages} pages`}
        className="max-w-3xl"
      >
        <div className="rounded-xl border border-[#203d7a]/60 bg-white p-6 text-slate-800 max-h-[400px] overflow-y-auto">
          <p className="text-sm leading-7 whitespace-pre-wrap">{previewContent}</p>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete document?"
        description="This will permanently delete the document from your workspace."
      >
        <p className="text-[13px] text-slate-300">
          Delete <strong>{pendingDelete?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setPendingDelete(null)} className={secondaryButton}>Cancel</button>
          <button onClick={remove} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500 px-4 text-xs font-bold text-white">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </Modal>
    </WorkspacePage>
  );
}
