"use client";

import { useState } from "react";
import { Search, Layers, ChevronRight, ChevronDown, PanelLeftClose } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PackageGroup } from "../_lib/proposal";

interface Props {
  groups: PackageGroup[];
  total: number;
  phases: string[];
  selected: string;
  onSelect: (key: string) => void;
  phaseFilter: string;
  onPhase: (p: string) => void;
  onCollapse?: () => void;
}

const Pill = ({ n, active }: { n: number; active?: boolean }) => (
  <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${
    active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>{n}</span>
);

export function PackageRail({
  groups, total, phases, selected, onSelect, phaseFilter, onPhase, onCollapse,
}: Props) {
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState(false);
  const shown = groups.filter((g) => g.label.toLowerCase().includes(q.trim().toLowerCase()));

  const Row = ({ k, label, n }: { k: string; label: string; n: number }) => {
    const active = selected === k;
    const unassigned = label === "Unassigned";
    return (
      <button onClick={() => onSelect(k)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          active ? "bg-[#27aae1] text-white" : "text-slate-700 hover:bg-slate-50"}`}>
        <span className={`truncate ${active ? "font-semibold" : ""} ${unassigned && !active ? "italic text-slate-400" : ""}`}>{label}</span>
        <Pill n={n} active={active} />
      </button>
    );
  };

  return (
    <aside className="space-y-3 rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Packages</p>
        {onCollapse && (
          <button onClick={onCollapse} className="text-slate-400 hover:text-[#27aae1]" title="Collapse">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input className="h-9 pl-9" placeholder="Filter packages…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="max-h-[64vh] space-y-1 overflow-auto pr-1">
        <Row k="all" label="All Proposals" n={total} />
        {shown.map((g) => <Row key={g.key} k={g.key} label={g.label} n={g.count} />)}

        {phases.length > 0 && (
          <div className="pt-2">
            <button onClick={() => setOpenCats((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hover:bg-slate-50">
              <Layers className="h-3.5 w-3.5" />System Categories
              {openCats ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
            {openCats && (
              <div className="mt-1 space-y-0.5 pl-2">
                <button onClick={() => onPhase("")}
                  className={`block w-full rounded px-3 py-1.5 text-left text-xs ${phaseFilter === "" ? "bg-[#27aae1]/10 text-[#1d70b8]" : "text-slate-500 hover:bg-slate-50"}`}>
                  All phases
                </button>
                {phases.map((p) => (
                  <button key={p} onClick={() => onPhase(p)}
                    className={`block w-full rounded px-3 py-1.5 text-left text-xs capitalize ${phaseFilter === p ? "bg-[#27aae1]/10 text-[#1d70b8]" : "text-slate-500 hover:bg-slate-50"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}