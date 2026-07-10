"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Loader2, Search, RefreshCw, Layers3, Package, Play,
  CheckCircle2, AlertCircle, ChevronRight, X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cn } from "@/lib/utils";

import { EvidenceRow } from "@/types/new/decision-template";
import { GenerateResult } from "@/types/new/agentic";
import { listTargets } from "@/app/api/new/panel/template";
import { generateBatch } from "@/app/api/new/panel/agentic";

const BRAND = "#27aae1";
const UNGROUPED = "__none__";
type GroupBy = "phase" | "package";

export default function AgenticWorkflowPage() {
  const router = useRouter();

  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("phase");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<GenerateResult[] | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listTargets()
      .then(setRows)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  // filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name?.toLowerCase().includes(q) ?? false) ||
        (r.reference_number?.toLowerCase().includes(q) ?? false)
    );
  }, [rows, search]);

  // group
  const groups = useMemo(() => {
    const map = new Map<string, EvidenceRow[]>();
    for (const r of filtered) {
      const key = (groupBy === "phase" ? r.phase : r.package) ?? UNGROUPED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === UNGROUPED) return 1;
      if (b === UNGROUPED) return -1;
      return a.localeCompare(b);
    });
  }, [filtered, groupBy]);

  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleGroup = (rows: EvidenceRow[]) =>
    setSelected((s) => {
      const next = new Set(s);
      const allIn = rows.every((r) => next.has(r.id));
      rows.forEach((r) => (allIn ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const selectAll = () =>
    setSelected((s) =>
      s.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))
    );

  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const run = async () => {
    if (running) return;                       // global lock — one run at a time
    if (selected.size === 0) { toast.warning("Select at least one proposal."); return; }

    setRunning(true);
    setResults(null);

    const targets = [...selected].map((id) => {
      const r = rowById.get(id)!;
      return { target_type: r.kind, target_id: r.id };
    });

    const res = await generateBatch(targets);
    setRunning(false);

    if (!res) { toast.error("Run failed."); return; }
    setResults(res.results);
    const ok = res.results.filter((r) => r.success).length;
    toast.success(`Completed ${res.count} — ${ok} scored, ${res.count - ok} with issues.`);
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className=" mx-auto  space-y-5">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Sparkles className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Agentic Workflow</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select interventions to run — by batch, package, or individually.
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading || running}
          className="p-2 border border-slate-200 rounded-lg disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or reference…"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          {/* group toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {([["phase", Layers3, "Phase"], ["package", Package, "Package"]] as const).map(([g, Icon, label]) => (
              <button key={g} onClick={() => setGroupBy(g)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md",
                  groupBy === g ? "bg-white shadow-sm" : "text-slate-500")}
                style={groupBy === g ? { color: BRAND } : undefined}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <button onClick={selectAll} className="font-medium hover:underline" style={{ color: BRAND }}>
            {allSelected ? "Clear all" : `Select all (${filtered.length})`}
          </button>
          <span><strong className="text-slate-700">{selected.size}</strong> selected</span>
        </div>
      </div>

      {/* Grouped list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          {rows.length === 0 ? "No appraisable proposals — none have a decision template yet." : "No matches."}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([groupName, groupRows]) => {
            const allIn = groupRows.every((r) => selected.has(r.id));
            const someIn = groupRows.some((r) => selected.has(r.id));
            return (
              <div key={groupName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <button onClick={() => toggleGroup(groupRows)} className="flex items-center gap-2.5">
                    <span className={cn("h-4 w-4 rounded border flex items-center justify-center",
                      allIn ? "border-transparent" : someIn ? "border-transparent" : "border-slate-300 bg-white")}
                      style={allIn || someIn ? { background: BRAND } : undefined}>
                      {allIn && <CheckCircle2 className="h-3 w-3 text-white" />}
                      {!allIn && someIn && <span className="h-1.5 w-1.5 bg-white rounded-sm" />}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {groupName === UNGROUPED ? `No ${groupBy}` : groupName}
                    </span>
                    <span className="text-[11px] text-slate-400">({groupRows.length})</span>
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {groupRows.map((r) => {
                    const on = selected.has(r.id);
                    return (
                      <button key={r.id} onClick={() => toggleOne(r.id)}
                        className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50", on && "bg-sky-50/40")}>
                        <span className={cn("h-4 w-4 rounded border flex items-center justify-center shrink-0",
                          on ? "border-transparent" : "border-slate-300 bg-white")}
                          style={on ? { background: BRAND } : undefined}>
                          {on && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </span>
                        <span className="font-mono text-xs shrink-0" style={{ color: BRAND }}>{r.reference_number ?? "—"}</span>
                        <span className="flex-1 text-sm text-slate-800 truncate">{r.name ?? "Untitled"}</span>
                        {r.kind === "national_proposal" && (
                          <span className="text-[9px] uppercase font-semibold px-1 py-0.5 rounded bg-indigo-50 text-indigo-600 shrink-0">Nat'l</span>
                        )}
                        <span className="text-[11px] text-slate-400 shrink-0">{r.criteria_count} criteria</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Run bar — sticky, shows the global lock */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-800">{selected.size}</span>
              <span className="text-slate-500">selected to run</span>
              {running && <span className="text-xs text-amber-600 ml-2">A run is in progress — please wait…</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())} disabled={running}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <X className="h-4 w-4" />
              </button>
              <button onClick={run} disabled={running}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: BRAND }}>
                {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : <><Play className="h-4 w-4" /> Run {selected.size}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-800">
            Run results ({results.length})
          </div>
          <div className="divide-y divide-slate-50">
            {results.map((r, i) => {
              const row = rowById.get(r.target_id);
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  {r.success
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{row?.name ?? r.target_id}</p>
                    <p className="text-xs text-slate-400">
                      {r.success
                        ? `Total ${r.total_score?.toFixed(2)} · ${r.scores.length} criteria`
                        : r.error ?? "Failed"}
                    </p>
                  </div>
                  {r.success && r.appraisal_id && (
                    <button onClick={() => router.push(`/portal/appraisal/ai-results/${r.appraisal_id}`)}
                      className="flex items-center gap-1 text-xs font-medium shrink-0" style={{ color: BRAND }}>
                      View <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}