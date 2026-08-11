"use client";

import { FileText, Layers } from "lucide-react";
import { EvidenceTarget } from "@/types/new/decision-template";
import { cellValue, CritCol, visibleFields } from "./cols";

const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const THC = "px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

const short = (raw: string) => {
  const n = raw.trim().toLowerCase();
  if (n.includes("burden") && n.includes("mortality")) return "BOD-Mort";
  if (n.includes("burden") && n.includes("morbidity")) return "BOD-D";
  if (n.includes("access") && n.includes("healthcare")) return "Access";
  if (n.includes("budgetary") && n.includes("affordability")) return "Budgetary";
  if (n.includes("feasibility") && n.includes("implementation")) return "Feasibility";
  if (n.includes("incidence") && n.includes("occurrence")) return "Incidence";
  if (n.includes("catastrophic") && n.includes("expenditure")) return "Expenditure";
  if (n.includes("congruence") && n.includes("existing")) return "Congruence";
  return raw.trim();
};

export default function TargetsTable({
  rows, columns, loading, showAll, onOpen,
}: {
  rows: EvidenceTarget[];
  columns: CritCol[];
  loading: boolean;
  showAll: boolean;
  onOpen: (t: EvidenceTarget) => void;
}) {
  const fixed = 4;
  const visible = new Map(columns.map((c) => [c.key, visibleFields(c, showAll)] as const));
  const colSpan = fixed + columns.reduce((n, c) => n + visible.get(c.key)!.length, 0);

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th rowSpan={2} className={`${TH} min-w-80`}>Reference</th>
            <th rowSpan={2} className={`${TH} min-w-96 max-w-100`}>Name</th>
            <th rowSpan={2} className={`${TH} min-w-40`}>Package</th>
            <th rowSpan={2} className={`${TH} min-w-40`}>Phase</th>
            {columns.map((c) => (
              <th key={c.key} colSpan={visible.get(c.key)!.length} title={c.name}
                className={`${THC} border-l border-slate-200 text-center ${
                  c.kind === "descriptive" ? "min-w-72" : "max-w-40"
                }`}>
                {short(c.name)}
                <span className="ml-1 text-[9px] normal-case text-slate-300">
                  {c.kind === "descriptive" ? "desc" : "quant"}
                </span>
              </th>
            ))}
          </tr>
          <tr>
            {columns.flatMap((c) =>
              visible.get(c.key)!.map((f, i) => (
                <th key={`${c.key}-${f}`} title={f}
                  className={`${THC} ${i === 0 ? "border-l border-slate-200" : ""} ${
                    c.kind === "descriptive" ? "min-w-72" : "max-w-40"
                  }`}>
                  {f}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={colSpan} className="py-16 text-center text-sm text-slate-400">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={colSpan} className="py-16 text-center">
              <Layers className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">No targets with evidence yet.</p>
            </td></tr>
          ) : (
            rows.map((t) => {
              const byName = new Map(
                t.criteria.map((c) => [c.criterion.trim().toLowerCase(), c] as const)
              );
              return (
                <tr key={`${t.kind}-${t.id}`} className="transition-colors hover:bg-slate-50/70">
                  <td className={TD}>
                    <button onClick={() => onOpen(t)}
                      className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1] hover:underline">
                      {t.reference_number || "—"}
                    </button>
                    <span className={`mt-1 block text-[10px] uppercase tracking-wide ${
                      t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
                    }`}>
                      {t.kind === "intervention" ? "Intervention" : "Program"}
                    </span>
                  </td>
                  <td className={`${TD} font-medium text-slate-800`}>
                    <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
                  </td>
                  <td className={`${TD} text-xs text-slate-600`}>{t.package || "—"}</td>
                  <td className={`${TD} text-xs text-slate-600`}>{t.phase || "—"}</td>
                  {columns.flatMap((c) => {
                    const cell = byName.get(c.key);
                    const desc = c.kind === "descriptive";
                    return visible.get(c.key)!.map((f, i) => {
                      const val = cell ? cellValue(cell.evidence?.[f]) : "";
                      return (
                        <td key={`${c.key}-${f}`}
                          className={`${TD} text-xs ${i === 0 ? "border-l border-slate-100" : ""} ${
                            desc ? "min-w-72 whitespace-pre-wrap text-slate-700" : "max-w-40 truncate text-slate-600"
                          }`}
                          title={desc ? undefined : val}>
                          {val || <span className="text-slate-300">—</span>}
                        </td>
                      );
                    });
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}