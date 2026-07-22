"use client";
import {
  Eye, Trash2, CheckCircle2, Pencil, ChevronRight, ChevronDown, Workflow, MessageSquare, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgenticResultRow, AppraisalScoreResult } from "@/types/new/agentic-results";
import { scoreMapOf, latestOf, CritCol } from "../_shared/cols";
import { Fragment, useState } from "react";
import Link from "next/link";
import { AdminOnly } from "@/app/context/role";

const BRAND = "#27aae1";

interface Props {
  rows: AgenticResultRow[];
  columns: CritCol[];
  selected: Set<string>;
  onToggle: (appraisalId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onOpenScore: (s: AppraisalScoreResult) => void;
  onDeleteAppraisal: (appraisalId: string, label: string) => void;
  onSelectRun: (appraisalId: string, selected: boolean) => void;
  onComment: (appraisalId: string, label: string, current: string) => void;
  canDelete: boolean;
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

function YesNo({ yes, note }: { yes: boolean; note?: string }) {
  return yes ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
      Yes{note ? ` · ${note}` : ""}
    </span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">No</span>
  );
}

function SelectBtn({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
        on ? "border-transparent text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
      style={on ? { background: BRAND } : undefined}
      title={on ? "Selected for weighting — click to deselect" : "Select this run for weighting"}>
      {on ? <><Check className="h-3 w-3" /> Selected</> : "Select"}
    </button>
  );
}

function mapFor(scores: AppraisalScoreResult[]) {
  const m = new Map<string, AppraisalScoreResult>();
  for (const s of scores) m.set(s.criterion.trim().toLowerCase(), s);
  return m;
}

function Cell({ s, onOpen }: { s?: AppraisalScoreResult; onOpen: (s: AppraisalScoreResult) => void }) {
  if (!s) return <td className="px-3 py-3 text-center text-xs text-slate-300">—</td>;
  const val = s.effective_score ?? s.score;
  const scored = s.ok || s.effective_score != null;
  return (
    <td className="px-3 py-3">
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={cn("inline-flex min-w-[28px] items-center justify-center rounded px-2 py-0.5 text-xs font-semibold", !scored && "text-slate-300")}
          style={scored ? { background: `${BRAND}12`, color: BRAND } : undefined}>
          {val ?? "—"}
        </span>
        {s.edited && <Pencil className="h-3 w-3 text-amber-500" aria-label="Edited by panel" />}
        {s.verified && <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-label="Verified" />}
        <button onClick={() => onOpen(s)} className="text-slate-300 hover:text-slate-500" aria-label="View reasoning">
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  );
}

export default function ResultsTable({
  rows, columns, selected, onToggle, onToggleAll, allSelected, someSelected,
  onOpenScore, onDeleteAppraisal, onSelectRun, onComment, canDelete,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpand = (targetId: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(targetId) ? n.delete(targetId) : n.add(targetId); return n; });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 w-12 bg-slate-50/70 px-4 py-3">
                <CheckBox state={allSelected ? "on" : someSelected ? "mixed" : "off"} onClick={onToggleAll} />
              </th>
              <th className="sticky left-12 z-10 bg-slate-50/70 px-4 py-3 font-semibold">Ref no.</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Package</th>
              <th className="px-4 py-3 font-semibold">Phase</th>
              <th className="px-4 py-3 font-semibold">Selected</th>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-3 text-center font-semibold" title={c.name}>{c.label}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((r) => {
              const on = selected.has(r.latest_appraisal_id);
              const m = scoreMapOf(r);
              const latest = latestOf(r);
              const multi = r.appraisal_count > 1;
              const isOpen = expanded.has(r.target_id);

              // which run (if any) is selected for weighting — one per target
              const selIdx = r.appraisals.findIndex((a) => a.selected);
              const selectedRun = selIdx >= 0 ? r.appraisals[selIdx] : null;
              const selNum = selIdx >= 0 ? r.appraisals.length - selIdx : null;
              const latestSelected = !!latest?.selected;
              const selNote = selectedRun && !latestSelected ? `#${selNum}` : undefined;

              return (
                <Fragment key={r.target_id}>
                  <tr className={cn("hover:bg-slate-50/60", on && "bg-sky-50/40")}>
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3">
                      <CheckBox state={on ? "on" : "off"} onClick={() => onToggle(r.latest_appraisal_id)} />
                    </td>
                    <td className="sticky min-w-60 rounded px-2 py-1 font-mono text-xs text-[#27aae1] hover:underline">
                      <Link href={`/portal/panel/evidence/coverage/${r.target_id}`}>
                        <span className="rounded bg-sky-50 px-2 py-0.5 font-mono text-xs" style={{ color: BRAND }}>
                          {r.reference_number ?? "—"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[260px] truncate text-sm text-slate-800" title={r.name}>{r.name}</span>
                        {multi && (
                          <button onClick={() => toggleExpand(r.target_id)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-100"
                            title={`${r.appraisal_count} runs — expand to pick which one feeds weighting`}>
                            <Workflow className="h-3 w-3" />
                            {r.appraisal_count}
                            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.package ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.phase ?? "—"}</td>
                    <td className="px-4 py-3"><YesNo yes={!!selectedRun} note={selNote} /></td>
                    {columns.map((c) => <Cell key={c.key} s={m.get(c.key)} onOpen={onOpenScore} />)}

<td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminOnly silent>
                          {latest && (
                            <SelectBtn on={latestSelected}
                              onClick={() => onSelectRun(latest.id, !latestSelected)} />
                          )}
                        </AdminOnly>
                        {latest && (
                          <button onClick={() => onComment(latest.id, r.name, latest.final_comments ?? "")}
                            className={cn("rounded-lg p-1.5 hover:bg-slate-100",
                              latest.final_comments ? "text-[#27aae1]" : "text-slate-400 hover:text-slate-600")}
                            aria-label="Add or edit comment"
                            title={latest.final_comments ? "Edit comment" : "Add comment"}>
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        <AdminOnly silent>
                          {canDelete && latest && (
                            <button onClick={() => onDeleteAppraisal(latest.id, r.name)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              aria-label="Delete latest run">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </AdminOnly>
                      </div>
                    </td>

                  </tr>

                  {/* Branch rows — pick any specific run to feed weighting, not just the latest */}
                  {multi && isOpen && r.appraisals.map((ap, idx) => {
                    const am = mapFor(ap.scores);
                    const num = r.appraisals.length - idx;   // newest = highest #
                    const isLatest = idx === 0;
                    const isFirst = idx === 0;
                    const isLast = idx === r.appraisals.length - 1;
                    return (
                      <tr key={ap.id} className="bg-sky-50/50 hover:bg-sky-100/50"
                        style={{
                          boxShadow: [
                            isFirst ? `inset 0 2px 0 ${BRAND}30` : "",
                            isLast ? `inset 0 -2px 0 ${BRAND}30` : "",
                            `inset 2px 0 0 ${BRAND}30`,
                          ].filter(Boolean).join(", "),
                        }}>
                        <td className="sticky left-0 z-10 bg-sky-50/50 px-4 py-2.5" />
                        <td className="sticky left-12 z-10 bg-sky-50/50 px-4 py-2.5">
                          <span className="rounded bg-white/70 px-2 py-0.5 font-mono text-xs text-slate-400">
                            {r.reference_number ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold" style={{ color: BRAND }}>#{num}</span>
                            <span className="max-w-[200px] truncate text-sm text-slate-500" title={r.name}>{r.name}</span>
                            <span className="font-mono text-[11px] text-slate-400">{new Date(ap.created_at).toLocaleString()}</span>
                            {isLatest && (
                              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: BRAND }}>Latest</span>
                            )}
                            {!ap.success && (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Issue</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-400">{r.package ?? "—"}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-400">{r.phase ?? "—"}</td>
                        <td className="px-4 py-2.5"><YesNo yes={!!ap.selected} /></td>
                        {columns.map((c) => <Cell key={c.key} s={am.get(c.key)} onOpen={onOpenScore} />)}


<td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminOnly silent>
                              <SelectBtn on={!!ap.selected} onClick={() => onSelectRun(ap.id, !ap.selected)} />
                            </AdminOnly>
                            <button onClick={() => onComment(ap.id, `${r.name} — #${num}`, ap.final_comments ?? "")}
                              className={cn("rounded-lg p-1.5 hover:bg-white",
                                ap.final_comments ? "text-[#27aae1]" : "text-slate-400 hover:text-slate-600")}
                              aria-label="Add or edit comment"
                              title={ap.final_comments ? "Edit comment" : "Add comment"}>
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <AdminOnly silent>
                              {canDelete && (
                                <button onClick={() => onDeleteAppraisal(ap.id, `${r.name} — #${num}`)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                  aria-label={`Delete run #${num}`}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </AdminOnly>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}