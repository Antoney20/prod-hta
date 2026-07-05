"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, RefreshCw, ClipboardList, ChevronLeft, ChevronRight, Inbox,
} from "lucide-react";

import { CoverageMatrix, CoverageTarget, OverallStatus } from "@/types/new/evidence-coverage";
import { getCoverage } from "@/app/api/new/panel/coverage";
import { CELL_STYLE, OVERALL_STYLE } from "@/components/shared/status";

const PAGE_SIZE = 20;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

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
        {(["complete", "incomplete", "empty", "missing"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${CELL_STYLE[s].dot}`} />
            {CELL_STYLE[s].label}
          </span>
        ))}
      </div>

      {/* table */}
      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className={`${TH} min-w-36`}>Reference</th>
              <th className={`${TH} min-w-48`}>Name</th>
              <th className={`${TH} w-28`}>Package</th>
              <th className={`${TH} w-24`}>Phase</th>
              <th className={`${TH} min-w-44`}>Coverage</th>
              <th className={`${TH} min-w-40`}>Criteria</th>
              <th className={`${TH} w-28`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No targets match this view.</p>
              </td></tr>
            ) : (
              paged.map((t) => {
                const badge = OVERALL_STYLE[t.overall];
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
                    <td className={TD}>
                      {/* per-criterion status strip */}
                      <div className="flex flex-wrap gap-1">
                        {t.criteria.map((c) => (
                          <span key={c.criterion}
                            title={`${c.criterion_name}: ${CELL_STYLE[c.status].label} (${c.filled}/${c.total})`}
                            className={`h-3 w-3 rounded-sm ${CELL_STYLE[c.status].dot}`} />
                        ))}
                      </div>
                    </td>
                    <td className={TD}>
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