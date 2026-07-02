"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { FilterState, PageSize } from "../utils/types";

interface InterventionFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  interventionTypes: string[];
  packages: string[];
  phases: string[];
  totalResults: number;
  totalAll: number;
}

function PageSizePill({
  size,
  active,
  onClick,
}: {
  size: PageSize;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 min-w-12 px-3 rounded border text-sm font-semibold transition-colors",
        active
          ? "bg-[#27aae1] border-[#27aae1] text-white"
          : "bg-white border-slate-300 text-slate-700 hover:border-[#27aae1] hover:text-[#27aae1]"
      )}
    >
      {size}
    </button>
  );
}

const PAGE_SIZES: PageSize[] = [25, 50, 75, 100];

// sentinel for "not assigned" so the Select value is never an empty string
const UNASSIGNED = "__none__";

export function InterventionFilterBar({
  filters,
  onFiltersChange,
  pageSize,
  onPageSizeChange,
  interventionTypes,
  packages,
  phases,
  totalResults,
  totalAll,
}: InterventionFilterBarProps) {
  const set = (patch: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search ||
    filters.interventionType !== "all" ||
    filters.package_name !== "all" ||
    filters.phase_name !== "all" ||
    filters.fromDate ||
    filters.toDate;

  return (
    <div className="space-y-3">
      {/* Header row with title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Filter results
          </span>
          {hasActiveFilters && (
            <span className="text-xs bg-[#27aae1] text-white px-2 py-0.5 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Search — full width */}
      <div>
        <Label className="text-xs text-slate-600 font-semibold">Search</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Keyword or reference #"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="pl-9 text-sm h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Package */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">Package</Label>
          <Select
            value={filters.package_name}
            onValueChange={(v) => set({ package_name: v })}
          >
            <SelectTrigger className="h-9 text-sm mt-1.5">
              <SelectValue placeholder="All packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              {packages.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phase */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">Phase</Label>
          <Select
            value={filters.phase_name}
            onValueChange={(v) => set({ phase_name: v })}
          >
            <SelectTrigger className="h-9 text-sm mt-1.5">
              <SelectValue placeholder="All phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All phases</SelectItem>
              {phases.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
              <SelectItem value={UNASSIGNED}>Not assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intervention Type */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">
            Intervention type
          </Label>
          <Select
            value={filters.interventionType}
            onValueChange={(v) => set({ interventionType: v })}
          >
            <SelectTrigger className="h-9 text-sm mt-1.5">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {interventionTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">From</Label>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => set({ fromDate: e.target.value })}
            className="h-9 text-sm mt-1.5"
          />
        </div>

        {/* To Date */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">To</Label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => set({ toDate: e.target.value })}
            className="h-9 text-sm mt-1.5"
          />
        </div>
      </div>

      {/* Row 2: Results per page */}
      <div className="flex items-center gap-4 pt-1">
        <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">
          Results per page
        </span>
        <div className="flex items-center gap-2">
          {PAGE_SIZES.map((s) => (
            <PageSizePill
              key={s}
              size={s}
              active={pageSize === s}
              onClick={() => onPageSizeChange(s)}
            />
          ))}
        </div>
      </div>

      {/* Results count bar */}
      <div className="flex items-center gap-2 pt-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500 whitespace-nowrap">
          <strong className="text-slate-700">{totalResults}</strong> result
          {totalResults !== 1 ? "s" : ""}
          {totalResults < totalAll && (
            <span className="text-[#27aae1] ml-1">
              (filtered from {totalAll})
            </span>
          )}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}