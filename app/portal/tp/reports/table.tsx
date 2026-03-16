"use client";

import { useState, useMemo } from "react";
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
import { AlertCircle, XCircle, Users, Info, Layers } from "lucide-react";
import { InterventionReport } from "@/types/new/scoring";
import { useRouter } from "next/navigation";

const BRAND = "#27aae1";
const PAGE_SIZES = [25, 50, 75, 100];

// Canonical order + short display labels for criteria columns
const CRITERIA_SHORT: Record<string, string> = {
  "Clinical effectiveness, safety, and quality of the intervention.": "Clinical Effectiveness",
  "Clinical effectiveness safety and quality of the intervention": "Clinical Effectiveness",
  "Burden of disease": "Burden of Disease",
  "Population": "Population",
  "Equity": "Equity",
  "Cost-effectiveness": "Cost-effectiveness",
  "Cost effectiveness": "Cost-effectiveness",
  "Budgetary impact affordability of the intervention": "Budget Impact",
  "Feasibility of implementation of the intervention": "Feasibility",
  "Catastrophic health expenditure": "Catastrophic Expenditure",
  "Access to healthcare": "Access to Healthcare",
  "Congruence with existing priorities in the health sector UHC Kenya Health Policy": "Congruence w/ Priorities",
};

function shortLabel(name: string): string {
  return CRITERIA_SHORT[name] ?? name;
}

export interface ReportTableProps {
  items: InterventionReport[];
}

/** Sum a single criteria across ALL reviewers for one intervention */
function criteriaTotal(item: InterventionReport, criteriaName: string): number {
  return item.reviewers.reduce((sum, r) => {
    const cs = r.criteria_scores.find((c) => c.criteria_name === criteriaName);
    return sum + (cs?.score_value ?? 0);
  }, 0);
}



function CategoryPills({ categories }: { categories: string[] }) {
  if (!categories?.length)
    return <span className="text-slate-300 text-[10px] italic">—</span>;
  const short = (s: string) => s.replace(/\s*\(.*\)$/, "").trim();
  const [first, ...rest] = categories;
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border cursor-default leading-tight max-w-[120px] truncate"
            style={{ background: `${BRAND}10`, borderColor: `${BRAND}30`, color: BRAND }}
          >
            <Layers className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{short(first)}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{first}</TooltipContent>
      </Tooltip>
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded cursor-default">
              +{rest.length}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs space-y-0.5">
            {rest.map((c) => <p key={c}>{c}</p>)}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function ScoreCell({ value }: { value: number }) {
  return (
    <span className={`tabular-nums text-sm font-semibold ${value > 0 ? "text-slate-800" : "text-slate-300"}`}>
      {value > 0 ? value : "—"}
    </span>
  );
}

export function ReportTable({ items }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const router = useRouter();

  // Derive all unique criteria names in canonical order
  const allCriteria = useMemo(() => {
    const canonicalOrder = Object.keys(CRITERIA_SHORT);
    const found = new Set<string>();
    for (const iv of items)
      for (const r of iv.reviewers)
        for (const cs of r.criteria_scores)
          found.add(cs.criteria_name);

    return [
      ...canonicalOrder.filter((k) => found.has(k)),
      ...[...found].filter((k) => !canonicalOrder.includes(k)).sort(),
    ];
  }, [items]);

  const totalPages = Math.ceil(items.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  const pageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const colSpanTotal = 5 + allCriteria.length + 1;

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-max w-full text-sm">
          <TableHeader>
            {/* Column group header — splits fixed cols from criteria cols */}
            <TableRow className="border-b-0">
              <TableHead colSpan={5} className="bg-slate-50 border-b border-slate-200 border-r border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                Intervention
              </TableHead>
              <TableHead
                colSpan={allCriteria.length}
                className="text-center bg-sky-50 border-b border-slate-200 border-r border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: BRAND }}
              >
                Criteria Scores (all reviewers combined)
              </TableHead>
              <TableHead className="bg-slate-50 border-b border-slate-200 py-1.5" />
            </TableRow>

            {/* Column headers */}
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="sticky left-0 z-10 bg-slate-50 w-32 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-200 whitespace-nowrap">
                Reference
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">
                Intervention
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 min-w-[150px]">
                System Category
              </TableHead>
              <TableHead className="w-24 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                <span className="flex items-center gap-1">
                  Reviewers
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-slate-300" /></TooltipTrigger>
                    <TooltipContent>Scored / total reviewers</TooltipContent>
                  </Tooltip>
                </span>
              </TableHead>

              {/* One column per criteria */}
              {allCriteria.map((name) => (
                <TableHead
                  key={name}
                  className="w-28 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-l border-slate-100 bg-sky-50/60 whitespace-nowrap"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default block truncate max-w-[96px] mx-auto">
                        {shortLabel(name)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">{name}</TooltipContent>
                  </Tooltip>
                </TableHead>
              ))}

              {/* Grand total */}
              <TableHead className="w-20 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-l border-slate-200 bg-slate-100 whitespace-nowrap">
                <span className="flex items-center justify-center gap-1">
                  Total
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-slate-300" /></TooltipTrigger>
                    <TooltipContent>Sum of all criteria scores across all reviewers</TooltipContent>
                  </Tooltip>
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpanTotal} className="text-center py-16 text-slate-400 text-sm">
                  No interventions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => {
                const reviewersScored = item.reviewers.filter((r) => r.scored).length;
                return (
                  <TableRow
                    key={item.intervention_id}
                    className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0 group"
                  >
                    {/* Reference — sticky */}
                    <TableCell className="sticky left-0 z-20 bg-white align-middle border-r border-slate-100 py-3">
                      <button
                        onClick={() => router.push(`/portal/interventions/${item.intervention_id}`)}
                        className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                      >
                        {item.reference_number ?? "—"}
                      </button>
                    </TableCell>

                    {/* Name + type */}
                    <TableCell className="align-middle py-3">
                      <p className="font-medium text-sm text-slate-800 leading-snug">
                        {item.intervention_name}
                      </p>
                      {item.intervention_type && (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{item.intervention_type}</span>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="align-middle py-3">
                      <CategoryPills categories={item.system_categories ?? []} />
                    </TableCell>

                    {/* Reviewers */}
                    <TableCell className="align-middle py-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="tabular-nums">
                          <strong>{reviewersScored}</strong>
                          <span className="text-slate-400"> / {item.reviewers.length}</span>
                        </span>
                      </span>
                    </TableCell>

                    {/* Per-criteria totals */}
                    {allCriteria.map((name) => (
                      <TableCell key={name} className="text-center align-middle py-3 border-l border-slate-100 bg-sky-50/20 px-3">
                        <ScoreCell value={criteriaTotal(item, name)} />
                      </TableCell>
                    ))}

                    {/* Grand total */}
                    <TableCell className="text-center align-middle py-3 border-l border-slate-200 bg-slate-50">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {item.total_score}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 ml-2">
              Showing {start + 1}–{Math.min(start + pageSize, items.length)} of {items.length}
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
              {pageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? <PaginationEllipsis /> : (
                    <PaginationLink href="#" isActive={currentPage === page}
                      onClick={(e) => { e.preventDefault(); setCurrentPage(Number(page)); }}
                      className="cursor-pointer">{page}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}