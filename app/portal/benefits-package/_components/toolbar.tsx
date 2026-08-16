"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  phases: string[];
  phase: string;
  onPhase: (v: string) => void;
  rows: number;
  onRows: (n: number) => void;
}

export function ProposalsToolbar({ search, onSearch, phases, phase, onPhase, rows, onRows }: Props) {
  const sel = "h-9 rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input className="pl-9" placeholder="Search by name or reference…" value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-500">
        Phase
        <select className={sel} value={phase} onChange={(e) => onPhase(e.target.value)}>
          <option value="">All phases</option>
          {phases.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-500">
        Rows
        <select className={sel} value={rows} onChange={(e) => onRows(Number(e.target.value))}>
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}