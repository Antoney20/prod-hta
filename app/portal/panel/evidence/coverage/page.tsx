"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, RefreshCw, ClipboardList, ChevronLeft, ChevronRight, Inbox, Check, X,
} from "lucide-react";

import { CoverageMatrix, CoverageTarget, OverallStatus } from "@/types/new/evidence-coverage";
import { getCoverage } from "@/app/api/new/panel/coverage";
import { CELL_STYLE, OVERALL_STYLE } from "@/components/shared/status";

const PAGE_SIZE = 20;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";
const THC = "px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TDC = "px-2 py-3 text-center align-middle";

// Cell display state derived straight from data presence, so green ticks == coverage count.
type IconState = "has" | "empty" | "none";

const critLabel = (raw: string) => { 
  const n = (raw ?? "").trim().toLowerCase(); 
  if (n.includes("burden") && n.includes("mortality")) return "BOD-Mort";
  if (n.includes("burden") && n.includes("morbidity")) return "BOD-D";
   if (n.includes("access") && n.includes("healthcare")) return "Access";
    if (n.includes("budgetary") && n.includes("affordability")) return "Budgetary";
   if (n.includes("feasibility") && n.includes("implementation ")) return "Feasibility";
   if (n.includes("incidence") && n.includes("occurrence")) return "Incidence";
   if (n.includes("catastrophic") && n.includes("expenditure")) return "Expenditure";
   if (n.includes("congruence") && n.includes("existing")) return "Congruence";
  return (raw ?? "").trim().split(/\s+/).slice(0, 3).join(" ");
};

const LEGEND: { state: IconState; label: string }[] = [
  { state: "has", label: "Has evidence" },
  { state: "empty", label: "Available, empty" },
  { state: "none", label: "No evidence" },
];

const FILTERS: { key: OverallStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "complete", label: "Complete" },
  { key: "partial", label: "Partial" },
  { key: "incomplete", label: "Incomplete" },
  { key: "missing", label: "No evidence" },
];

export default function EvidenceCoveragePage() {
  const router = useRouter();
  const [matrix, setMatrix] = useState<CoverageMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OverallStatus | "all">("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setMatrix(await getCoverage());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const targets = matrix?.targets ?? [];
  const criteria = matrix?.criteria ?? [];
  const summary = matrix?.summary;

  const columns = useMemo(() => {
    const seen = new Map<string, { key: string; name: string; label: string }>();
    for (const t of targets)
      for (const c of t.criteria) {
        const key = (c.criterion_name ?? "").toLowerCase();
        if (key && !seen.has(key))
          seen.set(key, { key, name: c.criterion_name, label: critLabel(c.criterion_name) });
      }
    return [...seen.values()];
  }, [targets]);

  const colCount = 6 + columns.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      if (filter !== "all" && t.overall !== filter) return false;
      if (!q) return true;
      return (
        (t.reference_number ?? "").toLowerCase().includes(q) ||
        (t.name ?? "").toLowerCase().includes(q) ||
        (t.package_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [targets, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filter]);

  const goDetail = (t: CoverageTarget) =>
     router.push(`/portal/panel/evidence/coverage/${t.id}`);

  return (
    <div className="space-y-6 p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><ClipboardList className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Evidence Coverage</h1>
            <p className="text-sm text-slate-500">Track which interventions and programs have evidence across every criterion.</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* summary strip */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard label="Targets" value={summary.total} tone="slate" />
          <SummaryCard label="Complete" value={summary.complete} tone="emerald" />
          <SummaryCard label="Partial" value={summary.partial} tone="blue" />
          <SummaryCard label="Incomplete" value={summary.incomplete} tone="amber" />
          <SummaryCard label="No evidence" value={summary.missing} tone="red" />
        </div>
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search ref, name or package…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "border-[#27aae1] bg-[#27aae1] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {LEGEND.map((l) => (
          <span key={l.state} className="inline-flex items-center gap-1.5">
            <CritIcon state={l.state} />
            {l.label}
          </span>
        ))}
      </div>

      {/* table */}
      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"> 
            <tr>
              <th rowSpan={2} className={`${TH} min-w-80`}>Reference</th>
              <th rowSpan={2} className={`${TH} min-w-72`}>Name</th>
              <th rowSpan={2} className={`${TH} w-28`}>Package</th>
              <th rowSpan={2} className={`${TH} w-24`}>Phase</th>
              <th rowSpan={2} className={`${TH} min-w-44`}>Coverage</th>
              {columns.length > 0 && (
                <th colSpan={columns.length} className={`${TH} border-l border-slate-200 text-center`}>
                  Criteria
                </th>
              )}
              <th rowSpan={2} className={`${TH} w-28 border-l border-slate-200`}>Status</th>
            </tr>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={THC} title={col.name}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={colCount} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={colCount} className="py-16 text-center">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No targets match this view.</p>
              </td></tr>
            ) : (
              paged.map((t) => {
                const badge = OVERALL_STYLE[t.overall];
                const cellByName = new Map(
                  t.criteria.map((c) => [(c.criterion_name ?? "").toLowerCase(), c] as const)
                );
                return (
                  <tr key={`${t.kind}-${t.id}`} className="transition-colors hover:bg-slate-50/70">
                    <td className={TD}>
                      <button onClick={() => goDetail(t)}
                        className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1] hover:underline">
                        {t.reference_number || "—"}
                      </button>
                      <span className={`mt-1 block text-[10px] uppercase tracking-wide ${
                        t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
                      }`}>
                        {t.kind === "intervention" ? "Intervention" : "Program"}
                      </span>
                    </td>
                    <td className={`${TD} font-medium text-slate-800`}>
                      <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
                    </td>
                    <td className={`${TD} text-xs text-slate-600`}>{t.package_name || "—"}</td>
                    <td className={`${TD} text-xs text-slate-600`}>{t.phase_name || "—"}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded bg-slate-100">
                          <div className="h-full rounded bg-[#27aae1] transition-all"
                            style={{ width: `${t.coverage.percent}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">
                          {t.coverage.covered}/{t.coverage.total}
                        </span>
                      </div>
                    </td>
                    {/* per-criterion columns: green when the criterion has any data value */}
                    {columns.map((col, i) => {
                      const cell = cellByName.get(col.key);
                      const iconState: IconState =
                        cell && cell.filled > 0 ? "has"
                        : cell && cell.total > 0 ? "empty"
                        : "none";
                      return (
                        <td
                          key={col.key}
                          className={`${TDC} ${i === 0 ? "border-l border-slate-100" : ""}`}
                          title={cell ? `${col.name}: ${CELL_STYLE[cell.status].label} (${cell.filled}/${cell.total})` : `${col.name}: —`}
                        >
                          <CritIcon state={iconState} />
                        </td>
                      );
                    })}
                    <td className={`${TD} border-l border-slate-100`}>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
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
    </div>
  );
}

function CritIcon({ state }: { state: IconState }) {
  switch (state) {
    case "has":   return <Check className="inline h-4 w-4 text-emerald-500" strokeWidth={2.5} />;
    case "empty": return <span className="font-bold text-[#fe7105]">–</span>;
    case "none":  return <X className="inline h-4 w-4 text-red-400" strokeWidth={2.5} />;
  }
}

function SummaryCard({ label, value, tone }: {
  label: string; value: number; tone: "slate" | "emerald" | "blue" | "amber" | "red";
}) {
  const map = {
    slate: "text-slate-800",
    emerald: "text-emerald-600",
    blue: "text-[#27aae1]",
    amber: "text-amber-600",
    red: "text-red-500",
  } as const;
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold ${map[tone]}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}