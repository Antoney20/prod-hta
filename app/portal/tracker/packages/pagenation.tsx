"use client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PageSize = number | "all";
export const PAGE_SIZES: PageSize[] = [10, 20, 30, 50, "all"];

/** Bottom-right pager with page-size selector. 1-indexed. */
export function TablePagination({
  page, pageSize, total, onPage, onPageSize, sizes = PAGE_SIZES, className = "",
}: {
  page: number;
  pageSize: PageSize;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (s: PageSize) => void;
  sizes?: PageSize[];
  className?: string;
}) {
  const all = pageSize === "all";
  const size = all ? total || 1 : pageSize;
  const pages = Math.max(1, Math.ceil(total / size));

  const from = total === 0 ? 0 : all ? 1 : (page - 1) * size + 1;
  const to = all ? total : Math.min(page * size, total);

  // windowed numbers: max 5, centered on current
  const win = 5;
  let start = Math.max(1, page - Math.floor(win / 2));
  const end = Math.min(pages, start + win - 1);
  start = Math.max(1, end - win + 1);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-400">Rows</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(v === "all" ? "all" : Number(v))}>
          <SelectTrigger className="h-7 w-[68px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((s) => (
              <SelectItem key={String(s)} value={String(s)} className="text-xs">
                {s === "all" ? "All" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-xs text-slate-400">{from}–{to} of {total}</span>

      {!all && pages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1}
            onClick={() => onPage(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {nums.map((n) => (
            <Button key={n} size="icon"
              variant={n === page ? "default" : "outline"}
              className={`h-7 w-7 text-xs ${n === page ? "bg-[#27aae1] hover:bg-[#1d8fc3] text-white" : ""}`}
              onClick={() => onPage(n)}>
              {n}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pages}
            onClick={() => onPage(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}