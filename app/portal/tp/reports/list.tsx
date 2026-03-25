// "use client";


// import { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   Pagination, PaginationContent, PaginationEllipsis,
//   PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
// } from "@/components/ui/pagination";
// import { RefreshCw, List } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { EnrichedInterventionScore } from "@/types/new/scoring";
// import { SystemCategory } from "@/types/new/client";
// import { getAdminScoringReport, getScoringReport } from "@/app/api/new/scoring";
// import { getSystemCategories } from "@/app/api/new/client";
// import { EnrichedRowItem, ScoreListTable } from "./score_tt";
// import { ScoreListFilters } from "./ss_ft";

// const BRAND = "#27aae1";


// function toArray<T>(data: unknown): T[] {
//   if (!data) return [];
//   if (Array.isArray(data)) return data as T[];
//   if (typeof data === "object" && "results" in (data as object)) {
//     const paginated = data as { results?: T[] };
//     return Array.isArray(paginated.results) ? paginated.results : [];
//   }
//   return [];
// }

// export function ScoreList() {
//   const [scores, setScores] = useState<EnrichedInterventionScore[]>([]);
//   const [systemCategories, setSystemCategories] = useState<SystemCategory[]>([]);
//   const [categoryMap, setCategoryMap] = useState<Record<string, SystemCategory[]>>({});
//   const [loading, setLoading] = useState(true);

//   const [searchText, setSearchText] = useState("");
//   const [filterReviewer, setFilterReviewer] = useState("all");
//   const [filterIntervention, setFilterIntervention] = useState("all");
//   const [filterCategory, setFilterCategory] = useState("");
//   const [showAll, setShowAll] = useState(false);

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(25);

//   useEffect(() => {
//     setPage(1);
//   }, [searchText, filterReviewer, filterIntervention, filterCategory, showAll, pageSize]);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [rawScores, rawCategories, reportData] = await Promise.all([
//         getAdminScoringReport(),
//         getSystemCategories(),
//         getScoringReport(),
//       ]);

//       // Fix: safely coerce whatever the API returns into a plain array
//       const safeScores = toArray<EnrichedInterventionScore>(rawScores);
//       const safeCategories = toArray<SystemCategory>(rawCategories);

//       setScores(safeScores);
//       setSystemCategories(safeCategories);

//       const nameToCategory = new Map<string, SystemCategory>();
//       safeCategories.forEach((c) => nameToCategory.set(c.name, c));

//       const map: Record<string, SystemCategory[]> = {};
//       if (reportData?.interventions) {
//         reportData.interventions.forEach((inv) => {
//           const cats = (inv.system_categories ?? [])
//             .map((name) => nameToCategory.get(name))
//             .filter((c): c is SystemCategory => !!c);
//           map[inv.intervention_id] = cats;
//         });
//       }
//       setCategoryMap(map);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);



//   const reviewerOptions = useMemo(() => {
//     const seen = new Map<string, string>();
//     scores.forEach((s) => {
//       const id = String(s.reviewer);
//       if (!seen.has(id)) seen.set(id, s.reviewer_name || `Reviewer ${id}`);
//     });
//     return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
//   }, [scores]);

//   const interventionOptions = useMemo(() => {
//     const seen = new Map<string, string>();
//     scores.forEach((s) => {
//       if (!seen.has(s.intervention)) {
//         seen.set(
//           s.intervention,
//           `${s.intervention_reference ? s.intervention_reference + " — " : ""}${s.intervention_name}`
//         );
//       }
//     });
//     return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
//   }, [scores]);

//   const filteredScores = useMemo(() => {
//     let items = scores;

//     if (filterReviewer !== "all")
//       items = items.filter((s) => String(s.reviewer) === filterReviewer);

//     if (filterIntervention !== "all")
//       items = items.filter((s) => s.intervention === filterIntervention);

//     if (filterCategory) {
//       const matchingInterventions = Object.entries(categoryMap)
//         .filter(([, cats]) => cats.some((c) => c.id === filterCategory))
//         .map(([id]) => id);
//       items = items.filter((s) => matchingInterventions.includes(s.intervention));
//     }

//     if (searchText.trim()) {
//       const q = searchText.toLowerCase();
//       items = items.filter((s) =>
//         s.score?.criteria_label?.toLowerCase().includes(q) ||
//         s.score?.scoring_mechanism?.toLowerCase().includes(q) ||
//         s.intervention_name?.toLowerCase().includes(q) ||
//         s.intervention_reference?.toLowerCase().includes(q) ||
//         s.reviewer_name?.toLowerCase().includes(q)
//       );
//     }

//     return items;
//   }, [scores, filterReviewer, filterIntervention, filterCategory, searchText, categoryMap]);

//   const allRows = useMemo((): EnrichedRowItem[] => {
//     if (!showAll) return filteredScores;

//     const scoredInterventionIds = new Set(filteredScores.map((s) => s.intervention));

//     const unscoredPlaceholders: EnrichedRowItem[] = Object.keys(categoryMap)
//       .filter((id) => !scoredInterventionIds.has(id))
//       .map((interventionId) => {
//         const existing = scores.find((s) => s.intervention === interventionId);
//         return {
//           id: `__unscored__${interventionId}`,
//           score: null as unknown as EnrichedRowItem["score"],
//           comment: "",
//           created_at: "",
//           updated_at: "",
//           reviewer: 0,
//           intervention: interventionId,
//           criteria: "",
//           reviewer_name: "",
//           reviewer_email: "",
//           intervention_name: existing?.intervention_name ?? interventionId,
//           intervention_reference: existing?.intervention_reference ?? "",
//           _unscored: true,
//         } satisfies EnrichedRowItem;
//       });

//     return [...filteredScores, ...unscoredPlaceholders];
//   }, [filteredScores, showAll, categoryMap, scores]);

//   // ── Pagination ────────────────────────────────────────────────────────────
//   const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
//   const paginated = allRows.slice((page - 1) * pageSize, page * pageSize);

//   const pageNumbers = useMemo(() => {
//     const pages: (number | "ellipsis")[] = [];
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       pages.push(1);
//       if (page > 3) pages.push("ellipsis");
//       for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
//       if (page < totalPages - 2) pages.push("ellipsis");
//       pages.push(totalPages);
//     }
//     return pages;
//   }, [page, totalPages]);

//   return (
//     <div className="space-y-4">

//       {/* Section header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="p-1.5 rounded-md" style={{ background: `${BRAND}15` }}>
//             <List className="h-4 w-4" style={{ color: BRAND }} />
//           </div>
//           <div>
//             <h2 className="text-base font-semibold text-slate-800">Individual Score List</h2>
//             <p className="text-xs text-slate-500">
//               All individual scores submitted · filter by intervention, reviewer, or system category
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={load}
//           disabled={loading}
//           className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 disabled:opacity-50"
//           aria-label="Refresh score list"
//         >
//           <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//         </button>
//       </div>

//       {/* Filters */}
//       <ScoreListFilters
//         searchText={searchText}
//         onSearchChange={setSearchText}
//         filterIntervention={filterIntervention}
//         onInterventionChange={setFilterIntervention}
//         interventionOptions={interventionOptions}
//         filterReviewer={filterReviewer}
//         onReviewerChange={setFilterReviewer}
//         reviewerOptions={reviewerOptions}
//         filterCategory={filterCategory}
//         onCategoryChange={setFilterCategory}
//         categoryOptions={systemCategories}
//         showAll={showAll}
//         onShowAllChange={setShowAll}
//         pageSize={pageSize}
//         onPageSizeChange={(v) => { setPageSize(v); setPage(1); }}
//         shownCount={paginated.length}
//         totalCount={scores.length}
//         filteredCount={allRows.length}
//       />

//       {/* Table */}
//       {loading ? (
//         <div className="flex justify-center py-12 border border-slate-200 rounded-xl bg-white">
//           <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
//         </div>
//       ) : (
//         <ScoreListTable
//           rows={paginated}
//           rowOffset={(page - 1) * pageSize}
//           categoryMap={categoryMap}
//         />
//       )}

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between pt-1">
//           <p className="text-xs text-slate-500">
//             Showing{" "}
//             <strong className="text-slate-700">
//               {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, allRows.length)}
//             </strong>{" "}
//             of <strong className="text-slate-700">{allRows.length}</strong>
//           </p>
//           <Pagination>
//             <PaginationContent>
//               <PaginationItem>
//                 <PaginationPrevious
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   className={cn(page === 1 && "pointer-events-none opacity-40")}
//                 />
//               </PaginationItem>
//               {pageNumbers.map((p, i) =>
//                 p === "ellipsis" ? (
//                   <PaginationItem key={`e-${i}`}>
//                     <PaginationEllipsis />
//                   </PaginationItem>
//                 ) : (
//                   <PaginationItem key={p}>
//                     <PaginationLink
//                       isActive={page === p}
//                       onClick={() => setPage(p as number)}
//                       style={
//                         page === p
//                           ? { background: BRAND, borderColor: BRAND, color: "#fff" }
//                           : undefined
//                       }
//                     >
//                       {p}
//                     </PaginationLink>
//                   </PaginationItem>
//                 )
//               )}
//               <PaginationItem>
//                 <PaginationNext
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   className={cn(page === totalPages && "pointer-events-none opacity-40")}
//                 />
//               </PaginationItem>
//             </PaginationContent>
//           </Pagination>
//         </div>
//       )}
//     </div>
//   );
// }