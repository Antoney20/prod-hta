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
import { AgenticFilterState, PageSize } from "@/types/new/agentic";

interface AgenticFilterBarProps {
  filters: AgenticFilterState;
  onFiltersChange: (filters: AgenticFilterState) => void;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
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

export function AgenticFilterBar({
  filters,
  onFiltersChange,
  pageSize,
  onPageSizeChange,
  totalResults,
  totalAll,
}: AgenticFilterBarProps) {
  const set = (patch: Partial<AgenticFilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search || filters.kind !== "all" || filters.flaggedOnly;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Filter results</span>
          {hasActiveFilters && (
            <span className="text-xs bg-[#27aae1] text-white px-2 py-0.5 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">Search</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Intervention reference #"
              value={filters.search}
              onChange={(e) => set({ search: e.target.value })}
              className="pl-9 text-sm h-9"
            />
          </div>
        </div>

        {/* Kind */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">Source kind</Label>
          <Select
            value={filters.kind}
            onValueChange={(v) => set({ kind: v as AgenticFilterState["kind"] })}
          >
            <SelectTrigger className="h-9 text-sm mt-1.5">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="intervention">Intervention</SelectItem>
              <SelectItem value="program">Program</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flagged only */}
        <div>
          <Label className="text-xs text-slate-600 font-semibold">Review status</Label>
          <button
            type="button"
            onClick={() => set({ flaggedOnly: !filters.flaggedOnly })}
            className={cn(
              "mt-1.5 h-9 w-full rounded border text-sm font-medium transition-colors",
              filters.flaggedOnly
                ? "bg-[#fe7105]/10 border-[#fe7105]/30 text-[#fe7105]"
                : "bg-white border-slate-300 text-slate-700 hover:border-[#fe7105] hover:text-[#fe7105]"
            )}
          >
            {filters.flaggedOnly ? "Flagged only" : "Show all"}
          </button>
        </div>
      </div>

      {/* Results per page */}
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
            <span className="text-[#27aae1] ml-1">(filtered from {totalAll})</span>
          )}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}