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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { toast } from "react-toastify";

import { WeightingReportSuccess, AggregateRankingEntry } from "@/types/new/weighting";
import { WeightingFilters, SortOrder } from "./filters";
import { exportAggregateCSV } from "./export";
import { AdminOnly } from "@/app/context/role";


const BRAND = "#27aae1";
const PAGE_SIZES = [20, 30, 50, 100];

interface Props {
  report: WeightingReportSuccess;
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "bg-amber-100 text-amber-800 border-amber-300",
    2: "bg-slate-100 text-slate-700 border-slate-300",
    3: "bg-orange-100 text-orange-700 border-orange-300",
  };
  const cls = colors[rank] ?? "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold tabular-nums ${cls}`}>
      {rank}
    </span>
  );
}

export function AggregateTable({ report }: Props) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("score_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Collect all criteria names from average_scores
  const criteriaNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of report.average_scores) {
      for (const k of Object.keys(s.averaged_criteria)) names.add(k);
    }
    return Array.from(names).sort();
  }, [report.average_scores]);

  // Detail map: intervention_id → averaged_criteria
  const detailMap = useMemo(
    () => Object.fromEntries(report.average_scores.map((s) => [s.intervention_id, s])),
    [report.average_scores]
  );

  const filtered = useMemo(() => {
    let items = [...report.average_ranking];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.intervention_name.toLowerCase().includes(q));
    }
    if (sortOrder === "score_desc") items.sort((a, b) => b.value - a.value);
    else if (sortOrder === "score_asc") items.sort((a, b) => a.value - b.value);
    else if (sortOrder === "az") items.sort((a, b) => a.intervention_name.localeCompare(b.intervention_name));
    else if (sortOrder === "za") items.sort((a, b) => b.intervention_name.localeCompare(a.intervention_name));
    return items;
  }, [report.average_ranking, search, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const pageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <WeightingFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          sortOrder={sortOrder}
          onSortOrderChange={(v) => { setSortOrder(v); setCurrentPage(1); }}
          shownCount={filtered.length}
          totalCount={report.average_ranking.length}
        />

        <AdminOnly silent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" disabled={!filtered.length}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  exportAggregateCSV(report, filtered);
                  toast.success(`Exported ${filtered.length} interventions.`);
                }}
              >
                Export current view
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  exportAggregateCSV(report, report.average_ranking);
                  toast.success(`Exported all ${report.average_ranking.length} interventions.`);
                }}
              >
                Export all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </AdminOnly>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-max w-full text-sm">
          <TableHeader>
            {/* Group header */}
            <TableRow className="border-b-0">
              <TableHead
                colSpan={4}
                className="bg-slate-50 border-b border-slate-200 border-r border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400"
              >
                Intervention
              </TableHead>
              <TableHead
                colSpan={criteriaNames.length}
                className="text-center bg-sky-50 border-b border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: BRAND }}
              >
                Criteria — averaged weighted scores
              </TableHead>
            </TableRow>

            {/* Column headers */}
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="w-14 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-100">
                Rank
              </TableHead>
              <TableHead className="min-w-[220px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Intervention
              </TableHead>
              <TableHead className="w-24 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Reviewers
              </TableHead>
              <TableHead className="w-28 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-200 pr-4">
                Avg score
              </TableHead>
              {criteriaNames.map((name) => (
                <TableHead
                  key={name}
                  className="w-28 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-l border-slate-100 bg-sky-50/60"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block truncate max-w-[100px] mx-auto cursor-default line-clamp-2 whitespace-normal leading-tight">
                        {name}
                      </span>
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
                  No interventions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => {
                const detail = detailMap[row.intervention_id];
                return (
                  <TableRow
                    key={row.intervention_id}
                    className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="py-3 border-r border-slate-100 text-center">
                      <RankBadge rank={row.rank} />
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <p className="font-medium text-sm text-slate-800 leading-snug">
                        {row.intervention_name}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <span className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="tabular-nums font-medium">{row.reviewer_count}</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right align-middle border-r border-slate-200 pr-4">
                      <span className="tabular-nums text-sm font-bold text-slate-800">
                        {row.value.toFixed(4)}
                      </span>
                    </TableCell>
                    {criteriaNames.map((name) => {
                      const val = detail?.averaged_criteria?.[name];
                      return (
                        <TableCell
                          key={name}
                          className="text-center align-middle py-3 border-l border-slate-100 bg-sky-50/20 px-3"
                        >
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
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 ml-2 tabular-nums">
              {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {pageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? <PaginationEllipsis /> : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => { e.preventDefault(); setCurrentPage(Number(page)); }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}