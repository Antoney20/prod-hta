"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { DecisionTemplate, DecisionBand } from "@/types/new/decision-template";


const TH = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

const bandText = (b: DecisionBand): string => {
  if (b.combo) return b.combo.join(" · ");
  if (b.op) {
    const v = Array.isArray(b.value) ? b.value.join("–") : b.value;
    return `${b.op} ${v}`;
  }
  return b.label ?? "—";
};

interface CritCol {
  key: string;
  name: string;
  kind: string;
  features: string[];   // sub-columns; falls back to ["score"] when none
}

export default function DecisionCriteriaTable({ template }: { template: DecisionTemplate }) {
  const [search, setSearch] = useState("");

  // build criterion columns for this one template
  const columns: CritCol[] = useMemo(() => {
    const cols = (template.criteria ?? []).map((c) => ({
      key: c.criterion,
      name: c.criterion_name,
      kind: c.kind,
      features: (c.target_fields ?? []).length ? [...c.target_fields] : ["score"],
    }));
    // search filters which criterion columns show
    const q = search.trim().toLowerCase();
    if (!q) return cols;
    return cols.filter(
      (c) => c.name.toLowerCase().includes(q) || c.features.some((f) => f.toLowerCase().includes(q)),
    );
  }, [template, search]);

  const cellFor = (critId: string) =>
    (template.criteria ?? []).find((c) => c.criterion === critId) ?? null;

  const colSpanTotal = 3 + columns.reduce((a, c) => a + c.features.length, 0);

  return (
    <div className="space-y-3">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Filter criteria or features…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        {/* <Button variant="outline" size="sm" onClick={() => exportDecision(template)}>
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button> */}
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          {/* ── two-row header ── */}
          <thead className="border-b border-slate-200 bg-slate-50">
            {/* row 1: identity cols (rowspan) + criterion names (colspan over features) */}
            <tr>
              <th rowSpan={2} className={`${TH} sticky left-0 z-10 min-w-40 bg-slate-50`}>Intervention</th>
              <th rowSpan={2} className={`${TH} w-32`}>Package / Batch</th>
              <th rowSpan={2} className={`${TH} w-28`}>Phase</th>
              {columns.map((c) => (
                <th key={c.key} colSpan={c.features.length}
                  className={`${TH} border-l border-slate-200 text-center`}>
                  <div className="flex items-center justify-center gap-1.5">
                    {c.name}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      c.kind === "quantitative" ? "bg-[#27aae1]/10 text-[#27aae1]" : "bg-amber-50 text-amber-700"
                    }`}>
                      {c.kind?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
            {/* row 2: per-criterion feature / score sub-columns */}
            <tr>
              {columns.map((c) =>
                c.features.map((f, i) => (
                  <th key={`${c.key}-${f}-${i}`}
                    className={`px-2 py-1 text-left text-[10px] font-medium text-slate-400 ${i === 0 ? "border-l border-slate-200" : ""}`}>
                    {f}
                  </th>
                )),
              )}
            </tr>
          </thead>

          {/* ── single data row: this template's target ── */}
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/70">
              {/* identity */}
              <td className={`${TD} sticky left-0 z-10 bg-white`}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-[#27aae1]">{template.reference_number || template.name}</span>
                  <span className="line-clamp-2 text-xs font-medium text-slate-700">{template.target_name}</span>
                  <span className={`text-[9px] uppercase ${template.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"}`}>
                    {template.kind === "intervention" ? "Intervention" : "Program"}
                  </span>
                </div>
              </td>
              <td className={`${TD} text-xs text-slate-500`}>{template.package_name ?? "—"}</td>
              <td className={`${TD} text-xs text-slate-500`}>{template.phase_name ?? "—"}</td>

              {/* per criterion → per feature cells */}
              {columns.map((col) => {
                const c = cellFor(col.key);
                return col.features.map((f, i) => {
                  const bands = (c?.selected_bands ?? []).filter(
                    (b) => !b.field || b.field === f || col.features[0] === "score",
                  );
                  return (
                    <td key={`${col.key}-${f}-${i}`}
                      className={`${TD} ${i === 0 ? "border-l border-slate-100" : ""}`}>
                      {!c ? (
                        <span className="text-xs text-slate-300">—</span>
                      ) : bands.length ? (
                        <div className="flex flex-col gap-1">
                          {bands.map((b, bi) => (
                            <div key={bi} className="flex items-center gap-1.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#27aae1] text-[10px] font-semibold text-white">
                                {b.score}
                              </span>
                              <span className="line-clamp-2 text-[11px] text-slate-600" title={bandText(b)}>
                                {b.label ?? bandText(b)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : c.kind === "descriptive" ? (
                        <span className="text-[11px] text-amber-600">pending review</span>
                      ) : (
                        <span className="text-[11px] text-slate-300">no match</span>
                      )}
                    </td>
                  );
                });
              })}
            </tr>

            {/* score summary row */}
            <tr className="bg-slate-50/60">
              <td className={`${TD} sticky left-0 z-10 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400`}>
                Score
              </td>
              <td className={TD} />
              <td className={TD} />
              {columns.map((col) => {
                const c = cellFor(col.key);
                return (
                  <td key={`score-${col.key}`} colSpan={col.features.length}
                    className={`${TD} border-l border-slate-100 text-center`}>
                    {c?.score != null ? (
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#27aae1] px-2 text-sm font-bold text-white">
                        {c.score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}