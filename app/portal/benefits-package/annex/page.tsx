"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw, Search, Download, ChevronDown, ChevronRight,
  ChevronsDownUp, ChevronsUpDown, Trash2, Stethoscope, UploadCloud, X,
} from "lucide-react";
import { toast } from "react-toastify";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { getBenefitPackages, deleteBenefitPackage } from "@/app/api/new/benefits-package";
import type { BenefitPackage, BenefitPackageItem } from "@/types/new/benefits-package";

import { AdminOnly } from "@/app/context/role";
import { downloadAnnexXlsx } from "../downloader";
import { BulkUploadPackages } from "../bulk";

const fmtTariff = (v: unknown): string => {
  if (v == null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && String(v).trim() !== "" ? n.toLocaleString() : String(v);
};

const ITEM_PREF = ["specialty", "intervention", "tariff"];
const labelFor = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());


function itemMatches(it: BenefitPackageItem, q: string): boolean {
  for (const [k, v] of Object.entries(it ?? {})) {
    if (String(v ?? "").toLowerCase().includes(q)) return true;
    if (k === "tariff" && v != null) {
      const grouped = fmtTariff(v).toLowerCase();
      if (grouped.includes(q)) return true;
    }
  }
  return false;
}

interface FilteredPackage {
  pkg: BenefitPackage;
  items: BenefitPackageItem[];
  total: number;      // original item count (for "showing X of Y")
}

function ItemsTable({ items }: { items: BenefitPackageItem[] }) {
  const keys = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) for (const k of Object.keys(it ?? {})) s.add(k);
    return [...ITEM_PREF.filter((k) => s.has(k)), ...[...s].filter((k) => !ITEM_PREF.includes(k)).sort()];
  }, [items]);

  const cell = "border border-slate-200 px-3 py-1.5 align-top";

  if (items.length === 0) {
    return <p className="my-2 px-1 text-xs text-slate-400 italic">No items match your search.</p>;
  }

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border border-slate-200 text-xs text-slate-700">
        <thead>
          <tr className="bg-slate-100 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <th className={`${cell} w-10`}>#</th>
            {keys.map((k) => (
              <th key={k} className={`${cell} ${k === "tariff" ? "text-right" : ""}`}>{labelFor(k)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className={i % 2 ? "bg-slate-50/50" : ""}>
              <td className={`${cell} text-slate-400 font-mono`}>{i + 1}</td>
              {keys.map((k) => (
                <td key={k} className={`${cell} ${k === "tariff" ? "text-right font-medium tabular-nums" : ""}`}>
                  {k === "tariff" ? fmtTariff((it as any)[k]) : ((it as any)[k] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnnexPage() {
  const [packages, setPackages] = useState<BenefitPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BenefitPackage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getBenefitPackages();
    const annex = data.filter((p) => (p.items?.length ?? 0) > 0);
    setPackages(annex);
    setExpanded(new Set(annex.map((p) => p.id)));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const q = search.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo<FilteredPackage[]>(() => {
    if (!searching) {
      return packages.map((p) => ({ pkg: p, items: p.items ?? [], total: p.items?.length ?? 0 }));
    }
    const out: FilteredPackage[] = [];
    for (const p of packages) {
      const total = p.items?.length ?? 0;
      const pkgHit = p.name.toLowerCase().includes(q) || (p.fund ?? "").toLowerCase().includes(q);
      const items = pkgHit ? (p.items ?? []) : (p.items ?? []).filter((it) => itemMatches(it, q));
      if (items.length > 0 || pkgHit) out.push({ pkg: p, items, total });
    }
    return out;
  }, [packages, q, searching]);

  // While searching, matching packages are always expanded so hits are visible.
  const isOpen = (id: string) => (searching ? true : expanded.has(id));

  const allIds = filtered.map((f) => f.pkg.id);
  const allOpen = allIds.length > 0 && allIds.every((id) => isOpen(id));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(allIds));

  // count of matching items shown vs total across all packages
  const shownItems = useMemo(() => filtered.reduce((n, f) => n + f.items.length, 0), [filtered]);
  const totalItems = useMemo(
    () => packages.reduce((n, p) => n + (p.items?.length ?? 0), 0),
    [packages]
  );

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await deleteBenefitPackage(toDelete.id);
    if (res.ok) { toast.success("Annex package deleted."); await load(); }
    else toast.error(res.error ?? "Failed to delete.");
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2">
            <Stethoscope className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Annex - Package reimbursements</h1>
            <p className="text-sm text-muted-foreground">
              Line-item of reimbursement tariffs for each intervention ({totalItems} items)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll} disabled={loading || allIds.length === 0 || searching}>
            {allOpen ? <ChevronsDownUp className="mr-1.5 h-4 w-4" /> : <ChevronsUpDown className="mr-1.5 h-4 w-4" />}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadAnnexXlsx(filtered.map((f) => f.pkg))}
            disabled={loading || totalItems === 0}>
            <Download className="mr-1.5 h-4 w-4" />Export Excel
          </Button>
          <AdminOnly silent>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" />Import annex
            </Button>
          </AdminOnly>
        </div>
      </div>

      {/* Search — filters individual line items */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 pr-9" placeholder="Filter items by specialty, intervention or tariff..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searching && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <strong className="text-slate-700">{shownItems}</strong> of {totalItems} items
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {searching ? "No items match your search." : "No annex packages found."}
        </div>
      ) : (
        <div className="overflow-hidden overflow-x-auto rounded-lg border">
          <table className="w-full">
            <tbody>
              {filtered.map(({ pkg: p, items, total }) => {
                const open = isOpen(p.id);
                return (
                  <Fragment key={p.id}>
                    <tr className="border-b" style={{ backgroundColor: "rgba(39,170,225,0.07)" }}>
                      <td className="w-8 px-3 py-2.5 align-top">
                        <button onClick={() => toggle(p.id)} className="text-slate-400 hover:text-[#27aae1]"
                          aria-label={open ? "Collapse" : "Expand"} disabled={searching}>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggle(p.id)} className="text-sm font-semibold hover:text-[#27aae1]"
                            disabled={searching}>
                            {p.name}
                          </button>
                          {p.fund && <span className="text-xs text-muted-foreground">{p.fund}</span>}
                          <span className="text-xs text-muted-foreground">
                            {searching
                              ? `${items.length} of ${total} item${total !== 1 ? "s" : ""}`
                              : `${total} item${total !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <Button variant="outline" className="h-7 text-xs mr-1"
                          onClick={() => downloadAnnexXlsx([p], `annex-${p.name.toLowerCase().replace(/\s+/g, "-")}.xlsx`)}>
                          <Download className="mr-1 h-3 w-3" />Export
                        </Button>
                        <AdminOnly silent>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive"
                            onClick={() => setToDelete(p)}>
                            <Trash2 className="mr-1 h-3 w-3" />Delete
                          </Button>
                        </AdminOnly>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b bg-slate-50/60">
                        <td />
                        <td colSpan={2} className="px-4 pb-3"><ItemsTable items={items} /></td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BulkUploadPackages open={bulkOpen} onClose={() => setBulkOpen(false)} onDone={load} />
      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete annex package?"
        description={<span><strong>{toDelete?.name}</strong> and its tariff items will be permanently removed.</span>}
        onConfirm={handleDelete}
      />
    </div>
  );
}