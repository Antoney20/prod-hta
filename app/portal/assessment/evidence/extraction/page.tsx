"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload, UploadCloud, RefreshCw, Search, MoreHorizontal, Pencil, Trash2,
  ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, Eye,
  Settings2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

import { EvidenceCriterion, EvidenceExtraction, EvidenceExtractionPayload } from "@/types/new/evidence-extraction";

import { htmlToText } from "@/components/shared/text";
import { createEvidenceExtraction, deleteEvidenceExtraction, getEvidenceCriteria, getEvidenceExtractions, updateEvidenceExtraction } from "@/app/api/new/evidence-extraction";
import { ExtractionForm } from "./form";
import { BulkUploadEvidence } from "./bulk";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import Link from "next/link";


const PAGE_SIZE = 10;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";
type Mode = "list" | "create" | "edit";

const countFilled = (e: EvidenceExtraction, c: EvidenceCriterion) =>
  (c.field_schema ?? []).filter((f) => {
    const v = e.data?.[c.code]?.[f.key];
    return v != null && v !== "";
  }).length;

export default function EvidenceExtractionPage() {
  const [criteria, setCriteria] = useState<EvidenceCriterion[]>([]);
  const [rows, setRows] = useState<EvidenceExtraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<EvidenceExtraction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState<EvidenceExtraction | null>(null);
  const [toDelete, setToDelete] = useState<EvidenceExtraction | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const sortedCriteria = useMemo(() => [...criteria].sort((a, b) => a.position - b.position), [criteria]);

  const load = useCallback(async () => {
    setLoading(true);
    const [crit, data] = await Promise.all([getEvidenceCriteria(true), getEvidenceExtractions()]);
    setCriteria(crit); setRows(data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.proposal_reference?.toLowerCase().includes(q) ||
      r.icd_11?.toLowerCase().includes(q) ||
      r.routing_decision?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage]);
  useEffect(() => { setPage(1); }, [search]);

  const handleSubmit = async (payload: EvidenceExtractionPayload) => {
    setSubmitting(true);
    try {
      if (editing) { await updateEvidenceExtraction(editing.id, payload); toast.success("Evidence updated."); }
      else { await createEvidenceExtraction(payload); toast.success("Evidence submitted."); }
      setMode("list"); setEditing(null); await load();
    } catch (e: any) { toast.error(e?.message ?? "Failed to save evidence."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try { await deleteEvidenceExtraction(toDelete.id); toast.success("Deleted."); await load(); }
    catch (e: any) { toast.error(e?.message ?? "Failed to delete."); }
    setToDelete(null);
  };

  if (mode !== "list") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { setMode("list"); setEditing(null); }}
            className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{mode === "edit" ? "Edit evidence extraction" : "New evidence extraction"}</h1>
            <p className="text-sm text-muted-foreground">{mode === "edit" ? editing?.proposal_reference : "Link an intervention, then fill in by criteria."}</p>
          </div>
        </div>
        <ExtractionForm criteria={sortedCriteria} defaultValues={editing} isSubmitting={submitting}
          onSubmit={handleSubmit} onCancel={() => { setMode("list"); setEditing(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">





<div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <div className="bg-[#27aae1]/10 p-2 rounded-lg"><ClipboardList className="h-5 w-5 text-[#27aae1]" /></div>
    <div>
      <h1 className="text-xl font-bold">Evidence extraction</h1>
      <p className="text-sm text-muted-foreground">
        {filtered.length} extraction{filtered.length !== 1 ? "s" : ""} · {sortedCriteria.length} criteria
      </p>
      {!loading && sortedCriteria.length === 0 && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          No template configured — set up the template config correctly first.
        </p>
      )}
    </div>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" size="icon" onClick={load} disabled={loading}>
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    </Button>
    <Link href="/portal/assessment/evidence/setup">
      <Button
        variant="outline"
        className={sortedCriteria.length === 0 ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
      >
        <Settings2 className="h-4 w-4 mr-2" /> Template config
      </Button>
    </Link>
    <Button variant="outline" onClick={() => setBulkOpen(true)} disabled={sortedCriteria.length === 0}>
      <UploadCloud className="h-4 w-4 mr-2" /> Bulk import
    </Button>
    <Button
      onClick={() => { setEditing(null); setMode("create"); }}
      disabled={sortedCriteria.length === 0}
      style={{ backgroundColor: "#27aae1" }}
      className="text-white"
    >
      <Upload className="h-4 w-4 mr-2" /> New extraction
    </Button>
  </div>
</div>



      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search ref, ICD-11 or routing…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`${TH} w-10 text-center`}>#</th>
              <th className={`${TH} w-120`}>Reference</th>
              <th className={`${TH} w-28`}>ICD-11</th>
              <th className={`${TH} min-w-48`}>Routing</th>
              {sortedCriteria.map((c) => <th key={c.code} className={`${TH} w-28 text-center`} title={c.name}>{c.name}</th>)}
              <th className={`${TH} w-16 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5 + sortedCriteria.length} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={5 + sortedCriteria.length} className="py-16 text-center text-slate-400 text-sm">No evidence extractions yet.</td></tr>
            ) : paged.map((e, idx) => (
              <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                <td className={TD}>
                  <button onClick={() => setViewing(e)} className="font-mono min-w-[250px] text-xs bg-slate-100 text-[#27aae1] px-2 py-1 rounded hover:underline">
                    {e.proposal_reference ?? "—"}
                  </button>
                </td>
                <td className={`${TD} text-xs text-slate-600`}>{e.icd_11 || "—"}</td>
                <td className={`${TD} text-xs text-slate-600`}><p className="line-clamp-2 max-w-60">{e.routing_decision ? htmlToText(e.routing_decision) : "—"}</p></td>
                {sortedCriteria.map((c) => {
                  const n = countFilled(e, c), total = (c.field_schema ?? []).length;
                  return (
                    <td key={c.code} className={`${TD} text-center text-xs`}>
                      {n > 0
                        ? <span className="inline-block rounded bg-[#27aae1]/10 px-2 py-0.5 font-medium text-[#27aae1]">{n}/{total}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                  );
                })}
                <td className={`${TD} text-right`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewing(e)}><Eye className="h-4 w-4 mr-2" /> View details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setEditing(e); setMode("edit"); }}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(e)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* view details (read-only) */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-mono text-sm text-[#27aae1]">{viewing?.proposal_reference ?? "Evidence"}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Detail label="ICD-11" value={viewing.icd_11} />
                <Detail label="Routing / Decision" value={viewing.routing_decision} wide />
                <Detail label="Definition of disease" value={viewing.disease_definition} wide />
              </div>
              {sortedCriteria.map((c) => {
                const vals = (c.field_schema ?? []).filter((f) => viewing.data?.[c.code]?.[f.key]);
                if (!vals.length) return null;
                return (
                  <div key={c.code} className="border border-slate-200">
                    <p className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{c.name}</p>
                    <dl className="divide-y divide-slate-100">
                      {vals.map((f) => (
                        <div key={f.key} className="grid grid-cols-3 gap-2 px-3 py-2">
                          <dt className="text-xs text-slate-500">{f.label}</dt>
                          <dd className="col-span-2 text-slate-700">{String(viewing.data[c.code][f.key])}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BulkUploadEvidence open={bulkOpen} onClose={() => setBulkOpen(false)} criteria={sortedCriteria} onComplete={load} />

      <DeleteDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} title="Delete evidence extraction?"
        description={<><strong>{toDelete?.proposal_reference}</strong> will be permanently deleted.</>} onConfirm={handleDelete} />
    </div>
  );
}

function Detail({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-700">{value || "—"}</p>
    </div>
  );
}