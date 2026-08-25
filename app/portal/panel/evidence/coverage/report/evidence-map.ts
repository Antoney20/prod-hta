import { slug, type EvidenceSource } from "./helpers";

/* ------------------------------------------------------------------ *
 * Value specs — declarative, JSON-serialisable descriptions of a value.
 * The auto synthesis emits only `field` specs; the others remain available
 * so a section could still carry a ci / note / icd / const row if needed.
 * ------------------------------------------------------------------ */

export type ValueSpec =
  | { kind: "field"; path: string }
  | { kind: "ci"; value: string; ci: string }
  | { kind: "note"; paths: string[]; sep?: string }
  | { kind: "icd"; codes: string; name: string }
  | { kind: "const"; text: string };

export const f = (path: string): ValueSpec => ({ kind: "field", path });
export const ci = (value: string, c: string): ValueSpec => ({ kind: "ci", value, ci: c });
export const note = (paths: string[], sep?: string): ValueSpec => ({ kind: "note", paths, sep });
export const icd = (codes: string, name: string): ValueSpec => ({ kind: "icd", codes, name });
export const konst = (text: string): ValueSpec => ({ kind: "const", text });

/* ------------------------------------------------------------------ */

export interface RowSpec {
  label: string;
  value: ValueSpec;
}
export interface SubTable {
  caption?: string;
  rows: RowSpec[];
  gated?: boolean;
}
export interface ReportSection {
  id: string;
  title: string;
  tables: SubTable[];
  notes?: string[];
  emptyText?: string;
}

/* ------------------------------------------------------------------ *
 * GROUP ALIASES — canonical group slug -> criterion-name fragment sets.
 * The auto synthesis resolves by each criterion's exact slug and does not
 * need these; they're retained because resolve passes them to makeGetter,
 * so any future canonical-path lookup still resolves tolerantly.
 * ------------------------------------------------------------------ */

export const GROUP_ALIASES: Record<string, string[][]> = {
  clinical_effectiveness: [["clinical", "effectiveness"], ["clinical"]],
  safety: [["safety"]],
  quality: [["quality"]],
  burden_of_disease: [
    ["burden", "disease"], ["burden", "mortality"], ["burden", "morbidity"],
    ["burden"], ["incidence", "occurrence"], ["incidence"],
  ],
  access_to_healthcare: [["access", "healthcare"], ["access"], ["feasibility"]],
  cost_effectiveness: [["cost", "effectiveness"], ["cost", "utility"]],
  budget_impact: [["budget"], ["budgetary", "affordability"], ["budgetary"]],
  catastrophic_health_expenditure: [["catastrophic", "expenditure"], ["catastrophic"]],
  government_priorities: [["government", "priorities"], ["congruence", "existing"], ["congruence"]],
  equity: [["equity"]],
};

/* ================================================================== *
 * EVIDENCE SYNTHESIS — fully auto; one section per criterion.
 *
 * Every criterion in the payload becomes a section (including those with no
 * evidence yet — they render "No Data"). Every column in a criterion's
 * `headers` (or, absent a schema, every key in `data`) becomes a row, keyed
 * by the criterion's exact slug + column key, so resolveSection resolves each
 * path by exact match. No per-field wiring: add a criterion or a column on the
 * backend and it appears here with zero changes.
 * ================================================================== */

/** Repeated identity columns — surfaced in the report header, hidden per-row. */
const AUTO_IDENTITY = new Set([
  "intervention_name", "intervention", "intervention_ref", "intervention_ref_no",
  "intervention_code", "id", "name", "package", "package_name", "service",
]);

/** Display order for the 12 criteria, matched loosely by name fragments.
 *  Burden of Disease is split into mortality/morbidity; unknowns append. */
const AUTO_ORDER: string[][] = [
  ["clinical", "effectiveness"],
  ["safety"],
  ["quality"],
  ["burden", "mortality"],
  ["burden", "morbidity"],
  ["burden"],
  ["incidence"],
  ["population"],
  ["equity"],
  ["cost", "effectiveness"],
  ["budget"], ["budgetary"],
  ["feasibility"],
  ["catastrophic"],
  ["access"],
  ["congruence"], ["government"],
];

const autoTidy = (s: unknown) => String(s ?? "").replace(/\s*\n\s*/g, " ").trim();

function autoRank(name: string): number {
  const n = name.toLowerCase();
  for (let i = 0; i < AUTO_ORDER.length; i++) {
    if (AUTO_ORDER[i].every((frag) => n.includes(frag))) return i;
  }
  return AUTO_ORDER.length; // unknown → after known, original order preserved
}

export function buildSynthesisSections(src: EvidenceSource): ReportSection[] {
  const ordered = (src.criteria ?? [])
    .map((c, i) => ({ c, i }))
    .sort(
      (a, b) =>
        autoRank(a.c.criterion_name ?? "") - autoRank(b.c.criterion_name ?? "") ||
        a.i - b.i
    );

  return ordered.map(({ c }, idx) => {
    const name = autoTidy(c.criterion_name) || "Criterion";
    const group = slug(c.criterion_name);
    const headers = c.headers ?? [];

    const cols = headers.length
      ? headers.map((h) => ({ key: h.key, label: h.label }))
      : Object.keys(c.data ?? {}).map((k) => ({ key: k, label: k }));

    const rows: RowSpec[] = cols
      .filter((col) => !AUTO_IDENTITY.has(col.key))
      .map((col) => ({ label: autoTidy(col.label), value: f(`${group}.${col.key}`) }));

    return {
      id: `c${idx + 1}`,
      title: `Criterion ${idx + 1}: ${name}`,
      emptyText: "No Data",
      tables: [{ rows }],
    };
  });
}