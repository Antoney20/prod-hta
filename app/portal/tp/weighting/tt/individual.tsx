"use client";

import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

import { WeightingReportSuccess, ReviewerInterventionScore } from "@/types/new/weighting";
import { WeightingFilters, SortOrder } from "./filters";
import { exportIndividualXLSX } from "./export";

const BRAND = "#27aae1";
const PAGE_SIZES = [20, 30, 50, 100];

function RankBadge({ rank }: { rank: number }) {
  const cls =
    rank === 1 ? "bg-amber-100 text-amber-800 border-amber-300"
    : rank === 2 ? "bg-slate-100 text-slate-700 border-slate-300"
    : rank === 3 ? "bg-orange-100 text-orange-700 border-orange-300"
    : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold tabular-nums ${cls}`}>
      {rank}
    </span>
  );
}

function pageNumbers(total: number, current: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function buildReviewerOptions(report: WeightingReportSuccess) {
  const seen = new Set<string>();
  const opts: { id: string; label: string }[] = [];
  for (const r of report.reviewer_scores) {
    if (!seen.has(r.reviewer_id)) {
      seen.add(r.reviewer_id);
      opts.push({ id: r.reviewer_id, label: r.reviewer_email ?? r.reviewer_username ?? r.reviewer_id });
    }
  }
  return opts;
}

export function IndividualRankingTable({ report }: { report: WeightingReportSuccess }) {
  const reviewerOptions = useMemo(() => buildReviewerOptions(report), [report]);
  const [selectedId, setSelectedId] = useState(reviewerOptions[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("score_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const rankMap = useMemo(() => {
    const rr = report.reviewer_rankings.find((r) => r.reviewer_id === selectedId);
    return Object.fromEntries((rr?.ranked_interventions ?? []).map((e) => [e.intervention_id, e.rank]));
  }, [report.reviewer_rankings, selectedId]);

  const criteriaNames = useMemo(() => {
    const names = new Set<string>();
    for (const row of report.reviewer_scores)
      if (row.reviewer_id === selectedId)
        for (const k of Object.keys(row.weighted_criteria)) names.add(k);
    return Array.from(names).sort();
  }, [report.reviewer_scores, selectedId]);

  const filtered = useMemo(() => {
    let items: ReviewerInterventionScore[] = report.reviewer_scores.filter((r) => r.reviewer_id === selectedId);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.intervention_name.toLowerCase().includes(q) ||
          (r.intervention_reference?.toLowerCase().includes(q) ?? false)
      );
    }
    if (sortOrder === "score_desc") items.sort((a, b) => b.total_score - a.total_score);
    else if (sortOrder === "score_asc") items.sort((a, b) => a.total_score - b.total_score);
    else if (sortOrder === "az") items.sort((a, b) => a.intervention_name.localeCompare(b.intervention_name));
    else if (sortOrder === "za") items.sort((a, b) => b.intervention_name.localeCompare(a.intervention_name));
    return items;
  }, [report.reviewer_scores, selectedId, search, sortOrder]);

  const totalForReviewer = report.reviewer_scores.filter((r) => r.reviewer_id === selectedId).length;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-4">
      {/* Filter + export */}
      <div className="flex items-center gap-3 flex-wrap">
        <WeightingFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          sortOrder={sortOrder}
          onSortOrderChange={(v) => { setSortOrder(v); setCurrentPage(1); }}
          shownCount={filtered.length}
          totalCount={totalForReviewer}
          reviewers={reviewerOptions}
          selectedReviewer={selectedId}
          onReviewerChange={(id) => { setSelectedId(id); setSearch(""); setCurrentPage(1); }}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!filtered.length}
          onClick={async () => { await exportIndividualXLSX(report); toast.success("Exported individual scores."); }}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-max w-full text-sm">
          <TableHeader>
            <TableRow className="border-b-0">
              <TableHead colSpan={4} className="bg-slate-50 border-b border-slate-200 border-r border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                Intervention
              </TableHead>
              <TableHead
                colSpan={criteriaNames.length}
                className="text-center bg-sky-50 border-b border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: BRAND }}
              >
                Criteria — weighted scores (raw × weight)
              </TableHead>
            </TableRow>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="w-14 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-100 px-4">Rank</TableHead>
              <TableHead className="w-36 text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-4">Ref No.</TableHead>
              <TableHead className="min-w-[220px] text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-4">Intervention</TableHead>
              <TableHead className="w-28 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-200 px-4">Total score</TableHead>
              {criteriaNames.map((name) => (
                <TableHead key={name} className="w-28 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-l border-slate-100 bg-sky-50/60 px-3 py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block cursor-default line-clamp-2 whitespace-normal leading-tight max-w-[96px] mx-auto">{name}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">{name}</TooltipContent>
                  </Tooltip>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4 + criteriaNames.length} className="text-center py-16 text-slate-400 text-sm">
                  {totalForReviewer === 0 ? "This reviewer has no recorded scores." : "No interventions match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => {
                const rank = rankMap[row.intervention_id];
                return (
                  <TableRow key={row.intervention_id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0">
                    <TableCell className="py-3 px-4 border-r border-slate-100 text-center">
                      {rank != null ? <RankBadge rank={rank} /> : <span className="text-slate-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="py-3 px-4 align-middle">
                      <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
                        {row.intervention_reference ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 align-middle">
                      <p className="font-medium text-sm text-slate-800 leading-snug">{row.intervention_name}</p>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right align-middle border-r border-slate-200">
                      <span className="tabular-nums text-sm font-bold text-slate-800">{row.total_score.toFixed(4)}</span>
                    </TableCell>
                    {criteriaNames.map((name) => {
                      const val = row.weighted_criteria[name];
                      return (
                        <TableCell key={name} className="text-center align-middle py-3 px-3 border-l border-slate-100 bg-sky-50/20">
                          <span className={`tabular-nums text-sm font-semibold ${val != null && val > 0 ? "text-slate-800" : "text-slate-300"}`}>
                            {val != null && val > 0 ? val.toFixed(4) : "—"}
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 ml-2 tabular-nums">
              {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
              {pageNumbers(totalPages, currentPage).map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? <PaginationEllipsis /> : (
                    <PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); setCurrentPage(Number(page)); }} className="cursor-pointer">{page}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}