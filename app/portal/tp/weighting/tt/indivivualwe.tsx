"use client";

import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

import {
  WeightingReportSuccess, ReviewerWeightingResult,
  CriteriaWeighting, CriteriaStdDev, InterventionNormalised,
} from "@/types/new/weighting";
import { WeightingFilters } from "./filters";

const BRAND = "#27aae1";
const PAGE_SIZES = [20, 30, 50, 100];
type SubTab = "weightings" | "std_devs" | "normalisation" | "conflict" | "pearson";
const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "weightings", label: "Weightings" },
  { key: "std_devs", label: "Std deviations" },
  { key: "normalisation", label: "Normalisation" },
  { key: "conflict", label: "Conflict matrix" },
  { key: "pearson", label: "Pearson matrix" },
];

function pageNumbers(total: number, current: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function CriteriaHeader({ name }: { name: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block cursor-default line-clamp-2 whitespace-normal leading-tight max-w-[90px] mx-auto">
          {name}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{name}</TooltipContent>
    </Tooltip>
  );
}

// ── Weightings ────────────────────────────────────────────────────────────────

function WeightingsTable({ rows }: { rows: CriteriaWeighting[] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
      <Table className="min-w-max w-full text-sm">
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            {["Criteria", "Std dev", "Sum conflict", "Product", "Sum products", "Weight", "Weight %"].map((h, i) => (
              <TableHead key={h} className={cn("text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-2 px-4 whitespace-nowrap", i === 0 && "min-w-[240px]")}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.criteria_name} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-0">
              <TableCell className="py-3 px-4 font-medium text-slate-800">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block truncate cursor-default max-w-[240px]">{row.criteria_name}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">{row.criteria_name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="py-3 px-4 tabular-nums text-slate-700">{row.std_dev.toFixed(4)}</TableCell>
              <TableCell className="py-3 px-4 tabular-nums text-slate-700">{row.sum_of_conflict.toFixed(4)}</TableCell>
              <TableCell className="py-3 px-4 tabular-nums text-slate-700">{row.product.toFixed(4)}</TableCell>
              <TableCell className="py-3 px-4 tabular-nums text-slate-700">{row.sum_of_products.toFixed(4)}</TableCell>
              <TableCell className="py-3 px-4 tabular-nums text-slate-700">{row.weight.toFixed(4)}</TableCell>
              <TableCell className="py-3 px-4">
                <span className="tabular-nums font-bold text-slate-800">{row.weight_percentage.toFixed(2)}%</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Std devs ──────────────────────────────────────────────────────────────────

function StdDevTable({ rows }: { rows: CriteriaStdDev[] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-2 px-4">Criteria</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-2 px-4 text-right">Std dev (σ)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.criteria_name} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-0">
              <TableCell className="py-3 px-4 text-slate-800">{row.criteria_name}</TableCell>
              <TableCell className="py-3 px-4 text-right tabular-nums text-slate-700 font-medium">{row.std_dev.toFixed(6)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Normalisation ─────────────────────────────────────────────────────────────

function NormalisationTable({ rows, page, pageSize }: { rows: InterventionNormalised[]; page: number; pageSize: number }) {
  const criteriaNames = rows[0]?.normalised.map((n) => n.criteria_name) ?? [];
  const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
      <Table className="min-w-max w-full text-sm">
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className="bg-slate-50 border-b border-slate-200 border-r border-slate-200 py-1.5 px-4 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Intervention
            </TableHead>
            <TableHead
              colSpan={criteriaNames.length}
              className="text-center bg-sky-50 border-b border-slate-200 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: BRAND }}
            >
              Normalised values
            </TableHead>
          </TableRow>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-2 px-4 min-w-[220px] border-r border-slate-200">
              Intervention
            </TableHead>
            {criteriaNames.map((c) => (
              <TableHead key={c} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-l border-slate-100 bg-sky-50/60 w-28 py-2 px-3">
                <CriteriaHeader name={c} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.intervention_id} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-0">
              <TableCell className="py-3 px-4 font-medium text-slate-800 border-r border-slate-100">
                {row.intervention_name}
              </TableCell>
              {row.normalised.map((cell) => (
                <TableCell key={cell.criteria_name} className="text-center py-3 px-3 border-l border-slate-100 bg-sky-50/20">
                  <span className={cn("tabular-nums text-sm font-semibold", cell.normalised_value != null ? "text-slate-800" : "text-slate-300")}>
                    {cell.normalised_value != null ? cell.normalised_value.toFixed(4) : "—"}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Matrix (conflict / pearson) ───────────────────────────────────────────────

function MatrixTable({
  criteriaNames,
  getCellValue,
  getRowSum,
  showSum,
}: {
  criteriaNames: string[];
  getCellValue: (row: string, col: string) => number;
  getRowSum?: (row: string) => number;
  showSum?: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
      <Table className="min-w-max w-full text-sm">
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-2 px-4 min-w-[200px] border-r border-slate-200">
              Criteria
            </TableHead>
            {criteriaNames.map((c) => (
              <TableHead key={c} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-l border-slate-100 bg-sky-50/60 w-24 py-2 px-2">
                <CriteriaHeader name={c} />
              </TableHead>
            ))}
           
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteriaNames.map((rowName) => (
            <TableRow key={rowName} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-0">
              <TableCell className="py-3 px-4 font-medium text-slate-800 border-r border-slate-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block truncate cursor-default max-w-[200px]">{rowName}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">{rowName}</TooltipContent>
                </Tooltip>
              </TableCell>
              {criteriaNames.map((colName) => {
                const val = getCellValue(rowName, colName);
                const isSelf = rowName === colName;
                return (
                  <TableCell key={colName} className={cn("text-center py-3 px-2 border-l border-slate-100", isSelf ? "bg-slate-50" : "bg-sky-50/10")}>
                    <span className={cn("tabular-nums text-sm font-semibold", isSelf ? "text-slate-400" : "text-slate-800")}>
                      {val.toFixed(4)}
                    </span>
                  </TableCell>
                );
              })}
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function IndividualWeighting({ data }: { data: WeightingReportSuccess }) {
  const reviewerOptions = useMemo(
    () => data.reviewer_results.map((r) => ({
      id: r.reviewer_id,
      label: r.reviewer_email ?? r.reviewer_username ?? r.reviewer_id,
    })),
    [data]
  );

  const [selectedId, setSelectedId] = useState(reviewerOptions[0]?.id ?? "");
  const [subTab, setSubTab] = useState<SubTab>("weightings");
  const [normPage, setNormPage] = useState(1);
  const [normPageSize, setNormPageSize] = useState(20);

  const reviewer = useMemo(
    () => data.reviewer_results.find((r) => r.reviewer_id === selectedId),
    [data.reviewer_results, selectedId]
  );

  const criteriaNames = reviewer?.weightings.map((w) => w.criteria_name) ?? [];

  const pearsonMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const row of reviewer?.pearson_matrix ?? []) {
      m[row.criteria_name] = Object.fromEntries(row.correlations.map((c) => [c.criteria_name, c.coefficient]));
    }
    return m;
  }, [reviewer]);

  const conflictData = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    const sums: Record<string, number> = {};
    for (const row of reviewer?.conflict_matrix ?? []) {
      m[row.criteria_name] = Object.fromEntries(row.conflicts.map((c) => [c.criteria_name, c.conflict_value]));
      sums[row.criteria_name] = row.sum_of_conflict;
    }
    return { m, sums };
  }, [reviewer]);

  const normTotalPages = Math.ceil((reviewer?.normalisation_report.length ?? 0) / normPageSize);

  return (
    <div className="space-y-4">
      {/* Reviewer selector using WeightingFilters — hides search/sort via dummy props */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-600 font-medium">Reviewer</span>
        <Select value={selectedId} onValueChange={(id) => { setSelectedId(id); setNormPage(1); }}>
          <SelectTrigger className="h-9 w-64 text-sm bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reviewerOptions.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">
          {reviewerOptions.length} reviewer{reviewerOptions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {!reviewer ? (
        <p className="text-sm text-slate-400 text-center py-10">No data for this reviewer.</p>
      ) : (
        <>
          {/* Sub-tab bar */}
          <div className="flex border-b border-slate-200 gap-0 overflow-x-auto">
            {SUB_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setSubTab(t.key)}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                  subTab === t.key
                    ? "border-[#27aae1] text-[#27aae1]"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {subTab === "weightings" && <WeightingsTable rows={reviewer.weightings} />}
          {subTab === "std_devs" && <StdDevTable rows={reviewer.standard_deviations} />}

          {subTab === "normalisation" && (
            <div className="space-y-3">
              <NormalisationTable rows={reviewer.normalisation_report} page={normPage} pageSize={normPageSize} />
              {reviewer.normalisation_report.length > normPageSize && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Per page:</span>
                    <Select value={normPageSize.toString()} onValueChange={(v) => { setNormPageSize(Number(v)); setNormPage(1); }}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (normPage > 1) setNormPage(normPage - 1); }} className={normPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      {pageNumbers(normTotalPages, normPage).map((p, i) => (
                        <PaginationItem key={i}>
                          {p === "..." ? <PaginationEllipsis /> : (
                            <PaginationLink href="#" isActive={normPage === p} onClick={(e) => { e.preventDefault(); setNormPage(Number(p)); }} className="cursor-pointer">{p}</PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (normPage < normTotalPages) setNormPage(normPage + 1); }} className={normPage === normTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}

          {subTab === "conflict" && (
            <MatrixTable
              criteriaNames={criteriaNames}
              getCellValue={(row, col) => conflictData.m[row]?.[col] ?? 0}
              getRowSum={(row) => conflictData.sums[row] ?? 0}
              showSum
            />
          )}

          {subTab === "pearson" && (
            <MatrixTable
              criteriaNames={criteriaNames}
              getCellValue={(row, col) => pearsonMap[row]?.[col] ?? 0}
            />
          )}
        </>
      )}
    </div>
  );
}