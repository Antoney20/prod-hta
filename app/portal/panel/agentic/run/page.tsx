"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Loader2, Search, RefreshCw, Play,
  CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cn } from "@/lib/utils";

import { EvidenceRow } from "@/types/new/decision-template";
import { GenerateResult } from "@/types/new/agentic";
import { listTargets } from "@/app/api/new/panel/template";
import { generateBatch } from "@/app/api/new/panel/agentic";
import ConfirmRunDialog from "../_shared/confirm";

const BRAND = "#27aae1";
const PER_PAGE = [25, 50, 75, 100] as const;
const ALL = "__all__";

const kindLabel = (k: string) =>
  k === "national_proposal" ? "National programme"
  : k === "intervention" ? "Intervention"
  : k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AppraisalRunPage() {
  const router = useRouter();

  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pkg, setPkg] = useState<string>(ALL);
  const [phase, setPhase] = useState<string>(ALL);
  const [kind, setKind] = useState<string>(ALL);
  const [perPage, setPerPage] = useState<number>(25);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  // filter option lists (derived from data — no hardcoded kinds)
  const packages = useMemo(
    () => [...new Set(rows.map((r) => r.package).filter(Boolean) as string[])].sort(),
    [rows]
  );
  const phases = useMemo(
    () => [...new Set(rows.map((r) => r.phase).filter(Boolean) as string[])].sort(),
    [rows]
  );
  const kinds = useMemo(
    () => [...new Set(rows.map((r) => r.kind))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (pkg !== ALL && (r.package ?? "") !== pkg) return false;
      if (phase !== ALL && (r.phase ?? "") !== phase) return false;
      if (kind !== ALL && r.kind !== kind) return false;
      if (q) {
        const hit =
          (r.name?.toLowerCase().includes(q) ?? false) ||
          (r.reference_number?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [rows, search, pkg, phase, kind]);

  useEffect(() => { setPage(1); }, [search, pkg, phase, kind, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  );
  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someFilteredSelected = filtered.some((r) => selected.has(r.id));

  const toggleAllFiltered = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allFilteredSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });

const openConfirm = () => {
  if (running) return;
  if (selected.size === 0) { toast.warning("Select at least one proposal."); return; }
  setConfirmOpen(true);
};

const run = async () => {
  setConfirmOpen(false);
  if (running) return;
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


  
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

  return (
    <div className="space-y-2">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Sparkles className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Appraisal Run</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Select proposals for the agent to appraise against the criteria scoring bands.
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading || running}
          className="rounded-lg border border-slate-200 p-2 disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Filter panel */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800">Filter proposals</h2>

        {/* Search */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Keyword or reference #"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Package">
            <Select value={pkg} onChange={setPkg}
              options={[{ v: ALL, l: "All packages" }, ...packages.map((p) => ({ v: p, l: p }))]} />
          </Field>
          <Field label="Phase">
            <Select value={phase} onChange={setPhase}
              options={[{ v: ALL, l: "All phases" }, ...phases.map((p) => ({ v: p, l: p }))]} />
          </Field>
          <Field label="Type">
            <Select value={kind} onChange={setKind}
              options={[{ v: ALL, l: "All types" }, ...kinds.map((k) => ({ v: k, l: kindLabel(k) }))]} />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Results per page</span>
          <div className="flex items-center gap-1">
            {PER_PAGE.map((n) => {
              const on = perPage === n;
              return (
                <button key={n} onClick={() => setPerPage(n)}
                  className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    on ? "border-transparent text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  style={on ? { background: BRAND } : undefined}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Count divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">
          <strong className="text-slate-700">{filtered.length}</strong> result{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          {rows.length === 0 ? "No appraisable proposals — none have a decision template yet." : "No matches for these filters."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="w-12 px-4 py-3">
                    <CheckBox
                      state={allFilteredSelected ? "on" : someFilteredSelected ? "mixed" : "off"}
                      onClick={toggleAllFiltered}
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Ref no.</th>
                  <th className="px-4 py-3 font-semibold">Intervention name</th>
                  <th className="px-4 py-3 font-semibold">Package</th>
                  <th className="px-4 py-3 font-semibold">Phase</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageRows.map((r) => {
                  const on = selected.has(r.id);
                  return (
                    <tr key={r.id} onClick={() => toggleOne(r.id)}
                      className={cn("cursor-pointer hover:bg-slate-50", on && "bg-sky-50/50")}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <CheckBox state={on ? "on" : "off"} onClick={() => toggleOne(r.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-sky-50 px-2 py-0.5 font-mono text-xs" style={{ color: BRAND }}>
                          {r.reference_number ?? "—"}
                        </span>
                      </td>
                      <td className="max-w-[320px] truncate px-4 py-3 text-sm text-slate-800">{r.name ?? "Untitled"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.package ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.phase ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {kindLabel(r.kind)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500">{r.criteria_count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing <strong className="text-slate-700">{from}–{to}</strong> of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky run bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-800">{selected.size}</span>
              <span className="text-slate-500">selected to appraise</span>
              {running && <span className="ml-2 text-xs text-amber-600">A run is in progress — please wait…</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())} disabled={running}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <X className="h-4 w-4" />
              </button>
              <button onClick={openConfirm} disabled={running}
  className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
  style={{ background: BRAND }}>
  {running
    ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</>
    : <><Play className="h-4 w-4" /> Run {selected.size}</>}
</button>
            </div>
          </div>
        </div>
      )}

{/* Results */}
{results && (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">Run complete</span>
        {(() => {
          const ok = results.filter((r) => r.success).length;
          const bad = results.length - ok;
          return (
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> {ok} scored
              </span>
              {bad > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">
                  <AlertCircle className="h-3 w-3" /> {bad} with issues
                </span>
              )}
            </div>
          );
        })()}
      </div>
      <button onClick={() => router.push("/portal/panel/agentic/results")}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
        style={{ background: BRAND }}>
        View all results <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>

    {/* Per-target outcome list */}
    <div className="divide-y divide-slate-50">
      {results.map((r, i) => {
        const row = rowById.get(r.target_id);
        return (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            {r.success
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              : <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{row?.name ?? r.target_id}</p>
              <p className="text-xs text-slate-400">
                {r.success
                  ? `Total ${r.total_score?.toFixed(2)} · ${r.scores.length} criteria`
                  : r.error ?? "Failed"}
              </p>
            </div>
            {r.success
              ? <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">Scored</span>
              : <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">Issue</span>}
          </div>
        );
      })}
    </div>

    <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-3 text-center">
      <button onClick={() => router.push("/portal/panel/agentic/results")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: BRAND }}>
        Review, verify and rank in Appraisal Results <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
)}


      <ConfirmRunDialog
  open={confirmOpen}
  count={selected.size}
  onCancel={() => setConfirmOpen(false)}
  onConfirm={run}
/>
    </div>
    
  );
}

/* ---- small local helpers (kept in-file, no new abstractions) ---- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400">
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function CheckBox({ state, onClick }: { state: "on" | "off" | "mixed"; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("flex h-4 w-4 items-center justify-center rounded border",
        state === "off" ? "border-slate-300 bg-white" : "border-transparent")}
      style={state !== "off" ? { background: BRAND } : undefined}>
      {state === "on" && <CheckCircle2 className="h-3 w-3 text-white" />}
      {state === "mixed" && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
    </button>
  );
}