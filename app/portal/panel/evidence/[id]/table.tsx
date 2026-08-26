"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, MoreHorizontal, Trash2, Pencil, Download,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox,
} from "lucide-react";
import { htmlToText } from "@/components/shared/text";
import { Criterion, CriterionEvidence, CriterionHeader } from "@/types/new/evidence-panel";
import { AdminOnly } from "@/app/context/role";
import { useAuth } from "@/app/api/auth";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { exportEvidence } from "./handler";
import { isFormula } from "./formulas";
import EvidenceEditDialog from "./dialogue";
import FormulaDialog from "./formulas-dialogue";


const SIZES = [10,20, 30, 50, 100, 200];
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

const fmtNumber = (v: unknown): string | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: 20 }) : null;
  if (typeof v === "string") {
    const s = v.trim().replace(/,/g, "");
    if (s === "" || !/^-?\d*\.?\d+$/.test(s)) return null;   // only clean numeric strings
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    const dp = s.includes(".") ? s.split(".")[1].length : 0; // preserve the entered precision
    return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  return null;
};

const cell = (v: unknown, header?: CriterionHeader) => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  // number-ish columns get thousands separators; text/notes stay as-is
  if (header && (header.type === "number" || isFormula(header))) {
    const f = fmtNumber(v);
    if (f != null) return f;
  }
  return htmlToText(String(v)) || "—";
};

interface Props {
  criterion: Criterion;
  rows: CriterionEvidence[];
  allCriteria: Criterion[];
  loading?: boolean;
  onDelete: (ids: string[]) => void;
  onEdited?: () => void;
  onCriterionChanged: (c: Criterion) => void;
  resolveTarget?: (row: CriterionEvidence) => { reference: string; name: string; kind: string } | null;
}

export default function EvidenceTable({
  criterion, rows, allCriteria, loading, resolveTarget, onDelete, onEdited, onCriterionChanged,
}: Props) {
  const { user } = useAuth();

  const canEdit = user?.role === "admin" || user?.role === "secretariat" || user?.role === "assessment";
  const canExport = user?.role === "admin" || user?.role === "assessment";

  const [search, setSearch] = useState("");
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<CriterionEvidence[] | null>(null);
  const [toEdit, setToEdit] = useState<CriterionEvidence | null>(null);
  const [toEditHeader, setToEditHeader] = useState<CriterionHeader | null>(null);

  const cols = criterion.headers ?? [];

  // Precompute a lowercase haystack per row from the SAME text we render,
  // so search reflects exactly what's on screen (formatted numbers, target, etc.).
  const searchIndex = useMemo(() => {
    return rows.map((r) => {
      const t = resolveTarget?.(r);
      const parts: string[] = [t?.reference ?? "", t?.name ?? ""];
      for (const c of cols) parts.push(cell((r.data as any)?.[c.key], c));
      return { row: r, hay: parts.join(" \u241f ").toLowerCase() };
    });
  }, [rows, cols, resolveTarget]);

  // Multi-term AND search — every whitespace-separated term must match.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    const terms = q.split(/\s+/);
    return searchIndex.filter((e) => terms.every((t) => e.hay.includes(t))).map((e) => e.row);
  }, [rows, search, searchIndex]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * size, safePage * size);

  // Keep page state in bounds whenever the result set or size shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const allSel = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someSel = selected.size > 0 && !allSel;
  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected(allSel ? new Set() : new Set(filtered.map((r) => r.id)));

  const confirmDelete = () => {
    if (!toDelete?.length) return;
    onDelete(toDelete.map((r) => r.id));
    setSelected(new Set());
    setToDelete(null);
  };

  const doExport = () =>
    exportEvidence(criterion.criteria, criterion.id, cols, filtered, (r) => resolveTarget?.(r) ?? null);

  const selectedRows = filtered.filter((r) => selected.has(r.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search ref, target or data…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {canExport && (
            <Button variant="outline" size="sm" onClick={doExport} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          )}
          <span>Rows</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <AdminOnly silent>
          <div className="flex items-center justify-between border border-[#27aae1]/30 bg-[#27aae1]/5 px-4 py-2 text-sm">
            <span className="font-medium text-slate-700">{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-slate-500" onClick={() => setSelected(new Set())}>Clear</Button>
              <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setToDelete(selectedRows)}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete selected
              </Button>
            </div>
          </div>
        </AdminOnly>
      )}

      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className={`${TH} w-10`}>
                <input type="checkbox" ref={(el) => { if (el) el.indeterminate = someSel; }}
                  checked={allSel} onChange={toggleAll} className="h-4 w-4 accent-[#27aae1] align-middle" />
              </th>
              <th className={`${TH} w-10 text-center`}>#</th>
              <th className={`${TH} min-w-40`}>Reference / Target</th>
              <th className={`${TH} w-24`}>Type</th>
              {cols.map((c) => (
                <th key={c.key} className={`${TH} min-w-40`}>
                  <div className="flex items-center gap-1.5">
                    <span>{c.label}</span>
                    {isFormula(c) && (
                      <span title={`Computed: ${c.formula}`}
                        className="rounded bg-[#27aae1]/10 px-1 font-mono text-[10px] normal-case text-[#27aae1]">
                        ƒ{c.round != null ? ` ${c.round}dp` : ""}
                      </span>
                    )}
                    {canEdit && (
                      <button type="button" onClick={() => setToEditHeader(c)}
                        title="Edit formula / rounding"
                        className="text-slate-300 hover:text-[#27aae1]">
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className={`${TH} w-16 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6 + cols.length} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={6 + cols.length} className="py-16 text-center">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">
                  {search.trim() ? "No rows match your search." : "No evidence yet. Upload a file to get started."}
                </p>
              </td></tr>
            ) : (
              paged.map((r, idx) => (
                <tr key={r.id} className={`transition-colors hover:bg-slate-50/70 ${selected.has(r.id) ? "bg-[#27aae1]/5" : ""}`}>
                  <td className={`${TD} text-center`}>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="h-4 w-4 accent-[#27aae1]" />
                  </td>
                  <td className={`${TD} text-center font-mono text-xs text-slate-400`}>{(safePage - 1) * size + idx + 1}</td>
                  <td className={`${TD}`}>
                    {(() => {
                      const t = resolveTarget?.(r);
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs rounded bg-slate-100 px-2 py-0.5 text-[#27aae1] w-fit">
                            {t?.reference || "—"}
                          </span>
                          {t?.name && <span className="line-clamp-1 text-xs text-slate-500">{t.name}</span>}
                        </div>
                      );
                    })()}
                  </td>
                  <td className={`${TD}`}>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.intervention ? "bg-[#27aae1]/10 text-[#27aae1]" : "bg-amber-50 text-amber-700"
                    }`}>
                      {r.intervention ? "Intervention" : "Program"}
                    </span>
                  </td>
                 {cols.map((c) => (
                    <td key={c.key} className={`${TD} text-xs ${isFormula(c) ? "font-mono text-slate-800" : "text-slate-600"}`}>
                      <p className="line-clamp-2 max-w-60 whitespace-pre-line">{cell((r.data as any)?.[c.key], c)}</p>
                    </td>
                  ))}
                  <td className={`${TD} text-right`}>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setToEdit(r)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AdminOnly silent>
                            <DropdownMenuItem className="text-destructive" onClick={() => setToDelete([r])}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AdminOnly>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-slate-500">
            Showing <strong className="text-slate-700">{(safePage - 1) * size + 1}</strong>–
            <strong className="text-slate-700">{Math.min(safePage * size, filtered.length)}</strong> of{" "}
            <strong className="text-slate-700">{filtered.length}</strong>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EvidenceEditDialog
        open={!!toEdit}
        onOpenChange={(v) => !v && setToEdit(null)}
        criterion={criterion}
        allCriteria={allCriteria}
        row={toEdit}
        targetLabel={toEdit ? resolveTarget?.(toEdit)?.reference : undefined}
        onSaved={() => { setToEdit(null); onEdited?.(); }}
      />

      <FormulaDialog
        open={!!toEditHeader}
        onOpenChange={(v) => !v && setToEditHeader(null)}
        criterion={criterion}
        header={toEditHeader}
        allCriteria={allCriteria}
        onSaved={onCriterionChanged}
        onRecomputed={onEdited}
      />

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} evidence rows?` : "Delete evidence?"}
        description={
          toDelete && toDelete.length > 1 ? (
            <>All <strong>{toDelete.length}</strong> selected evidence rows will be permanently deleted.</>
          ) : (
            <>
              Evidence for{" "}
              <strong>{toDelete?.[0] ? resolveTarget?.(toDelete[0])?.reference ?? "this target" : "this target"}</strong>{" "}
              under <strong>{criterion.criteria}</strong> will be permanently deleted.
            </>
          )
        }
        confirmWord={toDelete && toDelete.length > 1 ? "delete all" : "delete"}
        onConfirm={confirmDelete}
      />
    </div>
  );
}