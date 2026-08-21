"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw, BarChart3, Search, Layers, Workflow, Download, Trash2, Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PanelScoreSummaryRow } from "@/types/new/panel-score";
import { getScoresSummary } from "@/app/api/new/panel/panel-scoring";
import { globalUserStore } from "@/app/context/guard";

import { exportScoresReport, deleteUnits } from "./handler";
import { criteriaColumns, groupByDate, scoreForColumn } from "./report";
;

const UNASSIGNED = "__unassigned";
const ADMIN_ROLES = new Set(["admin"]);

type KindFilter = "all" | PanelScoreSummaryRow["target_type"];
const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "intervention", label: "Interventions" },
  { key: "national_proposal", label: "Programs" },
];

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

function StatCard({ label, value, sub, accent }: {
  label: string; value: number | string; sub: string; accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: accent ?? "#1e293b" }}>{value}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

const scoreCell = (v: number | null) =>
  v == null ? (
    <span className="text-slate-300">—</span>
  ) : (
    <span className="font-semibold tabular-nums text-slate-800">
      {Number.isInteger(v) ? v : v.toFixed(v * 4 % 1 === 0 ? 2 : 1)}
    </span>
  );

export default function PanelScoreReportPage() {
  const isAdmin = !!globalUserStore.userData?.role && ADMIN_ROLES.has(globalUserStore.userData.role);

  const [rows, setRows] = useState<PanelScoreSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pkgSearch, setPkgSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [pkg, setPkg] = useState<string>("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getScoresSummary());
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load scores report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rowId = (r: PanelScoreSummaryRow) => `${r.target_id}|${r.service}`;

  const stats = useMemo(() => {
    const units = rows.length;
    const reviewers = new Set<number>();
    let scoreRows = 0;
    for (const r of rows) {
      scoreRows += r.scores.length;
      for (const s of r.scores) reviewers.add(s.reviewer_id);
    }
    return { units, reviewers: reviewers.size, scoreRows };
  }, [rows]);

  const packages = useMemo(() => {
    const base = rows.filter((r) => kind === "all" || r.target_type === kind);
    const counts = new Map<string, number>();
    for (const r of base) {
      const key = r.package?.trim() || UNASSIGNED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const q = pkgSearch.trim().toLowerCase();
    const named = Array.from(counts.entries())
      .filter(([k]) => k !== UNASSIGNED && (!q || k.toLowerCase().includes(q)))
      .sort((a, b) => a[0].localeCompare(b[0]));
    return { total: base.length, named, unassigned: counts.get(UNASSIGNED) ?? 0 };
  }, [rows, kind, pkgSearch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== "all" && r.target_type !== kind) return false;
      if (pkg === UNASSIGNED) {
        if (r.package?.trim()) return false;
      } else if (pkg !== "all" && (r.package?.trim() || "") !== pkg) {
        return false;
      }
      if (!q) return true;
      return [r.reference_number, r.intervention, r.package, r.service]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, kind, pkg, search]);

  // Criteria columns are derived from the FULL row set (stable header across
  // date groups and filters); the body is grouped by date.
  const columns = useMemo(() => criteriaColumns(rows), [rows]);
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.has(rowId(r)));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((r) => next.delete(rowId(r)));
      else filtered.forEach((r) => next.add(rowId(r)));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(rowId(r))),
    [rows, selected]
  );

  const handleExport = async () => {
    if (!rows.length) return toast.info("Nothing to export.");
    try {
      await exportScoresReport(rows);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { deleted } = await deleteUnits(selectedRows);
      toast.success(`Deleted ${deleted} score${deleted === 1 ? "" : "s"} across ${selectedRows.length} unit${selectedRows.length === 1 ? "" : "s"}.`);
      setConfirmOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition ${
      active ? "border-[#27aae1] bg-[#27aae1] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
    }`;

  const pkgRow = (key: string, label: string, count: number, muted = false) => {
    const active = pkg === key;
    return (
      <button
        key={key}
        onClick={() => setPkg(key)}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
          active ? "bg-[#27aae1] text-white" : `${muted ? "text-slate-400" : "text-slate-600"} hover:bg-slate-50`
        }`}
      >
        <span className="truncate">{label}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {count}
        </span>
      </button>
    );
  };

  const selectedCount = selected.size;
  // fixed leading columns + one per criterion; used for group-header colspan
  const leadCols = (isAdmin ? 1 : 0) + 5;
  const totalCols = leadCols + columns.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#27aae1]/20 bg-[#27aae1]/10 p-2">
            <BarChart3 className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Panel Scores Report</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Every scored unit with its per-criterion scores, grouped by submission date.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !rows.length}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Scored units" value={stats.units} sub="target + service combinations" />
        <StatCard label="Reviewers" value={stats.reviewers} sub="members" accent="#27aae1" />
        <StatCard label="Criteria scores" value={stats.scoreRows} sub="individual selections" accent="#059669" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_1fr]">
        {/* Packages rail */}
        <aside className="lg:sticky lg:top-4">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Packages</span>
            </div>
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={pkgSearch}
                  onChange={(e) => setPkgSearch(e.target.value)}
                  placeholder="Filter packages…"
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
            <div className="max-h-[420px] space-y-0.5 overflow-y-auto p-2">
              {pkgRow("all", "All Units", packages.total)}
              {packages.named.map(([name, count]) => pkgRow(name, name, count))}
              {packages.unassigned > 0 && pkgRow(UNASSIGNED, "Unassigned", packages.unassigned, true)}
            </div>
          </div>
        </aside>

        {/* Table container */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search by intervention, reference, or service…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KIND_FILTERS.map((f) => (
                <button key={f.key} className={chip(kind === f.key)} onClick={() => setKind(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin selection bar */}
          {isAdmin && selectedCount > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[#27aae1]/5 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">
                {selectedCount} unit{selectedCount === 1 ? "" : "s"} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
                <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {isAdmin && (
                    <th className={`${TH} w-10`}>
                      <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                    </th>
                  )}
                  <th className={`${TH} min-w-48`}>Reference</th>
                  <th className={`${TH} min-w-64`}>Intervention</th>
                  <th className={`${TH} min-w-40`}>Service</th>
                  <th className={`${TH} min-w-28`}>Batch</th>
                  <th className={`${TH} min-w-24 text-center`}>Reviewers</th>
                  {columns.map((c) => (
                    <th key={c.key} className={`${TH} min-w-28 text-center`} title={c.name}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={totalCols} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan={totalCols} className="py-16 text-center">
                      <BarChart3 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm text-slate-400">No scored units match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  groups.map((g) => (
                    <>
                      <tr key={`grp-${g.key}`} className="bg-slate-50/80">
                        <td colSpan={totalCols} className="px-3 py-2">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {g.label}
                            <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {g.rows.length} scored
                            </span>
                          </span>
                        </td>
                      </tr>
                      {g.rows.map((r) => {
                        const id = rowId(r);
                        const checked = selected.has(id);
                        return (
                          <tr key={id} className={`transition-colors hover:bg-slate-50/70 ${checked ? "bg-[#27aae1]/5" : ""}`}>
                            {isAdmin && (
                              <td className={TD}>
                                <Checkbox checked={checked} onCheckedChange={() => toggleOne(id)} aria-label="Select unit" />
                              </td>
                            )}
                            <td className={TD}>
                              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1]">
                                {r.reference_number || "—"}
                              </span>
                              <span className={`mt-1 block text-[10px] uppercase tracking-wide ${
                                r.target_type === "intervention" ? "text-[#27aae1]" : "text-amber-600"
                              }`}>
                                {r.target_type === "intervention" ? "Intervention" : "Program"}
                              </span>
                            </td>
                            <td className={`${TD} font-medium text-slate-800`}>
                              <p className="line-clamp-2 max-w-xs">{r.intervention || "—"}</p>
                            </td>
                            <td className={`${TD} text-xs`}>
                              {r.service ? (
                                <span className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-2 py-0.5 text-[#27aae1]">
                                  <Workflow className="h-3 w-3" /> {r.service}
                                </span>
                              ) : (
                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-500">
                                  General
                                </span>
                              )}
                            </td>
                            <td className={`${TD} text-xs text-slate-600`}>{r.phase || "—"}</td>
                            <td className={`${TD} text-center`}>
                              <span className="inline-flex items-center rounded-full bg-[#27aae1]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#27aae1]">
                                {r.reviewers_scored}
                              </span>
                            </td>
                            {columns.map((c) => (
                              <td key={c.key} className={`${TD} text-center`}>
                                {scoreCell(scoreForColumn(r, c))}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 p-3 text-xs text-slate-400">
            {filtered.length} of {rows.length} scored unit{rows.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Delete confirm — admin only */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected scores?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <span className="block">
                This permanently deletes every reviewer score under{" "}
                <strong>{selectedRows.length}</strong> selected unit
                {selectedRows.length === 1 ? "" : "s"}.
              </span>
              <span className="block text-xs text-slate-400">This can&apos;t be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}