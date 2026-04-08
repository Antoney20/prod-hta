"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RefreshCw, Scale, AlertTriangle, BarChart3, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

import { WeightingReportSuccess } from "@/types/new/weighting";
import { getWeightingReport } from "@/app/api/new/scoring/weights";
import { AggregateTable } from "./tt/table";
import { IndividualRankingTable } from "./tt/individual";
import { IndividualWeighting } from "./tt/indivivualwe";

const BRAND = "#27aae1";

type Tab = "aggregate" | "individual_ranking" | "individual_weighting";

const TABS: { key: Tab; label: string }[] = [
  { key: "aggregate", label: "Aggregate ranking" },
  { key: "individual_ranking", label: "Individual ranking" },
  { key: "individual_weighting", label: "Individual weighting" },
];

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
  label,
  value,
  icon,
  color = "#1e293b",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="rounded-lg p-2 shrink-0" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">
          {label}
        </p>
        <p className="text-xl font-bold tracking-tight mt-0.5 tabular-nums truncate" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WeightReportsPage() {
  const [report, setReport] = useState<WeightingReportSuccess | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("aggregate");
  const [, startTransition] = useTransition();

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setInitialLoading(true);
    setError(null);
    const { data, error: err } = await getWeightingReport();
    if (err) setError(err);
    else setReport(data);
    setInitialLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(false); }, [load]);

  const topIntervention = report?.average_ranking[0]?.intervention_name ?? "—";

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
          <div
            className="h-full w-1/2 animate-[swipe_1.4s_ease-in-out_infinite]"
            style={{ background: BRAND }}
          />
        </div>

        {/* Header — light, matches scoring report */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}
            >
              <Scale className="h-5 w-5" style={{ color: BRAND }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Weighting Report</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                CRITIC-weighted scores and rankings for intervention proposals
              </p>
            </div>
          </div>

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

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Skeleton */}
        {initialLoading && <PageSkeleton />}

        {/* Content */}
        {!initialLoading && report && (
          <div className={cn(
            "flex flex-col gap-5 transition-opacity duration-200",
            refreshing && "opacity-60 pointer-events-none"
          )}>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard
                label="Reviewers"
                value={report.reviewer_results.length}
                icon={<Users className="h-4 w-4" />}
                color={BRAND}
              />
              <StatCard
                label="Interventions ranked"
                value={report.average_ranking.length}
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <StatCard
                label="Top intervention"
                value={topIntervention}
                icon={<Trophy className="h-4 w-4" />}
                color="#f59e0b"
              />
            </div>

            {/* Tab bar — underline style matching scoring report */}
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

            {/* Tab panels */}
            {activeTab === "aggregate" && <AggregateTable report={report} />}
            {activeTab === "individual_ranking" && <IndividualRankingTable report={report} />}
            {activeTab === "individual_weighting" && <IndividualWeighting data={report} />}
          </div>
        )}

        {!initialLoading && !error && !report && (
          <p className="text-sm text-slate-400 text-center py-16">
            No weighting report data available.
          </p>
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