"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw, Trash2, Search, ClipboardList, UploadCloud, Download,
  ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown,
} from "lucide-react";
import { toast } from "react-toastify";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { AdminOnly } from "@/app/context/role";
import {
  listReports, getReport, createReport, updateReport,
} from "@/app/api/new/panel/appraisal-report";
import {
  deriveColumns, downloadReport, hasVal, labelFor, submit,
} from "./handler";
import { BulkImportAppraised } from "./bulk";
import type {
  AppraisalColumn, AppraisalRow, ImportMode,
} from "@/types/panel/appraisal-report";

type Row = AppraisalRow & { _key: string };

const rid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const keyed = (rows: AppraisalRow[]): Row[] =>
  rows.map((r) => ({ ...r, _key: (r as any)._key ?? rid() }));
const strip = (rows: Row[]): AppraisalRow[] => rows.map(({ _key, ...r }) => r);

const IDENTITY = new Set(["_key", "intervention", "ref", "package"]);

const COL_W: Record<string, { min: number; max: number }> = {
  service:        { min: 180, max: 280 },
  score:          { min: 80,  max: 110 },
  recommendation: { min: 140, max: 200 },
  decision:       { min: 96,  max: 120 },
  rationale:      { min: 240, max: 380 },
  conditions:     { min: 200, max: 320 },
};
const colStyle = (key: string) => {
  const w = COL_W[key] ?? { min: 150, max: 220 };
  return { minWidth: w.min, maxWidth: w.max };
};

function RowDetail({ t }: { t: Row }) {
  const fields = Object.keys(t).filter((k) => !IDENTITY.has(k) && hasVal(t[k]));
  return (
    <div className="my-2 space-y-2 text-xs text-slate-700">
      {fields.map((k) => (
        <div key={k}>
          <p className="font-medium text-slate-700">{labelFor(k)}</p>
          <p className="whitespace-pre-line text-slate-600">{String(t[k])}</p>
        </div>
      ))}
    </div>
  );
}

export default function AppraisalReportPage() {
  const [activeId, setActiveId] = useState("");
  const [name, setName] = useState("Appraised Interventions & Services");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const apply = (full: { id: string; name: string; items?: AppraisalRow[] }) => {
    setActiveId(full.id);
    setName(full.name || "Appraised Interventions & Services");
    setItems(keyed(full.items || []));
  };

  const load = useCallback(async () => {
    setLoading(true);
    const ls = await listReports();
    if (ls.length) {
      const full = await getReport(ls[0].id);
      if (full) apply(full);
    } else {
      const { id } = await createReport({
        name: "Appraised Interventions & Services", data: {}, items: [],
      });
      const full = await getReport(id);
      if (full) apply(full);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      [t.ref, t.intervention, t.package, t.service]
        .some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [items, search]);

  const columns: AppraisalColumn[] = useMemo(
    () => deriveColumns(items).filter((c) => !IDENTITY.has(c.key)),
    [items],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; ref: string; pkg: string; rows: Row[] }>();
    filtered.forEach((t) => {
      const intervention = String(t.intervention ?? "").trim();
      const ref = String(t.ref ?? "").trim();
      const key = `${ref}||${intervention}` || t._key;
      if (!map.has(key)) {
        map.set(key, {
          label: intervention || "Unnamed intervention",
          ref, pkg: String(t.package ?? "").trim(), rows: [],
        });
      }
      map.get(key)!.rows.push(t);
    });
    return [...map.values()];
  }, [filtered]);

  const allIds = useMemo(() => filtered.map((t) => t._key), [filtered]);
  const allOpen = allIds.length > 0 && allIds.every((id) => expanded.has(id));
  const toggle = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(allIds));

  const ensureList = async (): Promise<string> => {
    if (activeId) return activeId;
    const { id } = await createReport({ name, data: {}, items: [] });
    setActiveId(id);
    return id;
  };

  const handleImport = async (incoming: AppraisalRow[], mode: ImportMode) => {
    const id = await ensureList();
    const { added, items: next } = await submit({
      id, existing: strip(items), incoming, mode: items.length ? mode : "replace",
    });
    setItems(keyed(next));
    return added;
  };

  const handleDelete = async () => {
    if (!toDelete || !activeId) return;
    const next = items.filter((t) => t._key !== toDelete._key);
    try {
      await updateReport(activeId, { items: strip(next) });
      setItems(next);
      toast.success("Row removed.");
    } catch { toast.error("Failed to remove row."); }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2">
            <ClipboardList className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Appraised Interventions &amp; Services</h1>
            <p className="text-sm text-muted-foreground">
              Panel-appraised interventions and services
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll} disabled={loading || allIds.length === 0}>
            {allOpen ? <ChevronsDownUp className="mr-1.5 h-4 w-4" /> : <ChevronsUpDown className="mr-1.5 h-4 w-4" />}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AdminOnly silent>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" />Import
            </Button>
          </AdminOnly>
          <Button variant="outline" size="sm"
            onClick={() => downloadReport(name, strip(filtered))}
            disabled={loading || items.length === 0}>
            <Download className="mr-1.5 h-4 w-4" />Export Excel
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search interventions, refs, services..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : grouped.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No appraised interventions yet.{" "}
          <AdminOnly silent>
            <button className="text-[#27aae1] hover:underline" onClick={() => setBulkOpen(true)}>Import a sheet</button>.
          </AdminOnly>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 text-xs text-muted-foreground backdrop-blur">
                  <th className="w-8 border-b px-3 py-2.5" />
                  {columns.map((c) => (
                    <th key={c.key} style={colStyle(c.key)} className="border-b px-3 py-2.5 text-left font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="border-b px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => (
                  <Fragment key={`${g.ref}||${g.label}`}>
                    <tr style={{ backgroundColor: "rgba(254,113,5,0.08)" }}>
                      <td colSpan={columns.length + 2} className="border-b px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-sm font-semibold text-[#c85a00]">{g.label}</span>
                          {g.ref ? <span className="font-mono text-[11px] text-slate-500">{g.ref}</span> : null}
                          {g.pkg ? <span className="text-xs text-muted-foreground">· {g.pkg}</span> : null}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {g.rows.length} service{g.rows.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {g.rows.map((t, i) => {
                      const open = expanded.has(t._key);
                      return (
                        <Fragment key={t._key}>
                          <tr className={`hover:bg-muted/20 transition-colors ${i % 2 ? "bg-muted/5" : ""}`}>
                            <td className="border-b px-3 py-2.5 align-top">
                              <button onClick={() => toggle(t._key)} className="text-slate-400 hover:text-[#27aae1]"
                                aria-label={open ? "Collapse" : "Expand"}>
                                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </td>
                            {columns.map((c) => {
                              const v = String(t[c.key] ?? "");
                              return (
                                <td key={c.key} style={colStyle(c.key)} className="border-b px-3 py-2.5 align-top">
                                  {c.key === "service" ? (
                                    <button onClick={() => toggle(t._key)} className="line-clamp-2 text-left font-medium hover:text-[#27aae1]">
                                      {v || "—"}
                                    </button>
                                  ) : c.key === "decision" ? (
                                    v ? <span className="rounded bg-[#27aae1]/10 px-1.5 py-0.5 text-[11px] text-[#1d70b8]">{v}</span>
                                      : <span className="text-slate-300">—</span>
                                  ) : (
                                    <div className="line-clamp-2 text-slate-600">{v || <span className="text-slate-300">—</span>}</div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="border-b px-3 py-2.5 align-top text-right">
                              <AdminOnly silent>
                                <button className="text-slate-400 hover:text-red-600" onClick={() => setToDelete(t)} title="Delete row">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AdminOnly>
                            </td>
                          </tr>

                          {open && (
                            <tr className="bg-slate-50/60">
                              <td className="border-b" />
                              <td colSpan={columns.length + 1} className="border-b px-4 pb-3 pt-1"><RowDetail t={t} /></td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminOnly silent>
        <BulkImportAppraised
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onImport={handleImport}
          currentCount={items.length}
        />
        <DeleteDialog
          open={!!toDelete}
          onOpenChange={(v) => !v && setToDelete(null)}
          title="Delete row?"
          description={<span>This appraised service row will be removed.</span>}
          onConfirm={handleDelete}
        />
      </AdminOnly>
    </div>
  );
}