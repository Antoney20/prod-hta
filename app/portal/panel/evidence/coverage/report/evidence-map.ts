import { DATABASE_OPTIONS, slug, type EvidenceSource } from "./helpers";

/* ------------------------------------------------------------------ *
 * Value specs — declarative, JSON-serialisable descriptions of a value.
 * ------------------------------------------------------------------ */

export type ValueSpec =
  | { kind: "field"; path: string }
  | { kind: "ci"; value: string; ci: string }
  | { kind: "note"; paths: string[]; sep?: string }
  | { kind: "icd"; codes: string; name: string }
  | { kind: "const"; text: string }
  | { kind: "computed"; id: ComputationId };

export type ComputationId = "effectSummary" | "limitations" | "studiesMetaN";

export const f = (path: string): ValueSpec => ({ kind: "field", path });
export const ci = (value: string, c: string): ValueSpec => ({ kind: "ci", value, ci: c });
export const note = (paths: string[], sep?: string): ValueSpec => ({ kind: "note", paths, sep });
export const icd = (codes: string, name: string): ValueSpec => ({ kind: "icd", codes, name });
export const konst = (text: string): ValueSpec => ({ kind: "const", text });
export const computed = (id: ComputationId): ValueSpec => ({ kind: "computed", id });

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
 * GROUP ALIASES — used by the flat getter for the PART 2 submission Forms
 * (whose paths are canonical). PART 1 uses each criterion's exact slug, so
 * it does not depend on these.
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
 * PART 1 — EVIDENCE SYNTHESIS  (fully auto; one section per criterion)
 *
 * Every criterion in the payload becomes a section — including the ones
 * with no evidence yet (they render "No Data"). Every column in a
 * criterion's `headers` (or, absent a schema, every key in `data`)
 * becomes a row, keyed by the criterion's exact slug + column key, so
 * resolveSection resolves each path by exact match. No per-field wiring.
 * ================================================================== */

/** Repeated identity columns — shown in the report header, hidden per-row. */
const AUTO_IDENTITY = new Set([
  "intervention_name", "intervention", "intervention_ref", "intervention_ref_no",
  "intervention_code", "id", "name", "package", "package_name", "service",
]);

/** Display order, matched loosely by criterion-name fragments; unknowns append. */
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

/* ================================================================== *
 * PART 2 — HTA SUBMISSION REPORT  (unchanged)
 * ================================================================== */

export type MatchSpec =
  | { kind: "affirmative"; path: string }
  | { kind: "equals"; path: string }
  | { kind: "databases"; path: string };

export const affirmative = (path: string): MatchSpec => ({ kind: "affirmative", path });
export const equals = (path: string): MatchSpec => ({ kind: "equals", path });
export const databases = (path: string): MatchSpec => ({ kind: "databases", path });

export interface FormText {
  kind: "text";
  label: string;
  value: ValueSpec;
}
export interface FormOptions {
  kind: "options";
  label: string;
  options: string[];
  match: MatchSpec;
  suffix?: string;
}
export type FormRow = FormText | FormOptions;

export interface FormBlock {
  id: string;
  title: string;
  intro?: string;
  rows: FormRow[];
}

export const SUBMISSION_BLOCKS: FormBlock[] = [
  {
    id: "a1",
    title: "A.1 Systematic Review or Literature Search",
    rows: [
      {
        kind: "options",
        label: "Did you conduct a systematic review?",
        options: ["Yes", "No"],
        match: affirmative("clinical_effectiveness.conducted_sr"),
        suffix: "(explain: _______)",
      },
      { kind: "text", label: "Search date(s)", value: f("clinical_effectiveness.search_date") },
      {
        kind: "options",
        label: "Databases searched (check all)",
        options: DATABASE_OPTIONS,
        match: databases("clinical_effectiveness.databases"),
        suffix: "Other: ______",
      },
      { kind: "text", label: "Number of studies identified", value: f("clinical_effectiveness.studies_identified") },
      { kind: "text", label: "Number of studies included", value: f("clinical_effectiveness.studies_included") },
    ],
  },
  {
    id: "b1",
    title: "B.1 / B.2 Economic Evaluation Setup",
    rows: [
      { kind: "text", label: "Type of economic evaluation", value: f("cost_effectiveness.economic_evaluation_type") },
      { kind: "text", label: "Model type", value: note(["cost_effectiveness.model_type", "cost_effectiveness.model_type_other"]) },
      { kind: "text", label: "Time horizon", value: note(["cost_effectiveness.time_horizon", "cost_effectiveness.time_horizon_other"]) },
      { kind: "text", label: "Currency", value: f("cost_effectiveness.currency") },
      { kind: "text", label: "Perspective", value: note(["cost_effectiveness.perspective", "cost_effectiveness.perspective_other"]) },
    ],
  },
  {
    id: "b5",
    title: "B.5 Cost-Effectiveness Results (Base case)",
    rows: [
      { kind: "text", label: "Incremental cost (KES)", value: f("cost_effectiveness.ce_incremental_cost") },
      { kind: "text", label: "Incremental effect (DALYs/QALYs)", value: f("cost_effectiveness.ce_incremental_effect") },
      { kind: "text", label: "ICER (KES per DALY/QALY)", value: f("cost_effectiveness.ce_icer") },
      { kind: "text", label: "Cost-effectiveness threshold", value: f("cost_effectiveness.ce_threshold") },
    ],
  },
  {
    id: "b6",
    title: "B.6 Budget Impact Analysis (Year 1)",
    rows: [
      { kind: "text", label: "Eligible population", value: f("budget_impact.bi_year1_eligible_population") },
      { kind: "text", label: "Target coverage (%)", value: f("budget_impact.bi_year1_target_coverage_pct") },
      { kind: "text", label: "Number treated", value: f("budget_impact.bi_year1_number_treated") },
      { kind: "text", label: "Total cost (KES)", value: f("budget_impact.bi_year1_total_cost_kes") },
      { kind: "text", label: "Current cost (KES)", value: f("budget_impact.bi_year1_current_cost_kes") },
      { kind: "text", label: "Incremental budget (KES)", value: f("budget_impact.bi_year1_incremental_budget_kes") },
    ],
  },
  {
    id: "c1eq",
    title: "C.1 Equity Impact Assessment",
    intro: "The Kenya HTA process explicitly recognizes equity as a priority-setting criterion.",
    rows: [
      { kind: "text", label: "Regional localization (R)", value: f("equity.equity_r") },
      { kind: "text", label: "Number of patients (N)", value: f("equity.equity_n") },
      { kind: "text", label: "Socio-economic equity (E)", value: f("equity.equity_e") },
      {
        kind: "options",
        label: "Protects from catastrophic health expenditure?",
        options: ["Yes", "No", "Uncertain"],
        match: equals("equity.equity_che_impact"),
        suffix: "(explain: _______)",
      },
      { kind: "text", label: "Equity judgment", value: f("equity.equity_judgment") },
      { kind: "text", label: "Notes", value: f("equity.equity_notes") },
    ],
  },
  {
    id: "c2feas",
    title: "C.2 Feasibility Assessment",
    rows: [
      { kind: "text", label: "Service availability (%)", value: f("access_to_healthcare.service_availability_pct") },
      { kind: "text", label: "Readiness to offer service (%)", value: f("access_to_healthcare.readiness_pct") },
      { kind: "text", label: "Geographic accessibility < 120 min (availability)", value: f("access_to_healthcare.geo_accessibility_availability") },
      { kind: "text", label: "Geographic accessibility < 120 min (readiness)", value: f("access_to_healthcare.geo_accessibility_readiness") },
      { kind: "text", label: "Comments", value: f("access_to_healthcare.access_notes") },
    ],
  },
];