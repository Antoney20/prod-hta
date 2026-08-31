"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, ClipboardCheck, Search, Layers, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CriteriaAppraisalTool, PanelAppraisalScore } from "@/types/new/panel-score";
import { EvidenceTarget } from "@/types/new/decision-template";

import { getAppraisalCriteria, listPanelScores } from "@/app/api/new/panel/panel-scoring";
import { generatePayload, regeneratePayload } from "@/app/api/new/panel/template";
import { globalUserStore, useGlobalUser } from "@/app/context/guard";

import { buildScoreMap, targetRollup, unitsOf, scopeScored } from "./_lib/scoring";
import PanelScoreTable from "./_components/table";

type KindFilter = "all" | EvidenceTarget["kind"];
const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "intervention", label: "Interventions" },
  { key: "national_proposal", label: "Programs" },
];

const UNASSIGNED = "__unassigned";
const REGEN_ROLES = new Set(["admin", "secretariat"]);
const PAGE_SIZES = [25, 50, 100];

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: accent ?? "#1e293b" }}>
        {value}
      </p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

export default function PanelScoringOverviewPage() {
  const { user, isInitialized } = useGlobalUser();
  const router = useRouter();
  const canRegenerate =
    !!globalUserStore.userData?.role && REGEN_ROLES.has(globalUserStore.userData.role);

  const [targets, setTargets] = useState<EvidenceTarget[]>([]);
  const [criteria, setCriteria] = useState<CriteriaAppraisalTool[]>([]);
  const [scores, setScores] = useState<PanelAppraisalScore[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pkgSearch, setPkgSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [pkg, setPkg] = useState<string>("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [railOpen, setRailOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tgts, crit] = await Promise.all([
        canRegenerate ? regeneratePayload() : generatePayload(),
        getAppraisalCriteria(),
      ]);
      setTargets(tgts);
      setCriteria(crit);
      setScores(user?.id ? await listPanelScores({ reviewer: user.id }) : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load panel scoring.");
    } finally {
      setLoading(false);
    }
  }, [canRegenerate, user?.id]);

  useEffect(() => {
    if (isInitialized) load();
  }, [isInitialized, load]);

  const activeCriteria = useMemo(() => criteria.filter((c) => c.active), [criteria]);
  const scoreMap = useMemo(() => buildScoreMap(scores), [scores]);

  const isFullyScored = useCallback(
    (t: EvidenceTarget) => {
      const r = targetRollup(scoreMap, t, activeCriteria);
      return r.totalUnits > 0 && r.scoredUnits === r.totalUnits;
    },
    [scoreMap, activeCriteria]
  );
  const isScoredByMe = useCallback(
    (t: EvidenceTarget) => targetRollup(scoreMap, t, activeCriteria).anyScored,
    [scoreMap, activeCriteria]
  );

  const stats = useMemo(() => {
    let pending = 0;
    let mine = 0;
    let servicesScored = 0;
    let interventionsScored = 0;
    for (const t of targets) {
      if (isScoredByMe(t)) mine += 1;
      else pending += 1;
      // named service scopes that have been scored (general "" scope excluded)
      for (const u of unitsOf(t)) {
        if (u !== "" && scopeScored(scoreMap, t.id, u)) servicesScored += 1;
      }
      // an intervention is "scored" when every one of its scopes is scored
      if (t.kind === "intervention" && isFullyScored(t)) interventionsScored += 1;
    }
    return { pending, mine, servicesScored, interventionsScored };
  }, [targets, scoreMap, isScoredByMe, isFullyScored]);

  const packages = useMemo(() => {
    const base = targets.filter((t) => kind === "all" || t.kind === kind);
    const counts = new Map<string, number>();
    for (const t of base) {
      const key = t.package?.trim() || UNASSIGNED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const q = pkgSearch.trim().toLowerCase();
    const named = Array.from(counts.entries())
      .filter(([k]) => k !== UNASSIGNED && (!q || k.toLowerCase().includes(q)))
      .sort((a, b) => a[0].localeCompare(b[0]));
    return { total: base.length, named, unassigned: counts.get(UNASSIGNED) ?? 0 };
  }, [targets, kind, pkgSearch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (mineOnly && !isScoredByMe(t)) return false;
      if (pkg === UNASSIGNED) {
        if (t.package?.trim()) return false;
      } else if (pkg !== "all" && (t.package?.trim() || "") !== pkg) {
        return false;
      }
      if (!q) return true;
      return [t.reference_number, t.name, t.package]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [targets, kind, pkg, mineOnly, search, isScoredByMe]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => setPage(1), [search, kind, pkg, mineOnly, pageSize]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? "border-[#27aae1] bg-[#27aae1] text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
    }`;

  const pkgRow = (key: string, label: string, count: number, muted = false) => {
    const active = pkg === key;
    return (
      <button
        key={key}
        onClick={() => setPkg(key)}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
          active
            ? "bg-[#27aae1] text-white"
            : `${muted ? "text-slate-400" : "text-slate-600"} hover:bg-slate-50`
        }`}
      >
        <span className="truncate">{label}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#27aae1]/20 bg-[#27aae1]/10 p-2">
            <ClipboardCheck className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Panel Appraisal Scoring</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Score interventions and national programs against the appraisal criteria — per service or in general.
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pending" value={stats.pending} sub="not yet scored by me" accent="#fe7105" />
        <StatCard label="Scored by me" value={stats.mine} sub="at least one unit scored" accent="#059669" />
        <StatCard label="Services scored" value={stats.servicesScored} sub="service scopes scored" accent="#27aae1" />
        <StatCard label="Interventions scored" value={stats.interventionsScored} sub="all services scored" accent="#059669" />
      </div>

      {/* Body: packages rail (left) + table container (right) */}
      <div
        className={`grid grid-cols-1 items-start gap-5 ${
          railOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[44px_1fr]"
        }`}
      >
        {/* Packages rail */}
        <aside className="lg:sticky lg:top-4">
          {railOpen ? (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Packages
                  </span>
                </span>
                <button
                  onClick={() => setRailOpen(false)}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-[#27aae1]"
                  title="Hide packages"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" /> Hide
                </button>
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
                {pkgRow("all", "All Proposals", packages.total)}
                {packages.named.map(([name, count]) => pkgRow(name, name, count))}
                {packages.unassigned > 0 &&
                  pkgRow(UNASSIGNED, "Unassigned", packages.unassigned, true)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setRailOpen(true)}
              title="Show packages"
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-3 text-slate-400 shadow-sm transition hover:border-[#27aae1] hover:text-[#27aae1]"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest [writing-mode:vertical-rl]">
                Packages
              </span>
            </button>
          )}
        </aside>

        {/* Table column — filters + table + pagination as one container */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Filter bar (header) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search by name or reference…"
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
              <button className={chip(mineOnly)} onClick={() => setMineOnly((v) => !v)}>
                Scored by me
              </button>
            </div>
          </div>

          {/* Table */}
          <PanelScoreTable
            targets={paged}
            criteria={activeCriteria}
            scoreMap={scoreMap}
            loading={loading}
            isFullyScored={isFullyScored}
            onOpen={(t, service) =>
              router.push(
                service
                  ? `/portal/panel/scoring/${t.id}?service=${encodeURIComponent(service)}`
                  : `/portal/panel/scoring/${t.id}`
              )
            }
          />

          {/* Pagination (footer) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-3 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="ml-2">
                {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-slate-600">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}