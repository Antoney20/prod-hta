"use client";

import { useState } from "react";
import { FileText, Layers, Workflow } from "lucide-react";
import { EvidenceTarget } from "@/types/new/decision-template";
import { cellValue, CritCol, serviceOf, serviceRowsOf, visibleFields } from "./cols";

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap";
const THC = "px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap";
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
  const fixed = 5;
  const visible = new Map(columns.map((c) => [c.key, visibleFields(c, showAll)] as const));
  const colSpan = fixed + columns.reduce((n, c) => n + visible.get(c.key)!.length, 0);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            <th rowSpan={2} className={`${TH} min-w-80 border-r border-slate-100`}>Reference</th>
            <th rowSpan={2} className={`${TH} min-w-96 max-w-100 border-r border-slate-100`}>Name</th>
            <th rowSpan={2} className={`${TH} min-w-40`}>Package</th>
            <th rowSpan={2} className={`${TH} min-w-40`}>
              <span className="inline-flex items-center gap-1"> Service</span>
            </th>
            <th rowSpan={2} className={`${TH} min-w-40 border-r border-slate-200`}>Phase</th>
            {columns.map((c) => (
              <th key={c.key} colSpan={visible.get(c.key)!.length} title={c.name}
                className={`${THC} border-b border-l border-slate-100 text-center ${
                  c.kind === "descriptive" ? "min-w-72" : "max-w-40"
                }`}>
                {short(c.name)}
                <span className="ml-1 text-[8px] normal-case text-slate-300">
                  {c.kind === "descriptive" ? "desc" : "quant"}
                </span>
              </th>
            ))}
          </tr>
          <tr className="border-b border-slate-200">
            {columns.flatMap((c) =>
              visible.get(c.key)!.map((f, i) => (
                <th key={`${c.key}-${f}`} title={f}
                  className={`${THC} font-medium text-slate-400 ${i === 0 ? "border-l border-slate-100" : ""} ${
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
            rows.flatMap((t) => {
              const rowId = `${t.kind}-${t.id}`;
              const byName = new Map(
                t.criteria.map((c) => [c.criterion.trim().toLowerCase(), c] as const)
              );
              const service = serviceOf(t);
              const serviceRows = serviceRowsOf(t);
              const canExpand = serviceRows.length > 1;
              const isOpen = expanded.has(rowId);

              const mainRow = (
                <tr key={rowId} className="transition-colors hover:bg-slate-50/70">
                  <td className={`${TD} border-r border-slate-50`}>
                    <div className="flex items-start gap-2">
                      {canExpand ? (
                        <button
                          onClick={() => toggle(rowId)}
                          title={isOpen ? "Collapse services" : "Expand by service"}
                          aria-expanded={isOpen}
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
                        <button onClick={() => onOpen(t)}
                          className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1] hover:underline">
                          {t.reference_number || "—"}
                        </button>
                        <span className={`mt-1 block text-[10px] uppercase tracking-wide ${
                          t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
                        }`}>
                          {t.kind === "intervention" ? "Intervention" : "Program"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${TD} border-r border-slate-50 font-medium text-slate-800`}>
                    <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
                  </td>
                  <td className={`${TD} text-xs text-slate-600`}>{t.package || "—"}</td>
                  <td className={`${TD} text-xs`}>
                    {service === "No service" ? (
                      <span className="text-slate-300">No service</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-2 py-0.5 text-[#27aae1]">
                        {service}
                      </span>
                    )}
                  </td>
                  <td className={`${TD} border-r border-slate-100 text-xs text-slate-600`}>{t.phase || "—"}</td>
                  {columns.flatMap((c) => {
                    const cell = byName.get(c.key);
                    const desc = c.kind === "descriptive";
                    return visible.get(c.key)!.map((f, i) => {
                      const val = cell ? cellValue(cell.evidence?.[f]) : "";
                      return (
                        <td key={`${c.key}-${f}`}
                          className={`${TD} text-xs ${i === 0 ? "border-l border-slate-100" : ""} ${
                            desc ? "min-w-72 text-slate-700" : "max-w-40 truncate text-slate-600"
                          }`}
                          title={val || undefined}>
                          {val
                            ? desc
                              ? <p className="line-clamp-3 whitespace-pre-wrap">{val}</p>
                              : val
                            : <span className="text-slate-300">—</span>}
                        </td>
                      );
                    });
                  })}
                </tr>
              );

              if (!isOpen || !canExpand) return [mainRow];



const subRows = serviceRows.map((sr, si) => (
  <tr key={`${rowId}-svc-${si}`} className="bg-slate-100">
    {/* Reference — inherited from parent, indented + muted to mark a service row */}
    <td className={`${TD} border-r border-slate-50`}>
      <div className="flex items-start gap-2 pl-8">
        <span className="mt-1.5 h-4 w-px bg-slate-300" aria-hidden />
        <div>
          <span className="font-mono text-xs text-slate-500">{t.reference_number || "—"}</span>
          <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Service</span>
        </div>
      </div>
    </td>
    {/* Name — inherited from parent */}
    <td className={`${TD} border-r border-slate-50 font-medium text-slate-600`}>
      <p className="line-clamp-2 max-w-xs">{t.name || "—"}</p>
    </td>
    {/* Package — inherited from parent */}
    <td className={`${TD} text-xs text-slate-500`}>{t.package || "—"}</td>
    {/* Service — the only column that differs */}
    <td className={`${TD} text-xs`}>
      {sr.service === "No service" ? (
        <span className="text-slate-300">No service</span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-2 py-0.5 text-[#27aae1]">
          <Workflow className="h-3 w-3" /> {sr.service}
        </span>
      )}
    </td>
    {/* Phase — inherited from parent */}
    <td className={`${TD} border-r border-slate-100 text-xs text-slate-500`}>{t.phase || "—"}</td>
    {columns.flatMap((c) => {
      const ev = sr.evidence.get(c.key);
      const desc = c.kind === "descriptive";
      return visible.get(c.key)!.map((f, i) => {
        const val = ev ? cellValue(ev[f]) : "";
        return (
          <td key={`${rowId}-svc-${si}-${c.key}-${f}`}
            className={`${TD} text-xs ${i === 0 ? "border-l border-slate-100" : ""} ${
              desc ? "min-w-72 text-slate-700" : "max-w-40 truncate text-slate-600"
            }`}
            title={val || undefined}>
            {val
              ? desc
                ? <p className="line-clamp-3 whitespace-pre-wrap">{val}</p>
                : val
              : <span className="text-slate-300">—</span>}
          </td>
        );
      });
    })}
  </tr>
));

              return [mainRow, ...subRows];
            })
          )}
        </tbody>
      </table>
    </div>
  );
}