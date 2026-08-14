"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, RefreshCw, Pencil, Trash2, Search, ListChecks, UploadCloud,
  ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { AdminOnly } from "@/app/context/role";
import {
  listSwg, getSwg, createSwg, updateSwg,
} from "@/app/api/new/panel/swg";
import { downloadSwg } from "@/app/portal/benefits-package/_lib/swg-excel";
import {
  DEFAULT_SWG_COLUMNS, DEFAULT_SWG_SECTIONS,
  type SwgColumn, type SwgListSummary, type SwgRow, type SwgSection,
} from "@/types/panel/benefits-package";
import { SwgTopicForm } from "./form";
import { BulkUploadTopics } from "./bulk";

type Topic = SwgRow & { _key: string };

const LABELS: Record<string, string> = {
  ref: "Ref", intervention: "Proposed Intervention", package: "Benefit Package",
  justification: "Justification", next_steps: "Proposed Next Steps",
  service_type: "Service Type", package_access: "Benefits Package Access", decision: "Decision",
};
const labelFor = (k: string) => LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const rid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const keyed = (rows: SwgRow[]): Topic[] => rows.map((r) => ({ ...r, _key: (r as any)._key ?? rid() }));
const strip = (rows: Topic[]): SwgRow[] => rows.map(({ _key, ...r }) => r);

const CORE = ["_key", "ref", "intervention", "package", "hta_type", "justification", "next_steps"];

const hasVal = (v: unknown) => String(v ?? "").trim() !== "";

const COL_W: Record<string, { min: number; max: number }> = {
  ref:           { min: 132, max: 150 },
  intervention:  { min: 220, max: 340 },
  package:       { min: 160, max: 240 },
  justification: { min: 240, max: 380 },
  next_steps:    { min: 200, max: 300 },
  decision:      { min: 96,  max: 120 },
};
const colStyle = (key: string) => {
  const w = COL_W[key] ?? { min: 150, max: 220 };
  return { minWidth: w.min, maxWidth: w.max };
};

function TopicDetail({ t }: { t: Topic }) {
  const extras = Object.keys(t).filter((k) => !CORE.includes(k));
  return (
    <div className="my-2 space-y-2 text-xs text-slate-700">
      {t.package ? <p><span className="font-medium text-slate-700">Benefit Package:</span> {String(t.package)}</p> : null}
      {t.justification ? (
        <div>
          <p className="font-medium text-slate-700">Justification</p>
          <p className="whitespace-pre-line text-slate-600">{String(t.justification)}</p>
        </div>
      ) : null}
      {t.next_steps ? (
        <div>
          <p className="font-medium text-slate-700">Proposed Next Steps</p>
          <p className="whitespace-pre-line text-slate-600">{String(t.next_steps)}</p>
        </div>
      ) : null}
      {extras.map((k) =>
        hasVal(t[k]) ? (
          <p key={k}><span className="font-medium text-slate-700">{labelFor(k)}:</span> {String(t[k])}</p>
        ) : null,
      )}
    </div>
  );
}

const refId = (t: Topic): string => (typeof t.id === "string" ? t.id : "");

export default function SwgPrioritizedPage() {
  const [lists, setLists] = useState<SwgListSummary[]>([]);
  const [activeId, setActiveId] = useState("");
  const [meta, setMeta] = useState<{ name: string; cycle: string; sections: SwgSection[] }>({
    name: "", cycle: "", sections: DEFAULT_SWG_SECTIONS,
  });
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | undefined>();
  const [presetTrack, setPresetTrack] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Topic | null>(null);

  const refreshLists = useCallback(async () => {
    const ls = await listSwg();
    setLists(ls);
    return ls;
  }, []);

  const loadOne = useCallback(async (id: string) => {
    const s = await getSwg(id);
    if (!s) return;
    setActiveId(s.id);
    setMeta({
      name: s.name, cycle: s.cycle,
      sections: s.data?.sections?.length ? s.data.sections : DEFAULT_SWG_SECTIONS,
    });
    setItems(keyed(s.items || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const ls = await refreshLists();
    if (ls.length) {
      await loadOne(ls[0].id);                 // single canonical list
    } else {
      const { id } = await createSwg({
        name: "SWG Prioritized Topics", cycle: "",
        data: { sections: DEFAULT_SWG_SECTIONS }, items: [],
      });
      await refreshLists();
      await loadOne(id);
    }
    setLoading(false);
  }, [refreshLists, loadOne]);

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      [t.ref, t.intervention, t.package, t.justification, t.next_steps]
        .some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [items, search]);

  const grouped = useMemo(() => {
    const order = meta.sections;
    const map = new Map<string, Topic[]>();
    order.forEach((s) => map.set(s.key, []));
    filtered.forEach((t) => {
      const k = (t.hta_type as string) || "";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    });
    return [...map.entries()]
      .map(([key, rows]) => ({
        key,
        label: order.find((s) => s.key === key)?.label ?? (key ? labelFor(key) : "Unsectioned"),
        rows,
      }))
      .filter((g) => g.rows.length);
  }, [filtered, meta.sections]);

  const columns: SwgColumn[] = useMemo(() => {
    const skip = new Set(["_key", "hta_type"]);
    const order = ["ref", "intervention", "package", "justification", "next_steps", "decision"];
    const present = new Set<string>();
    items.forEach((t) =>
      Object.entries(t).forEach(([k, v]) => { if (!skip.has(k) && hasVal(v)) present.add(k); }),
    );
    const head = order.filter((k) => present.has(k));
    const extras = [...present].filter((k) => !order.includes(k)).sort();
    return [...head, ...extras].map((k) => ({ key: k, label: labelFor(k) }));
  }, [items]);

  const allIds = useMemo(() => filtered.map((t) => t._key), [filtered]);
  const allOpen = allIds.length > 0 && allIds.every((id) => expanded.has(id));
  const toggle = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(allIds));

  const ensureList = async (): Promise<string> => {
    if (activeId) return activeId;
    const name = meta.name || (meta.cycle ? `SWG ${meta.cycle}` : "SWG Prioritized Topics");
    const { id } = await createSwg({ name, cycle: meta.cycle, data: { sections: DEFAULT_SWG_SECTIONS }, items: [] });
    setActiveId(id);
    await refreshLists();
    return id;
  };

  const save = async (id: string, next: Topic[], sections = meta.sections) =>
    updateSwg(id, { items: strip(next), data: { sections } });

  const openAdd = (track?: string) => { setEditing(undefined); setPresetTrack(track); setFormOpen(true); };
  const openEdit = (t: Topic) => { setEditing(t); setPresetTrack(undefined); setFormOpen(true); };

  const handleSubmit = async (topic: SwgRow) => {
    setSubmitting(true);
    try {
      const id = await ensureList();
      const next = editing
        ? items.map((t) => (t._key === editing._key ? { ...topic, _key: editing._key } : t))
        : [...items, { ...topic, _key: rid() }];
      await save(id, next);
      setItems(next);
      await refreshLists();
      toast.success(editing ? "Topic updated." : "Topic added.");
      setFormOpen(false);
    } catch { toast.error("Failed to save topic."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!toDelete || !activeId) return;
    const next = items.filter((t) => t._key !== toDelete._key);
    try {
      await save(activeId, next);
      setItems(next);
      await refreshLists();
      toast.success("Topic removed.");
    } catch { toast.error("Failed to remove topic."); }
    setToDelete(null);
  };

  const handleImport = async (rows: SwgRow[], sections: SwgSection[], mode: "replace" | "append") => {
    const id = await ensureList();
    const norm = (r: SwgRow) => {
      const ref = String((r as any).ref ?? "").trim().toLowerCase();
      return ref || String((r as any).intervention ?? "").trim().toLowerCase();
    };

    // de-dupe within the uploaded batch (keeps first occurrence)
    const seen = new Set<string>();
    const batch: SwgRow[] = [];
    for (const r of rows) {
      const k = norm(r);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
      batch.push(r);
    }

    let next: Topic[];
    let added: number;
    if (mode === "append") {
      const existing = new Set(items.map(norm).filter(Boolean));
      const fresh = batch.filter((r) => { const k = norm(r); return !k || !existing.has(k); });
      added = fresh.length;
      next = [...items, ...keyed(fresh)];
    } else {
      added = batch.length;
      next = keyed(batch);
    }

    const nextSections = sections.length ? sections : meta.sections;
    await save(id, next, nextSections);
    setItems(next);
    setMeta((m) => ({ ...m, sections: nextSections }));
    await refreshLists();
    return added;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2">
            <ListChecks className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SWG Prioritized Topics</h1>
            <p className="text-sm text-muted-foreground">Topics proceeding to the panel, grouped by HTA track</p>
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
            <Button onClick={() => openAdd()}>
              <Plus className="mr-2 h-4 w-4" />Add topic
            </Button>
          </AdminOnly>
          <Button variant="outline" size="sm"
            onClick={() => downloadSwg(meta.name || "swg", columns, meta.sections, strip(filtered))}
            disabled={loading || items.length === 0}>
            <Download className="mr-1.5 h-4 w-4" />Export Excel
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search topics, refs, packages..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : grouped.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No topics yet.{" "}
          <AdminOnly silent><button className="text-[#27aae1] hover:underline" onClick={() => setBulkOpen(true)}>Import a sheet</button> or add one.</AdminOnly>
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
                  <Fragment key={g.key || "unsectioned"}>
                    <tr style={{ backgroundColor: "rgba(254,113,5,0.08)" }}>
                      <td colSpan={columns.length + 2} className="border-b px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-[#c85a00]">{g.label}</span>
                          <span className="text-xs text-muted-foreground">{g.rows.length} topic{g.rows.length !== 1 ? "s" : ""}</span>
                          <AdminOnly silent>
                            <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={() => openAdd(g.key)}>
                              <Plus className="mr-1 h-3 w-3" />Add
                            </Button>
                          </AdminOnly>
                        </div>
                      </td>
                    </tr>

                    {g.rows.map((t, i) => {
                      const open = expanded.has(t._key);
                      return (
                        <Fragment key={t._key}>
                          <tr className={`hover:bg-muted/20 transition-colors ${i % 2 ? "bg-muted/5" : ""}`}>
                            <td className="border-b px-3 py-2.5 align-top">
                              <button onClick={() => toggle(t._key)} className="text-slate-400 hover:text-[#27aae1]" aria-label={open ? "Collapse" : "Expand"}>
                                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </td>
                            {columns.map((c) => {
                              const v = String(t[c.key] ?? "");
                              return (
                                <td key={c.key} style={colStyle(c.key)} className="border-b px-3 py-2.5 align-top">
                                  {c.key === "ref" ? (
                                    <span className="font-mono text-[11px] text-slate-500">{v || "—"}</span>
                                //    {c.key === "ref" ? (
                                //    <a href={`/portal/panel/evidence/coverage/${refId(t)}`}
                                //       className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-1.5 py-0.5 font-mono text-[11px] text-[#27aae1] no-underline hover:underline"
                                //       onClick={(e) => e.stopPropagation()}>
                                //       {v || "—"}
                                //       <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                                //     </a> 
                                
                                  ) : c.key === "intervention" ? (
                                    <button onClick={() => toggle(t._key)} className="line-clamp-2 text-left font-medium hover:text-[#27aae1]">
                                      {v || "—"}
                                    </button>
                                  ) : c.key === "next_steps" ? (
                                    v ? <span className="line-clamp-2 rounded bg-[#27aae1]/10 px-1.5 py-0.5 text-[11px] leading-relaxed text-[#1d70b8]">{v}</span>
                                      : <span className="text-slate-300">—</span>
                                  ) : (
                                    <div className="line-clamp-2 text-slate-600">{v || <span className="text-slate-300">—</span>}</div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="border-b px-3 py-2.5 align-top text-right">
                              <AdminOnly silent>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-7 border bg-[#27aae1]/5 px-3 text-xs">Actions</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(t)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </AdminOnly>
                            </td>
                          </tr>

                          {open && (
                            <tr className="bg-slate-50/60">
                              <td className="border-b" />
                              <td colSpan={columns.length + 1} className="border-b px-4 pb-3 pt-1"><TopicDetail t={t} /></td>
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
        <SwgTopicForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          defaultValues={editing}
          presetTrack={presetTrack}
          tracks={meta.sections}
          isSubmitting={submitting}
        />
        <BulkUploadTopics
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onImport={handleImport}
          currentCount={items.length}
        />
        <DeleteDialog
          open={!!toDelete}
          onOpenChange={(v) => !v && setToDelete(null)}
          title="Delete topic?"
          description={<span><strong>{String(toDelete?.intervention)}</strong> will be removed from this list.</span>}
          onConfirm={handleDelete}
        />
      </AdminOnly>
    </div>
  );
}