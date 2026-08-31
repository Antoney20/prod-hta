"use client";

import { useState } from "react";
import { Layers, Workflow, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CriteriaAppraisalTool, PanelAppraisalScore } from "@/types/new/panel-score";
import { EvidenceTarget } from "@/types/new/decision-template";
import { collectServices, scopeScored, unitScored, unitsOf } from "../_lib/scoring";

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

function YesNo({ scored }: { scored: boolean }) {
  return scored ? (
    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] font-normal text-emerald-700">
      Yes
    </Badge>
  ) : (
    <Badge variant="outline" className="border-slate-200 bg-white text-[11px] font-normal text-slate-500">
      No
    </Badge>
  );
}

export default function PanelScoreTable({
  targets,
  criteria,
  scoreMap,
  loading,
  isFullyScored,
  onOpen,
}: {
  targets: EvidenceTarget[];
  criteria: CriteriaAppraisalTool[];
  scoreMap: Map<string, PanelAppraisalScore>;
  loading: boolean;
  isFullyScored: (t: EvidenceTarget) => boolean;
  onOpen: (target: EvidenceTarget, service?: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const actionBtn = (t: EvidenceTarget, scored: boolean, service?: string) => (
    <Button
      size="sm"
      variant={scored ? "outline" : "default"}
      className="h-7 gap-1 whitespace-nowrap text-xs"
      style={scored ? undefined : { backgroundColor: "#27aae1" }}
      onClick={() => onOpen(t, service)}
    >
      {scored ? (
        <>
          <Eye className="h-3 w-3" /> View
        </>
      ) : (
        <>
          Score <ChevronRight className="h-3 w-3" />
        </>
      )}
    </Button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className={`${TH} min-w-60`}>Reference</th>
            <th className={`${TH} min-w-80`}>Name</th>
            <th className={`${TH} min-w-44`}>Service</th>
            <th className={`${TH} min-w-20 text-center`}>Scored</th>
            <th className={`${TH} min-w-24 text-right`}>Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                Loading…
              </td>
            </tr>
          ) : targets.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-16 text-center">
                <Layers className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No targets match your filters.</p>
              </td>
            </tr>
          ) : (
            targets.flatMap((t) => {
              const rowId = `${t.kind}-${t.id}`;
              const services = collectServices(t);
              const canExpand = services.length > 0;
              const isOpen = expanded.has(rowId);
              const fully = isFullyScored(t);

              // scored/total across every scope (general + named services),
              // using the SAME lock signal as the Yes/No and the sub-rows.
              const units = unitsOf(t);
              const scoredUnits = units.filter((u) => scopeScored(scoreMap, t.id, u)).length;
              const totalUnits = units.length;

              const mainRow = (
                <tr key={rowId} className="transition-colors hover:bg-slate-50/70">
                  <td className={`${TD} border-r border-slate-50`}>
                    <div className="flex items-start gap-2">
                      {canExpand ? (
                        <button
                          onClick={() => toggle(rowId)}
                          aria-expanded={isOpen}
                          title={isOpen ? "Collapse services" : "Expand by service"}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition ${
                            isOpen
                              ? "border-transparent bg-[#27aae1] text-white"
                              : "border-slate-200 text-slate-400 hover:border-[#27aae1] hover:text-[#27aae1]"
                          }`}
                        >
                          <Workflow className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
                      )}
                      <div>
                        <button
                          onClick={() => onOpen(t)}
                          className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1] hover:underline"
                        >
                          {t.reference_number || "—"}
                        </button>
                        <span
                          className={`mt-1 block text-[10px] uppercase tracking-wide ${
                            t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
                          }`}
                        >
                          {t.kind === "intervention" ? "Intervention" : "Program"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${TD} font-medium text-slate-800`}>
                    <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
                  </td>
                  <td className={`${TD} text-xs`}>
                    <div className="flex items-center gap-2">
                      {canExpand ? (
                        <span className="text-slate-500">
                          General + {services.length} service{services.length === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-slate-300">No service</span>
                      )}
                      {totalUnits > 0 && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                            scoredUnits === totalUnits
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                          title={`${scoredUnits} of ${totalUnits} scope${totalUnits === 1 ? "" : "s"} scored`}
                        >
                          {scoredUnits}/{totalUnits}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`${TD} text-center`}>
                    <YesNo scored={fully} />
                  </td>
                  <td className={`${TD} text-right`}>{actionBtn(t, fully)}</td>
                </tr>
              );

              if (!isOpen || !canExpand) return [mainRow];

              const subRows = units.map((u, si) => {
                const scored = unitScored(scoreMap, t.id, u, criteria);
                const isGeneral = u === "";
                return (
                  <tr key={`${rowId}-u-${si}`} className="bg-slate-100">
                    <td className={`${TD} border-r border-slate-50`}>
                      <div className="flex items-start gap-2 pl-8">
                        <span className="mt-1.5 h-4 w-px bg-slate-300" aria-hidden />
                        <span className="font-mono text-xs text-slate-500">
                          {t.reference_number || "—"}
                        </span>
                      </div>
                    </td>
                    <td className={`${TD} font-medium text-slate-600`}>
                      <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
                    </td>
                    <td className={`${TD} text-xs`}>
                      {isGeneral ? (
                        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-500">
                          General
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-2 py-0.5 text-[#27aae1]">
                          <Workflow className="h-3 w-3" /> {u}
                        </span>
                      )}
                    </td>
                    <td className={`${TD} text-center`}>
                      <YesNo scored={scored} />
                    </td>
                    <td className={`${TD} text-right`}>
                      {actionBtn(t, scored, u || undefined)}
                    </td>
                  </tr>
                );
              });

              return [mainRow, ...subRows];
            })
          )}
        </tbody>
      </table>
    </div>
  );
}