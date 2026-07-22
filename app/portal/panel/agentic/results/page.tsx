"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table2, Loader2, Search, RefreshCw, Download, Trash2, ChevronLeft, ChevronRight, X, CheckCircle2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cn } from "@/lib/utils";

import { AdminOnly } from "@/app/context/role";
import { AgenticResultRow, AppraisalScoreResult } from "@/types/new/agentic-results";
import {
  bulkDelete, deleteAppraisal, listAgenticResults, selectAppraisal, bulkSelect,
  commentAppraisal,
  clearComment,
} from "@/app/api/new/panel/results";
import { deriveColumns } from "../_shared/cols";
import { exportResults } from "../_shared/export";
import ResultsTable from "./table";
import ScoreDialog from "./dialogue";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";

const BRAND = "#27aae1";
const PER_PAGE = [20, 30, 50, 100] as const;
const ALL = "__all__";

function CommentDialog({
  open, label, initial, onClose, onSave, onClear,
}: {
  open: boolean; label: string; initial: string;
  onClose: () => void; onSave: (text: string) => void; onClear: () => void;
}) {
  const [text, setText] = useState(initial);
  useEffect(() => { setText(initial); }, [initial, open]);
  if (!open) return null;
  const trimmed = text.trim();
  const hasExisting = initial.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-[120vw] rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-slate-800">Comment</h3>
        <p className="mb-3 mt-0.5 truncate text-xs text-slate-500">{label}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
          placeholder="Overall notes, or comments from the panel about this intervention..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-400" />
        <div className="mt-4 flex items-center justify-between gap-2">
          {hasExisting ? (
            <AdminOnly silent>
              <button onClick={onClear}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                Clear comment
              </button>
            </AdminOnly>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={() => onSave(trimmed)} disabled={!trimmed}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: BRAND }}>
              Save comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppraisalResultsPage() {
  const [rows, setRows] = useState<AgenticResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pkg, setPkg] = useState(ALL);
  const [phase, setPhase] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [perPage, setPerPage] = useState<number>(20);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set()); // by latest_appraisal_id
  const [activeScore, setActiveScore] = useState<AppraisalScoreResult | null>(null);
  const [rowToDelete, setRowToDelete] = useState<AgenticResultRow | null>(null);
  const [toDelete, setToDelete] = useState<{ id: string; label: string } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState<{ id: string; label: string; current: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listAgenticResults()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const packages = useMemo(() => [...new Set(rows.map((r) => r.package).filter(Boolean) as string[])].sort(), [rows]);
  const phases = useMemo(() => [...new Set(rows.map((r) => r.phase).filter(Boolean) as string[])].sort(), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (pkg !== ALL && (r.package ?? "") !== pkg) return false;
      if (phase !== ALL && (r.phase ?? "") !== phase) return false;
      if (kind !== ALL && r.target_type !== kind) return false;
      if (q) {
        const hit = (r.name?.toLowerCase().includes(q) ?? false) ||
                    (r.reference_number?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [rows, search, pkg, phase, kind]);

  useEffect(() => { setPage(1); }, [search, pkg, phase, kind, perPage]);

  const columns = useMemo(() => deriveColumns(rows), [rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.latest_appraisal_id));
  const someSelected = filtered.some((r) => selected.has(r.latest_appraisal_id));

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allSelected) filtered.forEach((r) => n.delete(r.latest_appraisal_id));
      else filtered.forEach((r) => n.add(r.latest_appraisal_id));
      return n;
    });

  const onSaved = (updated: AppraisalScoreResult) =>
    setRows((rs) => rs.map((r) => {
      const ap = r.appraisals[0];
      if (!ap || !ap.scores.some((s) => s.id === updated.id)) return r;
      return { ...r, appraisals: [{ ...ap, scores: ap.scores.map((s) => s.id === updated.id ? updated : s) }, ...r.appraisals.slice(1)] };
    }));

  // Select a specific run (latest or a branch) — one per target, backend clears siblings.
  const onSelectRun = async (appraisalId: string, selectedFlag: boolean) => {
    const res = await selectAppraisal(appraisalId, { selected: selectedFlag });
    if (!res.ok) { toast.error(res.error ?? "Selection failed."); return; }
    toast.success(selectedFlag ? "Selected for weighting." : "Deselected.");
    load(); // reload: unsetting a sibling can change another row
  };

  const confirmBulkSelect = async () => {
    const ids = [...selected];
    const res = await bulkSelect({ appraisal_ids: ids });
    if (!res.ok) { toast.error(res.error ?? "Bulk select failed."); return; }
    toast.success(`Marked ${res.data?.count ?? ids.length} as selected.`);
    setSelected(new Set());
    load();
  };

  const openComment = (id: string, label: string, current: string) =>
    setCommentTarget({ id, label, current });
const saveComment = async (text: string) => {
    if (!commentTarget) return;
    const res = await commentAppraisal(commentTarget.id, text);
    if (!res.ok) { toast.error(res.error ?? "Failed to save comment."); return; }
    toast.success("Comment saved.");
    setCommentTarget(null);
    load();
  };

  const clearCommentFor = async () => {
    if (!commentTarget) return;
    const res = await clearComment(commentTarget.id);
    if (!res.ok) { toast.error(res.error ?? "Failed to clear comment."); return; }
    toast.success("Comment cleared.");
    setCommentTarget(null);
    load();
  };

  const confirmDeleteRow = async () => {
    if (!rowToDelete) return;
    const res = await deleteAppraisal(rowToDelete.latest_appraisal_id);
    if (!res.ok) { toast.error(res.error ?? "Delete failed."); return; }
    toast.success("Appraisal deleted.");
    setRowToDelete(null);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const res = await deleteAppraisal(toDelete.id);
    if (!res.ok) { toast.error(res.error ?? "Delete failed."); return; }
    toast.success("Appraisal deleted.");
    setToDelete(null);
    load();
  };

  const confirmBulk = async () => {
    const ids = [...selected];
    const res = await bulkDelete({ appraisal_ids: ids });
    if (!res.ok) { toast.error(res.error ?? "Bulk delete failed."); return; }
    toast.success(`Deleted ${res.data?.appraisals?.deleted ?? ids.length} appraisal(s).`);
    setSelected(new Set());
    setBulkOpen(false);
    load();
  };

  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Table2 className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Appraisal Results</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Scored results per proposal across all criteria. Select one run per proposal to feed weighting.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminOnly silent>
            <button onClick={() => exportResults(filtered, columns)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-4 w-4" /> Export Excel
            </button>
          </AdminOnly>
          <button onClick={load} disabled={loading}
            className="rounded-lg border border-slate-200 p-2 disabled:opacity-50">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Keyword or reference #"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Package</label>
            <select value={pkg} onChange={(e) => setPkg(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400">
              <option value={ALL}>All packages</option>
              {packages.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phase</label>
            <select value={phase} onChange={(e) => setPhase(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400">
              <option value={ALL}>All phases</option>
              {phases.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400">
              <option value={ALL}>All types</option>
              <option value="intervention">Intervention</option>
              <option value="national_proposal">National programme</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Results per page</span>
          <div className="flex items-center gap-1">
            {PER_PAGE.map((n) => {
              const active = perPage === n;
              return (
                <button key={n} onClick={() => setPerPage(n)}
                  className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    active ? "border-transparent text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  style={active ? { background: BRAND } : undefined}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">
          <strong className="text-slate-700">{filtered.length}</strong> result{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          {rows.length === 0 ? "No appraisal results yet — run an appraisal first." : "No matches for these filters."}
        </div>
      ) : (
        <>
          <ResultsTable
            rows={pageRows}
            columns={columns}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            allSelected={allSelected}
            someSelected={someSelected}
            onOpenScore={setActiveScore}
            onDeleteAppraisal={(id, label) => setToDelete({ id, label })}
            onSelectRun={onSelectRun}
            onComment={openComment}
            canDelete
          />

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
            <span>Showing <strong className="text-slate-700">{from}–{to}</strong> of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sticky bulk bar (admins) */}
      {selected.size > 0 && (
        <AdminOnly silent>
          <div className="sticky bottom-4 z-20">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-slate-800">{selected.size}</span>
                <span className="text-slate-500">selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())}
                  className="p-2 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                <button onClick={confirmBulkSelect}
                  className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                  style={{ background: BRAND }}>
                  <CheckCircle2 className="h-4 w-4" /> Mark {selected.size} selected
                </button>
                <button onClick={() => setBulkOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">
                  <Trash2 className="h-4 w-4" /> Delete {selected.size}
                </button>
              </div>
            </div>
          </div>
        </AdminOnly>
      )}

      <ScoreDialog
        score={activeScore}
        onClose={() => setActiveScore(null)}
        onSaved={onSaved}
        canEdit
      />

      <CommentDialog
        open={!!commentTarget}
        label={commentTarget?.label ?? ""}
        initial={commentTarget?.current ?? ""}
        onClose={() => setCommentTarget(null)}
        onSave={saveComment}
        onClear={clearCommentFor}
      />

      {rowToDelete && (
        <DeleteDialog
          open={!!rowToDelete}
          onOpenChange={(v) => { if (!v) setRowToDelete(null); }}
          confirmWord="DELETE"
          title="Delete this appraisal?"
          description={`This permanently removes the latest run for “${rowToDelete.name}” and all its criterion scores. This cannot be undone.`}
          onConfirm={confirmDeleteRow}
        />
      )}

      {bulkOpen && (
        <DeleteDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          confirmWord="DELETE"
          title={`Delete ${selected.size} appraisal(s)?`}
          description={`This permanently removes ${selected.size} appraisal run(s) and all their criterion scores. This cannot be undone.`}
          onConfirm={confirmBulk}
        />
      )}

      {toDelete && (
        <DeleteDialog
          open={!!toDelete}
          onOpenChange={(v) => { if (!v) setToDelete(null); }}
          confirmWord="DELETE"
          title="Delete this appraisal run?"
          description={`This permanently removes the run for “${toDelete.label}” and all its criterion scores. This cannot be undone.`}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}