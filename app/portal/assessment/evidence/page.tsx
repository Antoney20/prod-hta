"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, RefreshCw, FileStack, Search, Eye, Pencil, Trash2,
  FileText, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import { AssessmentEvidence } from "@/types/new/assessment";
import { getAssessmentEvidence, deleteAssessmentEvidence } from "@/app/api/new/assessment";
import { htmlToText } from "@/components/shared/text";
import { useAuth } from "@/app/api/auth";

const BLUE = "#27aae1";
const PAGE_SIZES = [10, 25, 50];
const BASE_PATH = "/portal/assessment/evidence";
const UPLOAD_PATH = `${BASE_PATH}/upload`;

const fmt = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const refsOf = (e: AssessmentEvidence) => [
  ...e.interventions.map((i) => i.reference_number),
  ...e.program_proposals.map((p) => p.reference_number),
];

export default function AssessmentEvidencePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.is_staff;

  const [evidence, setEvidence] = useState<AssessmentEvidence[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [toDelete, setToDelete] = useState<AssessmentEvidence | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setEvidence(await getAssessmentEvidence());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evidence;
    return evidence.filter((e) => {
      const hay = [
        ...refsOf(e),
        ...e.interventions.map((i) => i.intervention_name ?? ""),
        ...e.program_proposals.map((p) => p.title),
        htmlToText(e.summary || ""),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [evidence, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  const open = (id: number | string) => router.push(`${BASE_PATH}/${id}`);

  const handleDelete = async () => {
    if (!toDelete) return;
    const { ok, error } = await deleteAssessmentEvidence(toDelete.id);
    if (ok) {
      toast.success("Evidence deleted.");
      setEvidence((prev) => prev.filter((e) => e.id !== toDelete.id));
    } else {
      toast.error(error ?? "Failed to delete.");
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><FileStack className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Assessment Evidence</h1>
            <p className="text-sm text-muted-foreground">Evidence linked to interventions and national program proposals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="text-white" style={{ backgroundColor: BLUE }} onClick={() => router.push(UPLOAD_PATH)}>
            <Plus className="h-4 w-4 mr-2" />Upload Evidence
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search reference, name, or summary…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="border border-slate-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No evidence found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-2.5 font-semibold">Intervention</th>
                  <th className="px-4 py-2.5 font-semibold">Summary</th>
                  <th className="px-4 py-2.5 font-semibold">Docs</th>
                  <th className="px-4 py-2.5 font-semibold">Created</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((e) => {
                  const refs = refsOf(e);
                  const summaryText = htmlToText(e.summary || "");
                  return (
                    <tr key={e.id} onClick={() => open(e.id)} className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {refs.slice(0, 2).map((r) => (
                            <span key={r} className="font-mono text-xs bg-slate-100 text-[#27aae1] px-1.5 py-0.5 rounded whitespace-nowrap">{r}</span>
                          ))}
                          {refs.length > 2 && <span className="text-xs text-slate-400">+{refs.length - 2}</span>}
                          {refs.length === 0 && <span className="text-xs text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p className="line-clamp-1 max-w-sm">{summaryText || <span className="text-slate-400">No summary</span>}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <FileText className="h-3.5 w-3.5" />{e.documents.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(e.created_at)}</td>
                      <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => open(e.id)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />View
                          </Button>
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => router.push(`${UPLOAD_PATH}?id=${e.id}`)} aria-label="Edit">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" onClick={() => setToDelete(e)} aria-label="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-slate-200 bg-white px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="ml-2">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              This evidence and its {toDelete?.documents.length ?? 0} document(s) will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}