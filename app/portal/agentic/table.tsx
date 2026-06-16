"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { AgenticEvidence } from "@/types/new/agentic";

type Metric = {
  field: string;
  raw?: string;
  value?: number;
  unit?: string;
  confidence?: "high" | "moderate" | "low";
  uncertain?: boolean;
  why?: string;
};

// acronyms that should render upper-cased in field/criterion labels
const ACRONYMS = new Set(["dalys", "qalys", "yll", "yld", "cfr", "che"]);

const humanize = (k: string) =>
  k.split("_").map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");

const fieldLabel = (f: string) => humanize(f);

// Known criterion labels. Anything not listed is humanized from its key, so the
// table grows automatically as the protocol adds criteria.
const CRITERION_LABELS: Record<string, string> = {
  clinical_effectiveness: "Clinical effectiveness",
  safety: "Safety",
  quality: "Quality",
  burden_of_disease: "Burden of disease",
  incidence: "Incidence or occurrence of disease",
  population: "Population",
  equity: "Equity",
  cost_effectiveness: "Cost-effectiveness",
  budgetary_impact: "Budgetary impact & affordability",
  feasibility: "Feasibility of implementation",
  catastrophic_expenditure: "Catastrophic health expenditure",
  access: "Access to healthcare",
  congruence: "Congruence with health-sector priorities",
};

// preferred display order; keys not listed fall to the end
const CRITERION_ORDER = Object.keys(CRITERION_LABELS);

const critLabel = (k: string) => CRITERION_LABELS[k] ?? humanize(k);

const orderCriteria = (keys: string[]) =>
  [...keys].sort((a, b) => {
    const ia = CRITERION_ORDER.indexOf(a);
    const ib = CRITERION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; // unknown -> after known
    if (ib === -1) return -1;
    return ia - ib;
  });

const metricsOf = (row: AgenticEvidence, crit: string) =>
  ((row.data as Record<string, Metric[]>)?.[crit] ?? []);

const itemOf = (row: AgenticEvidence, crit: string, field: string) =>
  metricsOf(row, crit).find((m) => m.field === field);

const display = (m: Metric) =>
  m.value != null ? `${m.value}${m.unit ? ` ${m.unit}` : ""}` : m.raw ?? "—";

// build the visible columns from the criterion groups + fields actually present
function deriveColumns(rows: AgenticEvidence[]) {
  const critKeys = new Set<string>();
  rows.forEach((r) =>
    Object.keys((r.data as Record<string, Metric[]>) ?? {}).forEach((k) => critKeys.add(k)),
  );

  return orderCriteria(Array.from(critKeys))
    .map((key) => {
      const fields = new Set<string>();
      rows.forEach((r) => metricsOf(r, key).forEach((m) => m?.field && fields.add(m.field)));
      return { key, label: critLabel(key), fields: Array.from(fields).sort() };
    })
    .filter((c) => c.fields.length > 0);
}

// ---- CSV export (two header rows: group labels, then field labels) ----
const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadEvidenceCsv(rows: AgenticEvidence[]) {
  const cols = deriveColumns(rows);
  const flat = cols.flatMap((c) => c.fields.map((f) => ({ crit: c.key, field: f })));

  const h1 = ["Intervention", "Kind", ...cols.flatMap((c) => c.fields.map(() => c.label))];
  const h2 = ["", "", ...flat.map((fc) => fieldLabel(fc.field))];
  const body = rows.map((r) => [
    r.intervention_ref ?? "",
    r.proposal_kind ?? "",
    ...flat.map((fc) => {
      const m = itemOf(r, fc.crit, fc.field);
      return m ? m.raw ?? display(m) : "";
    }),
  ]);

  const csv = [h1, h2, ...body].map((row) => row.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `agentic-evidence-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- detail popover (portal so the table's overflow can't clip it) ----
const CONF: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700",
  moderate: "bg-amber-100 text-amber-700",
  low: "bg-rose-100 text-rose-700",
};

function DetailPanel({ rect, item, onClose }: { rect: DOMRect; item: Metric; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  const width = 320;
  const left = Math.min(rect.left, window.innerWidth - width - 12);
  const top = rect.bottom + 6;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
        style={{ left, top, width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800">{fieldLabel(item.field)}</span>
          <button onClick={onClose} className="rounded p-0.5 text-slate-400 hover:bg-slate-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 space-y-1.5 text-sm">
          {item.raw && <div className="text-slate-700">{item.raw}</div>}
          <div className="flex flex-wrap items-center gap-1.5">
            {item.value != null && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                {item.value}{item.unit ? ` ${item.unit}` : ""}
              </span>
            )}
            {item.confidence && (
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${CONF[item.confidence]}`}>
                {item.confidence}
              </span>
            )}
            {item.uncertain && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                uncertain
              </span>
            )}
          </div>
          {item.why && <p className="pt-1 text-xs leading-relaxed text-slate-500">{item.why}</p>}
        </div>
      </div>
    </>
  );
}

function ValueCell({
  item,
  groupStart,
  onOpen,
}: {
  item?: Metric;
  groupStart: boolean;
  onOpen: (rect: DOMRect, m: Metric) => void;
}) {
  const border = groupStart ? "border-l border-slate-200" : "border-l border-slate-100";
  if (!item) return <td className={`px-3 py-2 text-center text-slate-300 ${border}`}>—</td>;
  return (
    <td className={`group/cell relative px-3 py-2 ${border} ${item.uncertain ? "bg-amber-50" : ""}`}>
      <span className={`text-sm ${item.uncertain ? "text-amber-700" : "text-slate-700"}`}>
        {display(item)}
      </span>
      <button
        onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect(), item)}
        title="Details"
        className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#27aae1] group-hover/cell:flex"
      >
        <Info className="h-4 w-4" />
      </button>
    </td>
  );
}

export function AgenticOutputTable({
  rows,
  allRows,
  page = 1,
  pageSize = 25,
}: {
  rows: AgenticEvidence[];
  allRows: AgenticEvidence[];
  page?: number;
  pageSize?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState<{ rect: DOMRect; item: Metric } | null>(null);
  useEffect(() => setMounted(true), []);

  // columns are derived from the full (filtered) set so they don't shift between pages
  const cols = useMemo(() => deriveColumns(allRows), [allRows]);
  const flat = useMemo(
    () => cols.flatMap((c) => c.fields.map((f, i) => ({ crit: c.key, field: f, groupStart: i === 0 }))),
    [cols],
  );

  if (!cols.length) {
    return <div className="py-20 text-center text-sm text-slate-400">No evidence yet.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50">
            <th rowSpan={2} className="sticky left-0 z-20 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              #
            </th>
            <th rowSpan={2} className="sticky left-[44px] z-20 border-r border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Intervention
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                colSpan={c.fields.length}
                className="border-l border-slate-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#1d70b8]"
              >
                {c.label}
              </th>
            ))}
          </tr>
          <tr className="bg-slate-50">
            {flat.map((fc) => (
              <th
                key={`${fc.crit}.${fc.field}`}
                className={`px-3 py-1.5 text-xs font-medium text-slate-500 ${fc.groupStart ? "border-l border-slate-200" : "border-l border-slate-100"}`}
              >
                {fieldLabel(fc.field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, idx) => {
            const n = (page - 1) * pageSize + idx + 1;
            const flagCount = r.flags?.length ?? 0;
            return (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs text-slate-400">{n}</td>
                <td className="sticky left-[44px] z-10 border-r border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{r.intervention_ref}</span>
                    {flagCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        {flagCount} flag{flagCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{r.proposal_kind}</span>
                </td>
                {flat.map((fc) => (
                  <ValueCell
                    key={`${r.id}.${fc.crit}.${fc.field}`}
                    item={itemOf(r, fc.crit, fc.field)}
                    groupStart={fc.groupStart}
                    onOpen={(rect, item) => setDetail({ rect, item })}
                  />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {mounted && detail &&
        createPortal(
          <DetailPanel rect={detail.rect} item={detail.item} onClose={() => setDetail(null)} />,
          document.body,
        )}
    </div>
  );
}