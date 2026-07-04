"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, MoreHorizontal, Trash2, Pencil, Download, ChevronLeft, ChevronRight, Inbox,
} from "lucide-react";
import { htmlToText } from "@/components/shared/text";
import { Criterion, CriterionEvidence } from "@/types/new/evidence-panel";
import { AdminOnly } from "@/app/context/role";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { exportEvidence } from "./handler";
import EvidenceEditDialog from "./dialogue";

const SIZES = [20, 30, 50];
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

const cell = (v: unknown) => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return htmlToText(String(v)) || "—";
};

interface Props {
  criterion: Criterion;
  rows: CriterionEvidence[];
  loading?: boolean;
  onDelete: (ids: string[]) => void;
  onEdited?: () => void;
  resolveTarget?: (row: CriterionEvidence) => { reference: string; name: string; kind: string } | null;
}

export default function EvidenceTable({ criterion, rows, loading, resolveTarget, onDelete, onEdited }: Props) {
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<CriterionEvidence[] | null>(null);
  const [toEdit, setToEdit] = useState<CriterionEvidence | null>(null);

  const cols = criterion.headers ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const t = resolveTarget?.(r);
      return (
        (t?.reference ?? "").toLowerCase().includes(q) ||
        (t?.name ?? "").toLowerCase().includes(q) ||
        JSON.stringify(r.data ?? {}).toLowerCase().includes(q)
      );
    });
  }, [rows, search, resolveTarget]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * size, safePage * size);

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
          <AdminOnly silent>
            <Button variant="outline" size="sm" onClick={doExport} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          </AdminOnly>
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
              {cols.map((c) => <th key={c.key} className={`${TH} min-w-40`}>{c.label}</th>)}
         
              <th className={`${TH} w-16 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6 + cols.length} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={6 + cols.length} className="py-16 text-center">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No evidence yet. Upload a file to get started.</p>
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
                    <td key={c.key} className={`${TD} text-xs text-slate-600`}>
                      <p className="line-clamp-2 max-w-60">{cell((r.data as any)?.[c.key])}</p>
                    </td>
                  ))}
               
                  <td className={`${TD} text-right`}>
                    <AdminOnly silent>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setToEdit(r)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setToDelete([r])}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </AdminOnly>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > size && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {(safePage - 1) * size + 1}–{Math.min(safePage * size, filtered.length)} of {filtered.length}
          </span>
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

      <EvidenceEditDialog
        open={!!toEdit}
        onOpenChange={(v) => !v && setToEdit(null)}
        criterion={criterion}
        row={toEdit}
        targetLabel={toEdit ? resolveTarget?.(toEdit)?.reference : undefined}
        onSaved={() => { setToEdit(null); onEdited?.(); }}
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