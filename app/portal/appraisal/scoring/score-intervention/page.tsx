"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  RefreshCw, Layers, Search, ChevronRight, Eye,
  ClipboardList, Info, Menu, CheckCircle2, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { SystemCategory, InterventionSystemCategory } from "@/types/new/client";
import {
  PanelIntervention,
  EnrichedPanelIntervention,
  PanelCategoryGroup,
  CriteriaAppraisalTool,
} from "@/types/new/panel-appraisal";
import {
  getPanelInterventions,
  getAllInterventionsCount,
  getAppraisalCriteria,
  getMyScores,
} from "@/app/api/new/panel/scoring";
import {
  getSystemCategories,
  getInterventionSystemCategories,
} from "@/app/api/new/panel/scoring";

const BRAND = "#27aae1";
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreProgress(scored: number, total: number) {
  if (total === 0) return null;
  if (scored === 0) return "none";
  if (scored >= total) return "full";
  return "partial";
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color,
}: { label: string; value: number | string; sub: string; color?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm min-w-[110px]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{label}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: color ?? "#1e293b" }}>
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}


function ScoredBadge({ scored }: { scored: number }) {
  if (scored > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3" /> Scored
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Circle className="h-3 w-3" /> Not scored
    </span>
  );
}

function SidebarItem({
  label, count, active, onClick, muted = false,
}: { label: string; count: number; active: boolean; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-100 text-left",
        muted && !active ? "text-slate-400" : !active ? "text-slate-700" : ""
      )}
      style={active ? { background: BRAND, color: "#fff" } : undefined}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = `${BRAND}12`;
          (e.currentTarget as HTMLElement).style.color = BRAND;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "";
          (e.currentTarget as HTMLElement).style.color = "";
        }
      }}
    >
      <span className="truncate pr-2 leading-snug text-[13px]">{label}</span>
      <span className={cn(
        "text-[11px] font-semibold shrink-0 min-w-[22px] text-center rounded-full px-1.5 py-0.5",
        active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
      )}>
        {count}
      </span>
    </button>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function PanelAppraisalPage() {
  const router = useRouter();

  // raw data
  const [panelInterventions, setPanelInterventions] = useState<PanelIntervention[]>([]);
  const [categories, setCategories] = useState<SystemCategory[]>([]);
  const [catLinks, setCatLinks] = useState<InterventionSystemCategory[]>([]);
  const [criteria, setCriteria] = useState<CriteriaAppraisalTool[]>([]);
  const [myScores, setMyScores] = useState<{ intervention: string; criteria: string }[]>([]);
  const [allInterventionsCount, setAllInterventionsCount] = useState(0);

  // ui state
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [panelRes, cats, links, crits, scores, totalCount] = await Promise.all([
        getPanelInterventions(),
        getSystemCategories(),
        getInterventionSystemCategories(),
        getAppraisalCriteria(),
        getMyScores(),
        getAllInterventionsCount(),
      ]);

      setPanelInterventions(panelRes);
      setCategories(cats);
      setCatLinks(links);
      setCriteria(crits);
      setMyScores(
        scores.map((s) => ({ intervention: s.intervention, criteria: s.criteria }))
      );
      setAllInterventionsCount(totalCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [activeCategory, tableSearch, pageSize]);

  // ── derived: enrich ─────────────────────────────────────────────────────────

  const totalCriteria = criteria.length;

  const enriched = useMemo((): EnrichedPanelIntervention[] => {
    return panelInterventions.map((rec) => {
      const scoredCriteriaIds = new Set(
        myScores
          .filter((s) => s.intervention === rec.intervention_id)
          .map((s) => s.criteria)
      );
      return {
        panelRecord: rec,
        scoredCriteriaIds,
        scoredCount: scoredCriteriaIds.size,
        totalCriteria,
      };
    });
  }, [panelInterventions, myScores, totalCriteria]);

  // ── derived: category groups ────────────────────────────────────────────────

  const groups = useMemo((): PanelCategoryGroup[] => {
    const panelInterventionIds = new Set(enriched.map((e) => e.panelRecord.intervention_id));

    const linksByCat = catLinks.reduce<Record<string, string[]>>((acc, l) => {
      if (panelInterventionIds.has(l.intervention)) {
        acc[l.system_category] = [...(acc[l.system_category] ?? []), l.intervention];
      }
      return acc;
    }, {});

    const enrichedById = new Map(
      enriched.map((e) => [e.panelRecord.intervention_id, e])
    );

    return categories
      .map((cat) => ({
        category: cat,
        interventions: (linksByCat[cat.id] ?? [])
          .map((id) => enrichedById.get(id))
          .filter(Boolean) as EnrichedPanelIntervention[],
      }))
      .filter((g) => g.interventions.length > 0);
  }, [categories, catLinks, enriched]);

  const categorisedIds = useMemo(
    () => new Set(catLinks.map((l) => l.intervention)),
    [catLinks]
  );

  const unassigned = useMemo(
    () => enriched.filter((e) => !categorisedIds.has(e.panelRecord.intervention_id)),
    [enriched, categorisedIds]
  );

  // ── stats ───────────────────────────────────────────────────────────────────

  const totalAtPanel = enriched.length;
  const totalScoredByMe = enriched.filter((e) => e.scoredCount > 0).length;
  const totalFullyScoredByMe = enriched.filter(
    (e) => e.scoredCount >= totalCriteria && totalCriteria > 0
  ).length;

  // ── active view ─────────────────────────────────────────────────────────────

  const activeGroup = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "unassigned") return null;
    return groups.find((g) => g.category.id === activeCategory) ?? null;
  }, [activeCategory, groups]);

  const allItems = useMemo((): EnrichedPanelIntervention[] => {
    if (activeCategory === "all") return enriched;
    if (activeCategory === "unassigned") return unassigned;
    return activeGroup?.interventions ?? [];
  }, [activeCategory, enriched, unassigned, activeGroup]);

  const filteredItems = useMemo(() => {
    if (!tableSearch) return allItems;
    const q = tableSearch.toLowerCase();
    return allItems.filter(
      (i) =>
        i.panelRecord.intervention_name?.toLowerCase().includes(q) ||
        i.panelRecord.reference_number?.toLowerCase().includes(q)
    );
  }, [allItems, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  // ── sidebar filtered ────────────────────────────────────────────────────────

  const filteredGroups = useMemo(() => {
    if (!sidebarSearch) return groups;
    const q = sidebarSearch.toLowerCase();
    return groups.filter((g) => g.category.name.toLowerCase().includes(q));
  }, [groups, sidebarSearch]);

  // ── pagination numbers ──────────────────────────────────────────────────────

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  // ── labels ──────────────────────────────────────────────────────────────────

  const activeCategoryLabel =
    activeCategory === "all" ? "All Panel Interventions"
    : activeCategory === "unassigned" ? "Unassigned Interventions"
    : activeGroup?.category.name ?? "";

  const activeCategoryDesc =
    activeCategory === "all"
      ? `${enriched.length} interventions moved to panel across ${groups.length} system categories`
    : activeCategory === "unassigned"
      ? "These interventions have not yet been linked to a system category."
    : activeGroup?.category.description ?? "";

  // ── sidebar ─────────────────────────────────────────────────────────────────

  const SidebarNav = ({ onSelect }: { onSelect?: () => void }) => (
    <nav className="flex-1 overflow-y-auto divide-y divide-slate-100">
      <SidebarItem
        label="All Interventions"
        count={enriched.length}
        active={activeCategory === "all"}
        onClick={() => { setActiveCategory("all"); onSelect?.(); }}
      />
      {filteredGroups.length === 0 && sidebarSearch ? (
        <p className="text-xs text-slate-400 px-4 py-3 italic">No categories match.</p>
      ) : (
        filteredGroups.map((g) => (
          <SidebarItem
            key={g.category.id}
            label={g.category.name}
            count={g.interventions.length}
            active={activeCategory === g.category.id}
            onClick={() => { setActiveCategory(g.category.id); onSelect?.(); }}
          />
        ))
      )}
      {unassigned.length > 0 && !sidebarSearch && (
        <SidebarItem
          label="Unassigned"
          count={unassigned.length}
          active={activeCategory === "unassigned"}
          onClick={() => { setActiveCategory("unassigned"); onSelect?.(); }}
          muted
        />
      )}
    </nav>
  );

  const SidebarHeader = () => (
    <div className="px-3 pt-4 pb-3 border-b border-slate-200 shrink-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
        System Categories
      </p>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={sidebarSearch}
          onChange={(e) => setSidebarSearch(e.target.value)}
          placeholder="Filter categories..."
          className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
        />
      </div>
    </div>
  );

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Layers className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Panel Appraisal</h1>
            <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">
              Score panel interventions by system category
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mobile active pill */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white w-full text-left shadow-sm"
        >
          <Layers className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
          <span className="flex-1 truncate text-slate-700">{activeCategoryLabel}</span>
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-0.5">Overview</p>
          <div className="flex gap-3 flex-wrap">
            <StatCard label="All Interventions" value={allInterventionsCount} sub="submitted proposals" />
            <StatCard label="At Panel" value={totalAtPanel} sub="moved to panel" color={BRAND} />
          </div>
        </div>

        <div className="self-stretch w-px bg-slate-200 mt-5" />

        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-0.5">My Scoring</p>
          <div className="flex gap-3 flex-wrap">
            <StatCard label="In Progress" value={totalScoredByMe - totalFullyScoredByMe} sub="partially scored" color="#d97706" />
            <StatCard label="Complete" value={totalFullyScoredByMe} sub="all criteria scored" color="#059669" />
            <StatCard label="Not Started" value={totalAtPanel - totalScoredByMe} sub="awaiting score" />
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-5 pb-0">
            <SheetTitle className="text-base">System Categories</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 overflow-hidden mt-3">
            <div className="px-3 pb-3 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter categories..."
                  className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            <SidebarNav onSelect={() => setMobileSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {loading ? (
        <div className="flex justify-center py-24">
          <RefreshCw className="h-7 w-7 animate-spin text-slate-300" />
        </div>
      ) : (
        <div
          className="flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
          style={{ minHeight: 520 }}
        >
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col border-r border-slate-200" style={{ width: "20%" }}>
            <SidebarHeader />
            <SidebarNav />
          </aside>

          {/* Main panel */}
          <div className="flex flex-col flex-1 min-w-0">

            {/* Panel header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">{activeCategoryLabel}</h2>
                  {activeCategoryDesc && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 max-w-xl">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                      {activeCategoryDesc}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-slate-500 pt-0.5">
                  <strong className="text-slate-700">{filteredItems.length}</strong>{" "}
                  intervention{filteredItems.length !== 1 ? "s" : ""}
                  {tableSearch && <span className="text-slate-400"> (filtered)</span>}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="relative flex-1 min-w-[160px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by name or reference…"
                    className="pl-9 h-8 text-sm bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
                  <span className="whitespace-nowrap hidden sm:inline">Rows per page</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                  >
                    <SelectTrigger className="h-8 w-20 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {paginatedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <ClipboardList className="h-10 w-10 opacity-20" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">No interventions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {tableSearch
                        ? "Try adjusting your search term."
                        : "No panel interventions in this category yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="w-10 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                      <TableHead className="w-44 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reference</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Intervention Name</TableHead>
                      <TableHead className="w-36 text-[11px] font-semibold uppercase tracking-wider text-slate-400">My Score</TableHead>
                      <TableHead className="w-36 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Decision</TableHead>
                      <TableHead className="w-24 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map(({ panelRecord, scoredCount }, idx) => {
                      const prog = scoreProgress(scoredCount, totalCriteria);
                      const isScored = scoredCount > 0;

                      return (
                        <TableRow
                          key={panelRecord.intervention_id}
                          className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                        >
                          <TableCell className="text-center text-xs text-slate-400 font-mono">
                            {(page - 1) * pageSize + idx + 1}
                          </TableCell>

                          <TableCell>
                            <button
                              onClick={() => router.push(`/portal/interventions/${panelRecord.intervention_id}`)}
                              className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                            >
                              {panelRecord.reference_number ?? "—"}
                            </button>
                          </TableCell>

                          <TableCell>
                            <p className="font-medium text-sm text-slate-800 leading-snug truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">
                              {panelRecord.intervention_name ?? "Untitled"}
                            </p>
                          </TableCell>

                          <TableCell>
                         <ScoredBadge scored={scoredCount} />
                          </TableCell>

                          <TableCell>
                            {panelRecord.decision ? (
                              <Badge variant="secondary" className="text-xs">
                                {panelRecord.decision.name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-300 italic">—</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={isScored ? "outline" : "default"}
                              className="h-7 text-xs gap-1"
                              style={!isScored ? { background: BRAND, borderColor: BRAND, color: "#fff" } : undefined}
                              onClick={() => router.push(`/portal/appraisal/scoring/score-intervention/${panelRecord.intervention_id}`)}
                            >
                              {prog === "full"
                                ? <><Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline"> View</span></>
                                : isScored
                                  ? <><span className="hidden sm:inline">Continue</span><ChevronRight className="h-3.5 w-3.5" /></>
                                  : <><span className="hidden sm:inline">Score</span><ChevronRight className="h-3.5 w-3.5" /></>
                              }
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredItems.length)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{filteredItems.length}</strong>
                </p>
                <Pagination>
                  <PaginationContent className="flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={cn(page === 1 && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                    {pageNumbers.map((p, i) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`} className="hidden sm:flex">
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p} className="hidden sm:flex">
                          <PaginationLink
                            isActive={page === p}
                            onClick={() => setPage(p as number)}
                            style={page === p ? { background: BRAND, borderColor: BRAND, color: "#fff" } : undefined}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={cn(page === totalPages && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}