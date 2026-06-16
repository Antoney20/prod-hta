"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Sparkles, Loader2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { AgenticEvidence, AgenticFilterState, PageSize } from "@/types/new/agentic";
import { generateAllAgenticEvidence, getAgenticEvidence } from "@/app/api/new/agentic";
import { AgenticOutputTable, downloadEvidenceCsv } from "./table";
import { AgenticFilterBar } from "./filter";

const DEFAULT_FILTERS: AgenticFilterState = {
  search: "",
  kind: "all",
  flaggedOnly: false,
};

export default function AgenticWorkflowPage() {
  const [rows, setRows] = useState<AgenticEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filters, setFilters] = useState<AgenticFilterState>(DEFAULT_FILTERS);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const data = await getAgenticEvidence();
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerateAll = async () => {
    setGenerating(true);
    const res = await generateAllAgenticEvidence();
    setGenerating(false);
    setConfirmOpen(false);
    if (!res.ok || !res.summary) {
      toast.error(res.error ?? "Generation failed.");
      return;
    }
    const s = res.summary;
    toast.success(
      `Generated ${s.generated}` + (s.failed.length ? `, ${s.failed.length} failed.` : "."),
    );
    setPage(1);
    load();
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.kind !== "all" && r.proposal_kind !== filters.kind) return false;
      if (filters.flaggedOnly && (r.flags?.length ?? 0) === 0) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!r.intervention_ref?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Agentic evidence</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Generate clean, reproducible evidence variables across all extractions, then
            review what was kept, dropped, and flagged for the panel.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => downloadEvidenceCsv(filtered)}
            disabled={!filtered.length}
            className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[#27aae1] hover:text-[#27aae1] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>

          {/* Start generation -> confirm dialog (no IDs to enter) */}
          <AlertDialog
            open={confirmOpen}
            onOpenChange={(o) => {
              if (!generating) setConfirmOpen(o);
            }}
          >
            <AlertDialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded bg-[#27aae1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d8fc3]">
                <Sparkles className="h-4 w-4" />
                Start generation
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate evidence for all extractions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This runs the agentic workflow across every extraction record, one worker
                  per intervention. This may take a while.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={generating}>Cancel</AlertDialogCancel>
                <button
                  onClick={handleGenerateAll}
                  disabled={generating}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded bg-[#27aae1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d8fc3] disabled:opacity-60"
                >
                  {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {generating ? "Generating…" : "Confirm & proceed"}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AgenticFilterBar
        filters={filters}
        onFiltersChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        pageSize={pageSize}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        totalResults={filtered.length}
        totalAll={rows.length}
      />

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <>
          <AgenticOutputTable rows={paged} allRows={filtered} page={page} pageSize={pageSize} />

          {filtered.length > pageSize && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-slate-300 px-3 py-1 text-slate-600 transition-colors hover:border-[#27aae1] hover:text-[#27aae1] disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border border-slate-300 px-3 py-1 text-slate-600 transition-colors hover:border-[#27aae1] hover:text-[#27aae1] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}