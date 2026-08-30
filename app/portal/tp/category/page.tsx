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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  RefreshCw, Package, Layers, Search, ChevronRight, ChevronDown, Eye,
  CheckCircle2, ClipboardList, AlertCircle, Info, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { SystemCategory, InterventionScore } from "@/types/new/client";
import { TopicPriority } from "@/types/new/topic-prioritization";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import {
  getSystemCategories,
  getInterventionCategories,
  getInterventionScores,
} from "@/app/api/new/client";
import { getTopicPriorities } from "@/app/api/new/tp";

const BRAND = "#27aae1";
const UNASSIGNED = "__unassigned__";
const NO_PHASE = "__none__";

type TargetTypeFilter = "all" | "intervention" | "national_proposal";

interface EnrichedProposal {
  id: string;
  name: string;
  refNumber: string | null;
  targetType: "intervention" | "national_proposal";
  scored: boolean;
  reviewStatus?: TopicPriority;
  packageName: string | null; 
  phaseName: string | null;   
  categoryIds: string[];     
}

interface PackageGroup {
  key: string;   // lowercased package name
  name: string;  // display name
  interventions: EnrichedProposal[];
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

export default function BrowseByPackagePage() {
  const router = useRouter();

  const [items, setItems] = useState<EnrichedProposal[]>([]);
  const [categories, setCategories] = useState<SystemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>("all");
  const [activePackage, setActivePackage] = useState<string>("all");
  const [scFilter, setScFilter] = useState<string>("all");    
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [showCats, setShowCats] = useState(false);

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, cats, allLinks, scores, topicPriorities] = await Promise.all([
        getSubmittedProposals(),
        getSystemCategories(),
        getInterventionCategories(),
        getInterventionScores(),
        getTopicPriorities(),
      ]);

      const proposals = proposalsRes.results ?? [];
      const scoredIds = new Set(scores.map((s: InterventionScore) => String(s.intervention)));

      // Intervention review status — keyed by intervention_id, nationals excluded
      const reviewStatusMap = new Map(
        topicPriorities
          .filter((tp) => tp.target_type !== "national_proposal" && tp.intervention_id)
          .map((tp) => [String(tp.intervention_id), tp])
      );

      const meta = new Map<string, { pkg: string | null; phase: string | null; cats: Set<string> }>();
      for (const link of allLinks) {
        const iid = String(link.intervention);
        const m = meta.get(iid) ?? { pkg: null, phase: null, cats: new Set<string>() };
        if (link.package) m.pkg = link.package;
        if (link.phase) m.phase = link.phase;
        if (link.system_category) m.cats.add(String(link.system_category));
        meta.set(iid, m);
      }

      const interventionItems: EnrichedProposal[] = proposals.map((p) => {
        const m = meta.get(String(p.id));
        return {
          id: String(p.id),
          name: p.intervention_name ?? "Untitled",
          refNumber: p.reference_number ?? null,
          targetType: "intervention",
          scored: scoredIds.has(String(p.id)),
          reviewStatus: reviewStatusMap.get(String(p.id)),
          packageName: m?.pkg ?? null,
          phaseName: m?.phase ?? null,
          categoryIds: m ? [...m.cats] : [],
        };
      });

      // National programs come straight from the TP results
      const nationalItems: EnrichedProposal[] = topicPriorities
        .filter((tp) => tp.target_type === "national_proposal" && tp.national_proposal_id)
        .map((tp) => ({
          id: String(tp.national_proposal_id),
          name: tp.intervention_name || "Untitled",
          refNumber: tp.reference_number ?? null,
          targetType: "national_proposal",
          scored: tp.is_scored,
          reviewStatus: tp,
          packageName: tp.package,
          phaseName: tp.phase,
          categoryIds: [],
        }));

      setItems([...interventionItems, ...nationalItems]);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setPage(1);
  }, [activePackage, scFilter, phaseFilter, tableSearch, pageSize, targetTypeFilter]);
  // Switching target scope resets package/category selection to avoid empty views
  useEffect(() => { setActivePackage("all"); setScFilter("all"); }, [targetTypeFilter]);

  const catNameById = useMemo(
    () => new Map(categories.map((c) => [String(c.id), c.name])),
    [categories]
  );


  const scopedItems = useMemo(
    () => targetTypeFilter === "all"
      ? items
      : items.filter((i) => i.targetType === targetTypeFilter),
    [items, targetTypeFilter]
  );

  const packageGroups = useMemo(() => {
    const map = new Map<string, PackageGroup>();
    for (const it of scopedItems) {
      if (!it.packageName) continue;
      const key = it.packageName.trim().toLowerCase();
      const name = it.packageName.trim();
      if (!map.has(key)) map.set(key, { key, name, interventions: [] });
      map.get(key)!.interventions.push(it);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedItems]);

  const unassignedItems = useMemo(
    () => scopedItems.filter((i) => !i.packageName),
    [scopedItems]
  );

  const phaseOptions = useMemo(() => {
    const s = new Set<string>();
    for (const it of scopedItems) if (it.phaseName) s.add(it.phaseName);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [scopedItems]);

  const systemCategoryOptions = useMemo(() => {
    const s = new Set<string>();
    for (const it of scopedItems) for (const cid of it.categoryIds) s.add(cid);
    return [...s]
      .map((id) => ({ id, name: catNameById.get(id) ?? "Unknown category" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedItems, catNameById]);

  const allItems = useMemo((): EnrichedProposal[] => {
    if (activePackage === "all") return scopedItems;
    if (activePackage === UNASSIGNED) return unassignedItems;
    return packageGroups.find((g) => g.key === activePackage)?.interventions ?? [];
  }, [activePackage, scopedItems, unassignedItems, packageGroups]);

  const filteredItems = useMemo(() => {
    let arr = allItems;
    if (scFilter !== "all") arr = arr.filter((i) => i.categoryIds.includes(scFilter));
    if (phaseFilter !== "all") {
      arr = phaseFilter === NO_PHASE
        ? arr.filter((i) => !i.phaseName)
        : arr.filter((i) => i.phaseName === phaseFilter);
    }
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.refNumber?.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [allItems, scFilter, phaseFilter, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);


  const totalAll = scopedItems.length;

  const decisionGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of scopedItems) {
      const name = item.reviewStatus?.decision?.name;
      if (name) map.set(name, (map.get(name) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [scopedItems]);

  const totalPending = useMemo(
    () => scopedItems.filter((i) => !i.scored && !i.reviewStatus?.decision).length,
    [scopedItems]
  );
  // Sum of every scored row (all "Yes" badges) in the current scope.
  const totalScored = useMemo(
    () => scopedItems.filter((i) => i.scored).length,
    [scopedItems]
  );
  // Type breakdowns for the Total block — respect the scope toggle, so the
  // non-selected type reads 0 when the toggle is filtered to one type.
  const totalInterventions = useMemo(
    () => scopedItems.filter((i) => i.targetType === "intervention").length,
    [scopedItems]
  );
  const totalNational = useMemo(
    () => scopedItems.filter((i) => i.targetType === "national_proposal").length,
    [scopedItems]
  );


  const filteredPackageGroups = useMemo(() => {
    if (!sidebarSearch) return packageGroups;
    const q = sidebarSearch.toLowerCase();
    return packageGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [packageGroups, sidebarSearch]);

  const catCount = useCallback(
    (id: string) => allItems.filter((i) => i.categoryIds.includes(id)).length,
    [allItems]
  );

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

  const scopeNoun =
    targetTypeFilter === "intervention" ? "interventions"
    : targetTypeFilter === "national_proposal" ? "national programs"
    : "proposals";

  const activePackageLabel =
    activePackage === "all" ? `All ${targetTypeFilter === "all" ? "Proposals" : scopeNoun.replace(/^\w/, (c) => c.toUpperCase())}`
    : activePackage === UNASSIGNED ? "Unassigned"
    : packageGroups.find((g) => g.key === activePackage)?.name ?? "";

  const activePackageDesc =
    activePackage === "all" ? `${totalAll} ${scopeNoun} across ${packageGroups.length} package${packageGroups.length !== 1 ? "s" : ""}`
    : activePackage === UNASSIGNED ? `These ${scopeNoun} have not been linked to a package.`
    : `${scopeNoun.replace(/^\w/, (c) => c.toUpperCase())} in the ${activePackageLabel} package.`;

  const detailRoute = (item: EnrichedProposal) =>
    item.targetType === "national_proposal"
      ? `/portal/interventions/${item.id}`
      : `/portal/interventions/${item.id}`;

  const getReviewStatusBadge = (item: EnrichedProposal) => {
    const { reviewStatus, scored } = item;

    if (!scored) {
      if (reviewStatus?.decision) {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3" /> {reviewStatus.decision.name}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          <AlertCircle className="h-3 w-3" /> Pending
        </span>
      );
    }

    if (reviewStatus?.decision) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3" /> {reviewStatus.decision.name}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3" /> Scored
      </span>
    );
  };

  const SidebarNav = ({ onSelect }: { onSelect?: () => void }) => (
    <nav className="flex-1 overflow-y-auto">
      <div className="divide-y divide-slate-100">
        <SidebarItem
          label={targetTypeFilter === "all" ? "All Proposals" : `All ${scopeNoun.replace(/^\w/, (c) => c.toUpperCase())}`}
          count={totalAll}
          active={activePackage === "all"}
          onClick={() => { setActivePackage("all"); onSelect?.(); }}
        />
        {filteredPackageGroups.length === 0 && sidebarSearch ? (
          <p className="text-xs text-slate-400 px-4 py-3 italic">No packages match.</p>
        ) : (
          filteredPackageGroups.map((g) => (
            <SidebarItem
              key={g.key}
              label={g.name}
              count={g.interventions.length}
              active={activePackage === g.key}
              onClick={() => { setActivePackage(g.key); onSelect?.(); }}
            />
          ))
        )}
        {unassignedItems.length > 0 && !sidebarSearch && (
          <SidebarItem
            label="Unassigned"
            count={unassignedItems.length}
            active={activePackage === UNASSIGNED}
            onClick={() => { setActivePackage(UNASSIGNED); onSelect?.(); }}
            muted
          />
        )}
      </div>

      {/* Optional system-category filter — interventions only, collapsed by default */}
      <div className="border-t border-slate-200">
        <button
          onClick={() => setShowCats((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> System Categories
          </span>
          {showCats ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {showCats && (
          <div className="divide-y divide-slate-100 pb-1">
            <SidebarItem
              label="All categories"
              count={allItems.length}
              active={scFilter === "all"}
              onClick={() => setScFilter("all")}
              small
            />
            {systemCategoryOptions.length === 0 ? (
              <p className="text-xs text-slate-400 px-4 py-2.5 italic">None linked here.</p>
            ) : (
              systemCategoryOptions.map((c) => (
                <SidebarItem
                  key={c.id}
                  label={c.name}
                  count={catCount(c.id)}
                  active={scFilter === c.id}
                  onClick={() => setScFilter(c.id)}
                  small
                />
              ))
            )}
          </div>
        )}
      </div>
    </nav>
  );

  const SidebarHeader = () => (
    <div className="px-3 pt-4 pb-3 border-b border-slate-200 shrink-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
        Packages
      </p>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={sidebarSearch}
          onChange={(e) => setSidebarSearch(e.target.value)}
          placeholder="Filter packages..."
          className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Package className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Proposals by Package
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">
              Browse interventions and national programs by package, filter by phase and manage review status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Target-type scope toggle */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {([
          { v: "all", label: "All" },
          { v: "intervention", label: "Interventions" },
          { v: "national_proposal", label: "National Programs" },
        ] as { v: TargetTypeFilter; label: string }[]).map((o) => {
          const active = targetTypeFilter === o.v;
          return (
            <button
              key={o.v}
              onClick={() => setTargetTypeFilter(o.v)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                active ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
              style={active ? { color: BRAND } : undefined}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* Mobile active package pill */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white w-full text-left shadow-sm"
        >
          <Package className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
          <span className="flex-1 truncate text-slate-700">{activePackageLabel}</span>
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-0.5">Status</p>
          <div className="flex gap-3">
            <StatCard label="Pending" value={totalPending} sub="not yet scored" warn />
            <StatCard label="Scored by me" value={totalScored} sub="all scored" accent />
          </div>
        </div>

        <div className="self-stretch w-px bg-slate-200 mt-5" />

        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-0.5">Decisions</p>
          <div className="flex flex-wrap gap-3">
            {decisionGroups.length === 0 ? (
              <StatCard label="No decisions yet" value={0} sub="—" />
            ) : (
              decisionGroups.map(([name, count]) => (
                <StatCard key={name} label={name} value={count} sub={scopeNoun} />
              ))
            )}
          </div>
        </div>


       
      </div>

      {/* Mobile sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-5 pb-0">
            <SheetTitle className="flex items-center justify-between text-base">
              <span>Packages</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 overflow-hidden mt-3">
            <div className="px-3 pb-3 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter packages..."
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
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm" style={{ minHeight: 520 }}>

          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col border-r border-slate-200" style={{ width: "20%" }}>
            <SidebarHeader />
            <SidebarNav />
          </aside>

          {/* Main panel */}
          <div className="flex flex-col flex-1 min-w-0">

            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">{activePackageLabel}</h2>
                  {activePackageDesc && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 max-w-xl">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                      {activePackageDesc}
                      {scFilter !== "all" && (
                        <span className="text-slate-400"> · category: {catNameById.get(scFilter) ?? "—"}</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-slate-500 pt-0.5">
                  <strong className="text-slate-700">{filteredItems.length}</strong>{" "}
                  {scopeNoun}
                  {(tableSearch || phaseFilter !== "all" || scFilter !== "all") && (
                    <span className="text-slate-400"> (filtered)</span>
                  )}
                </div>
              </div>

              {/* Toolbar: search · phase filter · rows per page */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="relative flex-1 min-w-[160px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by name or reference..."
                    className="pl-9 h-8 text-sm bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
                  <span className="whitespace-nowrap hidden sm:inline">Phase</span>
                  <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                    <SelectTrigger className="h-8 w-44 text-xs bg-white">
                      <SelectValue placeholder="All phases" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All phases</SelectItem>
                      {phaseOptions.map((ph) => (
                        <SelectItem key={ph} value={ph}>{ph}</SelectItem>
                      ))}
                      <SelectItem value={NO_PHASE}>Not assigned</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="whitespace-nowrap hidden sm:inline">Rows</span>
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
                    <p className="text-sm font-medium text-slate-500">No {scopeNoun} found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {tableSearch || phaseFilter !== "all" || scFilter !== "all"
                        ? "Try adjusting your filters."
                        : "Select a package from the left panel to begin."}
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="w-10 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                      <TableHead className="w-44 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reference</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</TableHead>
                      <TableHead className="w-40 hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-slate-400">Package</TableHead>
                      <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Scored</TableHead>
                      <TableHead className="w-40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Decision</TableHead>
                      <TableHead className="w-32 hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-slate-400">Decided At</TableHead>
                      <TableHead className="w-24 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item, idx) => {
                      const { scored, packageName, phaseName } = item;
                      const isNational = item.targetType === "national_proposal";
                      return (
                        <TableRow key={`${item.targetType}-${item.id}`} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">

                          <TableCell className="text-center text-xs text-slate-400 font-mono">
                            {(page - 1) * pageSize + idx + 1}
                          </TableCell>

                          <TableCell>
                            <button
                              onClick={() => router.push(detailRoute(item))}
                              className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                            >
                              {item.refNumber ?? "—"}
                            </button>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 max-w-[200px] sm:max-w-xs lg:max-w-sm">
                              <p className="font-medium text-sm text-slate-800 leading-snug truncate">
                                {item.name ?? "Untitled"}
                              </p>
                              {isNational && (
                                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                                  National
                                </span>
                              )}
                            </div>
                          </TableCell>

           

                          <TableCell className="hidden lg:table-cell">
                            {packageName ? (
                              <span className="text-xs text-slate-600">{packageName}</span>
                            ) : (
                              <span className="text-slate-300 text-xs italic">Unassigned</span>
                            )}
                          </TableCell>

                          <TableCell>
                            {scored ? (
                              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-slate-500">No</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {getReviewStatusBadge(item)}
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            {item.reviewStatus?.decision_date ? (
                              <span className="text-sm text-slate-600 whitespace-nowrap">
                                {new Date(item.reviewStatus.decision_date).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 italic">—</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={scored ? "outline" : "default"}
                              className="h-7 text-xs gap-1"
                              style={!scored ? { background: BRAND, borderColor: BRAND, color: "#fff" } : undefined}
                              onClick={() =>
                                router.push(`/portal/tp/score/${item.id}`
                                )
                              }
                            >
                              {scored
                                ? <><Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline"> View</span></>
                                : <><span className="hidden sm:inline">Score</span> <ChevronRight className="h-3.5 w-3.5" /></>}
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

function StatCard({ label, value, sub, accent, warn }: {
  label: string; value: number; sub: string; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{label}</p>
      <p
        className="text-2xl font-bold mt-1 tracking-tight"
        style={{ color: accent ? "#059669" : warn ? "#d97706" : "#1e293b" }}
      >
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, muted = false, small = false }: {
  label: string; count: number; active: boolean; onClick: () => void; muted?: boolean; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between text-left transition-all duration-100",
        small ? "px-4 py-2 pl-6" : "px-4 py-2.5",
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
      <span className={cn("truncate pr-2 leading-snug", small ? "text-xs" : "text-[13px]")}>{label}</span>
      <span className={cn(
        "text-[11px] font-semibold shrink-0 min-w-[22px] text-center rounded-full px-1.5 py-0.5",
        active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
      )}>
        {count}
      </span>
    </button>
  );
}