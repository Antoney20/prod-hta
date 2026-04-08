"use client";

import { Search, ArrowUpDown, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOrder = "score_desc" | "score_asc" | "az" | "za";

export interface WeightingFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (v: SortOrder) => void;
  shownCount: number;
  totalCount: number;
  // reviewer filter (individual tabs only)
  reviewers?: { id: string; label: string }[];
  selectedReviewer?: string;
  onReviewerChange?: (id: string) => void;
}

export function WeightingFilters({
  search,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
  shownCount,
  totalCount,
  reviewers,
  selectedReviewer,
  onReviewerChange,
}: WeightingFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search intervention…"
          className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-[#27aae1]/40"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <Select
          value={sortOrder}
          onValueChange={(v) => onSortOrderChange(v as SortOrder)}
        >
          <SelectTrigger className="h-9 w-44 text-sm bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Score: High → Low</SelectItem>
            <SelectItem value="score_asc">Score: Low → High</SelectItem>
            <SelectItem value="az">Name: A → Z</SelectItem>
            <SelectItem value="za">Name: Z → A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviewer filter */}
      {reviewers && reviewers.length > 0 && onReviewerChange && (
        <Select value={selectedReviewer} onValueChange={onReviewerChange}>
          <SelectTrigger className="h-9 w-56 text-sm bg-white border-slate-200">
            <SelectValue placeholder="All reviewers" />
          </SelectTrigger>
          <SelectContent>
            {reviewers.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Count */}
      <span className="text-xs text-slate-400 ml-auto tabular-nums whitespace-nowrap">
        Showing <strong className="text-slate-600">{shownCount}</strong> of {totalCount}
      </span>
    </div>
  );
}