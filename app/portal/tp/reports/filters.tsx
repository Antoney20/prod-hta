"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOrder = "score_desc" | "score_asc" | "az" | "za";

export interface ReportFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
  shownCount: number;
  totalCount: number;
}

export function ReportFilters({
  search,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  shownCount,
  totalCount,
}: ReportFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-50 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or reference…"
          className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-[#27aae1]/40"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <Select value={sortOrder} onValueChange={(v) => onSortOrderChange(v as SortOrder)}>
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

      {/* Category */}
      {categories.length > 0 && (
        <Select
          value={categoryFilter || "__all__"}
          onValueChange={(v) => onCategoryFilterChange(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-64 text-sm bg-white border-slate-200 truncate">
            <SelectValue placeholder="All system categories" />
          </SelectTrigger>
          <SelectContent className="max-w-xs">
            <SelectItem value="__all__">All system categories</SelectItem>
            <SelectItem value="__none__">— No category assigned</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="whitespace-normal text-xs leading-snug py-2">
                {cat}
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