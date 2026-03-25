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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  RefreshCw, Layers, Search, ChevronRight, Eye, CheckCircle2,
  ClipboardList, AlertCircle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { SystemCategory, InterventionSystemCategory, InterventionScore } from "@/types/new/client";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import {
  getSystemCategories,
  getInterventionCategories,
  getInterventionScores,
} from "@/app/api/new/client";

const BRAND = "#27aae1";

interface EnrichedProposal {
  proposal: SubmittedProposal;
  scored: boolean;
}
interface CategoryGroup {
  category: SystemCategory;
  interventions: EnrichedProposal[];
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

export default function BrowseByCategoryPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [unassigned, setUnassigned] = useState<EnrichedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, categories, allLinks, scores] = await Promise.all([
        getSubmittedProposals(),
        getSystemCategories(),
        getInterventionCategories(),
        getInterventionScores(),
      ]);

      const proposals = proposalsRes.results ?? [];
      const scoredIds = new Set(scores.map((s: InterventionScore) => String(s.intervention)));
      const proposalMap = new Map(proposals.map((p) => [String(p.id), p]));

      const linksByCat = allLinks.reduce<Record<string, string[]>>((acc, link) => {
        const catId = String(link.system_category);
        acc[catId] = [...(acc[catId] ?? []), String(link.intervention)];
        return acc;
      }, {});

      const categorisedIds = new Set(allLinks.map((l) => String(l.intervention)));

      const built: CategoryGroup[] = categories
        .map((cat) => {
          const ids = linksByCat[cat.id] ?? [];
          const interventions: EnrichedProposal[] = ids
            .map((id) => proposalMap.get(id))
            .filter(Boolean)
            .map((p) => ({ proposal: p!, scored: scoredIds.has(String(p!.id)) }));
          return { category: cat, interventions };
        })
        .filter((g) => g.interventions.length > 0);

      const unassignedList: EnrichedProposal[] = proposals
        .filter((p) => !categorisedIds.has(String(p.id)))
        .map((p) => ({ proposal: p, scored: scoredIds.has(String(p.id)) }));

      setGroups(built);
      setUnassigned(unassignedList);
      if (built.length > 0) setActiveCategory(built[0].category.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [activeCategory, tableSearch, pageSize]);

  const activeGroup = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "unassigned") return null;
    return groups.find((g) => g.category.id === activeCategory) ?? null;
  }, [activeCategory, groups]);

  const allItems = useMemo((): EnrichedProposal[] => {
    if (activeCategory === "all") return groups.flatMap((g) => g.interventions);
    if (activeCategory === "unassigned") return unassigned;
    return activeGroup?.interventions ?? [];
  }, [activeCategory, activeGroup, groups, unassigned]);

  const filteredItems = useMemo(() => {
    if (!tableSearch) return allItems;
    const q = tableSearch.toLowerCase();
    return allItems.filter(
      (i) =>
        i.proposal.intervention_name?.toLowerCase().includes(q) ||
        i.proposal.reference_number?.toLowerCase().includes(q)
    );
  }, [allItems, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const totalAll = groups.reduce((s, g) => s + g.interventions.length, 0);
  const totalScored = groups.flatMap((g) => g.interventions).filter((i) => i.scored).length;

  const filteredGroups = useMemo(() => {
    if (!sidebarSearch) return groups;
    const q = sidebarSearch.toLowerCase();
    return groups.filter((g) => g.category.name.toLowerCase().includes(q));
  }, [groups, sidebarSearch]);

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

  const activeCategoryLabel =
    activeCategory === "all" ? "All Interventions"
    : activeCategory === "unassigned" ? "Unassigned Interventions"
    : activeGroup?.category.name ?? "";

  const activeCategoryDesc =
    activeCategory === "all" ? `${totalAll} interventions across ${groups.length} system categories`
    : activeCategory === "unassigned" ? "These interventions have not yet been linked to a system category."
    : activeGroup?.category.description ?? "";

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Layers className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Interventions by System Category
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select a system category on the left to view and score its interventions
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Interventions (Categorized)" value={totalAll} sub="across all system categories" />
        <StatCard label="Scored by Me" value={totalScored} sub="completed assessments" accent />
        <StatCard label="Pending" value={totalAll - totalScored} sub="awaiting your score" warn />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <RefreshCw className="h-7 w-7 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm" style={{ minHeight: 520 }}>

          {/* Sidebar — 20% */}
          <aside className="flex flex-col border-r border-slate-200" style={{ width: "20%" }}>
            <div className="px-3 pt-4 pb-3 border-b border-slate-200">
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

            <nav className="flex-1 overflow-y-auto divide-y divide-slate-100">
              <SidebarItem
                label="All Interventions"
                count={totalAll}
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />

              {filteredGroups.length === 0 && sidebarSearch ? (
                <p className="text-xs text-slate-400 px-4 py-3 italic">No categories match..</p>
              ) : (
                filteredGroups.map((g) => (
                  <SidebarItem
                    key={g.category.id}
                    label={g.category.name}
                    count={g.interventions.length}
                    active={activeCategory === g.category.id}
                    onClick={() => setActiveCategory(g.category.id)}
                  />
                ))
              )}

              {unassigned.length > 0 && !sidebarSearch && (
                <SidebarItem
                  label="Unassigned"
                  count={unassigned.length}
                  active={activeCategory === "unassigned"}
                  onClick={() => setActiveCategory("unassigned")}
                  muted
                />
              )}
            </nav>
          </aside>

          <div className="flex flex-col flex-1 min-w-0">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className=" text-lg font-semibold text-slate-800">{activeCategoryLabel}</h2>
                  {activeCategoryDesc && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 max-w-xl">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                      {activeCategoryDesc}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-slate-500 pt-0.5">
                  <strong className="text-slate-700">{filteredItems.length}</strong> intervention{filteredItems.length !== 1 ? "s" : ""}
                  {tableSearch && <span className="text-slate-400"> (filtered)</span>}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3 mt-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by intervention name or reference..."
                    className="pl-9 h-8 text-sm bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
                  <span className="whitespace-nowrap">Rows per page</span>
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
                        : "Select a system category from the left panel to begin."}
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="w-10 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                      <TableHead className="w-56 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reference</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Intervention Name</TableHead>
                      <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Type</TableHead>
                      <TableHead className="w-28 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">Review Status</TableHead>
                      <TableHead className="w-24 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map(({ proposal, scored }, idx) => (
                      <TableRow key={proposal.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">

                        <TableCell className="text-center text-xs text-slate-400 font-mono">
                          {(page - 1) * pageSize + idx + 1}
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-mono text-slate-400 whitespace-nowrap ">
                            <button
                              onClick={() =>
                                router.push(`/portal/interventions/${proposal.id}`)
                              }
                              className="font-mono  text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                            >
                              {proposal.reference_number ?? "—"}
                            </button>
                          </span>
                        </TableCell>

                        <TableCell>
                          <p className="font-medium text-sm text-slate-800 leading-snug max-w-87.5 lg:max-w-90 truncate">
                            {proposal.intervention_name ?? "Untitled"}
                          </p>
                        </TableCell>

                        <TableCell>
                          {proposal.intervention_type ? (
                            <Badge variant="secondary" className="text-xs">{proposal.intervention_type}</Badge>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {scored ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Scored
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={scored ? "outline" : "default"}
                            className="h-7 text-xs gap-1"
                            style={!scored ? { background: BRAND, borderColor: BRAND, color: "#fff" } : undefined}
                            onClick={() => router.push(`/portal/tp/score/${proposal.id}`)}
                          >
                            {scored
                              ? <><Eye className="h-3.5 w-3.5" /> View</>
                              : <>Score <ChevronRight className="h-3.5 w-3.5" /></>}
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50/40">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredItems.length)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{filteredItems.length}</strong> interventions
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={cn(page === 1 && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                    {pageNumbers.map((p, i) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight"
        style={{ color: accent ? "#059669" : warn ? "#d97706" : "#1e293b" }}>
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, muted = false }: {
  label: string; count: number; active: boolean; onClick: () => void; muted?: boolean;
}) {
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
        "text-[11px] font-semibold shrink-0 min-w-5.5 text-center rounded-full px-1.5 py-0.5",
        active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
      )}>
        {count}
      </span>
    </button>
  );
}