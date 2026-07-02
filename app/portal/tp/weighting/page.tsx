"use client";

import { useEffect, useMemo, useState, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw, Scale, AlertTriangle, BarChart3, Users, Trophy, ShieldAlert, Layers3,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { WeightingReportSuccess } from "@/types/new/weighting";
import { InterventionPhase } from "@/types/new/intervention-phase";
import { getWeightingReport } from "@/app/api/new/scoring/weights";
import { getPhases } from "@/app/api/new/intervention-phase";
import { AggregateTable } from "./tt/table";
import { IndividualRankingTable } from "./tt/individual";
import { IndividualWeighting } from "./tt/indivivualwe";
import { AdminOnly } from "@/app/context/role";

const BRAND = "#27aae1";
const ALL = "all";

type Tab = "aggregate" | "individual_ranking" | "individual_weighting";

const TABS: { key: Tab; label: string; adminOnly?: boolean }[] = [
  { key: "aggregate", label: "Aggregate ranking" },
  { key: "individual_ranking", label: "Individual ranking", adminOnly: true },
  { key: "individual_weighting", label: "Individual weighting", adminOnly: true },
];

function filterReport(report: WeightingReportSuccess, keep: Set<string>): WeightingReportSuccess {
  return {
    ...report,
    average_ranking: report.average_ranking.filter((r) => keep.has(r.intervention_id)),
    average_scores: report.average_scores.filter((s) => keep.has(s.intervention_id)),
    reviewer_scores: report.reviewer_scores?.filter((s) => keep.has(s.intervention_id)) ?? report.reviewer_scores,
    reviewer_rankings: report.reviewer_rankings.map((rr) => ({
      ...rr,
      ranked_interventions: rr.ranked_interventions.filter((ri) => keep.has(ri.intervention_id)),
    })),
    reviewer_results: report.reviewer_results.map((rr) => ({
      ...rr,
      normalisation_report: rr.normalisation_report.filter((n) => keep.has(n.intervention_id)),
    })),
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-hidden="true">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 h-[72px] flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 h-9 w-9 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2 bg-slate-100 rounded w-3/4" />
              <div className="h-5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-9 border-b border-slate-200 flex gap-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-7 bg-slate-100 rounded w-36 self-end mb-1 mr-1" />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="h-9 bg-slate-100 rounded-lg flex-1 max-w-sm" />
        <div className="h-9 bg-slate-100 rounded-lg w-44" />
        <div className="h-9 bg-slate-100 rounded-lg w-28" />
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="h-8 bg-slate-50 border-b border-slate-200" />
        <div className="h-10 bg-slate-50 border-b border-slate-200" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 last:border-0">
            <div className="h-7 w-7 bg-slate-100 rounded-full shrink-0" />
            <div className="h-4 bg-slate-100 rounded flex-1" />
            <div className="h-5 bg-slate-100 rounded w-10 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-20 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-20 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color = "#1e293b",
}: {
  label: string; value: number | string; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="rounded-lg p-2 shrink-0" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{label}</p>
        <p className="text-xl font-bold tracking-tight mt-0.5 tabular-nums truncate" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

// ── Access denied panel ───────────────────────────────────────────────────────

function AccessDenied({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-slate-200 rounded-xl bg-white shadow-sm">
      <ShieldAlert className="h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">Access denied</p>
      <p className="text-xs text-slate-400 max-w-sm">
        {label} is restricted to the admins only.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WeightReportsPage() {
  const [report, setReport] = useState<WeightingReportSuccess | null>(null);
  const [phases, setPhases] = useState<InterventionPhase[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("aggregate");
  const [selectedPhase, setSelectedPhase] = useState<string>(ALL);
  const [, startTransition] = useTransition();

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setInitialLoading(true);
    setError(null);
    const [{ data, error: err }, phaseList] = await Promise.all([
      getWeightingReport(),
      getPhases(),
    ]);
    if (err) setError(err);
    else setReport(data);
    setPhases(phaseList);
    setInitialLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(false); }, [load]);

  // active phase names (case-sensitive, matching the report's phase strings)
  const activePhaseNames = useMemo(
    () => new Set(phases.filter((p) => p.is_active).map((p) => p.name)),
    [phases]
  );

  // intervention_id → phase name, from the aggregate scores
  const phaseById = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const s of report?.average_scores ?? []) m.set(s.intervention_id, s.phase ?? null);
    return m;
  }, [report]);

  const anyPhaseAssigned = useMemo(
    () => [...phaseById.values()].some((v) => !!v),
    [phaseById]
  );

  // active phases that actually appear in the data → dropdown options
  const phaseOptions = useMemo(() => {
    const present = new Set<string>();
    for (const name of phaseById.values()) if (name && activePhaseNames.has(name)) present.add(name);
    return [...present].sort((a, b) => a.localeCompare(b));
  }, [phaseById, activePhaseNames]);

  const keepIds = useMemo<Set<string> | null>(() => {
    if (!report) return new Set();
    if (!anyPhaseAssigned) return null;             
    const s = new Set<string>();
    for (const [id, name] of phaseById) {
      if (!name || !activePhaseNames.has(name)) continue;      
      if (selectedPhase !== ALL && name !== selectedPhase) continue;
      s.add(id);
    }
    return s;
  }, [report, phaseById, activePhaseNames, selectedPhase, anyPhaseAssigned]);

  const filteredReport = useMemo(() => {
    if (!report) return null;
    if (keepIds === null) return report;
    return filterReport(report, keepIds);
  }, [report, keepIds]);

  const topIntervention = filteredReport?.average_ranking[0]?.intervention_name ?? "—";

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5 relative">

        {/* Refresh progress bar */}
        <div
          className={cn(
            "absolute inset-x-0 -top-1 h-0.5 overflow-hidden rounded-full transition-opacity duration-300",
            refreshing ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden="true"
        >
          <div className="h-full w-1/2 animate-[swipe_1.4s_ease-in-out_infinite]" style={{ background: BRAND }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
              <Scale className="h-5 w-5" style={{ color: BRAND }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Weighting Report</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                CRITIC-weighted scores and rankings for intervention proposals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global phase filter — only when phases are actually in use */}
            {anyPhaseAssigned && phaseOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-slate-400" />
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="h-9 w-52 text-sm">
                    <SelectValue placeholder="All active phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All active phases</SelectItem>
                    {phaseOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => load(true)}
              disabled={initialLoading || refreshing}
              aria-label="Refresh report"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {initialLoading && <PageSkeleton />}

        {!initialLoading && filteredReport && report && (
          <div className={cn(
            "flex flex-col gap-5 transition-opacity duration-200",
            refreshing && "opacity-60 pointer-events-none"
          )}>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard label="Reviewers" value={report.reviewer_results.length} icon={<Users className="h-4 w-4" />} color={BRAND} />
              <StatCard label="Interventions ranked" value={filteredReport.average_ranking.length} icon={<BarChart3 className="h-4 w-4" />} />
              <StatCard label="Top intervention" value={topIntervention} icon={<Trophy className="h-4 w-4" />} color="#f59e0b" />
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-slate-200 gap-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => startTransition(() => setActiveTab(tab.key))}
                  className={cn(
                    "px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                    activeTab === tab.key
                      ? "border-[#27aae1] text-[#27aae1]"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels — aggregate open to all; individual tabs admin-only */}
            {activeTab === "aggregate" && <AggregateTable report={filteredReport} />}

            {activeTab === "individual_ranking" && (
              <AdminOnly fallback={<AccessDenied label="Individual ranking" />}>
                <IndividualRankingTable report={filteredReport} />
              </AdminOnly>
            )}

            {activeTab === "individual_weighting" && (
              <AdminOnly fallback={<AccessDenied label="Individual weighting" />}>
                <IndividualWeighting data={filteredReport} />
              </AdminOnly>
            )}
          </div>
        )}

        {!initialLoading && !error && !report && (
          <p className="text-sm text-slate-400 text-center py-16">No weighting report data available.</p>
        )}
      </div>

      <style jsx global>{`
        @keyframes swipe {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </TooltipProvider>
  );
}