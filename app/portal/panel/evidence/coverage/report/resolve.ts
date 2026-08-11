/**
 * report/resolve.ts
 * ------------------------------------------------------------------
 * The engine. Consumes the editable map (evidence-map.ts) + a data source,
 * and produces a plain render model the React layer walks. No JSX here.
 *
 * The map says WHAT to show; helpers say HOW to combine values; this file
 * ties them together and holds the handful of procedural computations that
 * don't fit a declarative spec (effect summary, GRADE bucketing, ...).
 */

import {
  NA_LABEL,
  bucketOutcome,
  cleanVal,
  combineCi,
  combineIcd,
  combineNote,
  detectDatabases,
  extraDatabases,
  flattenEvidence,
  isAffirmative,
  isPresent,
  makeGetter,
  type EvidenceSource,
  type Getter,
  type GradeOutcome,
} from "./helpers";
import {
  GROUP_ALIASES,
  SUBMISSION_BLOCKS,
  SYNTHESIS_SECTIONS,
  type ComputationId,
  type FormBlock,
  type MatchSpec,
  type ReportSection,
  type SubTable,
  type ValueSpec,
} from "./evidence-map";

/* ------------------------------------------------------------------ *
 * Procedural computations referenced by `computed(id)` in the map.
 * Add new ones here and expose the id in ComputationId.
 * ------------------------------------------------------------------ */

const COMPUTATIONS: Record<ComputationId, (get: Getter) => string | null> = {
  studiesMetaN: (get) =>
    combineCi(get("clinical_effectiveness.studies_included"), get("clinical_effectiveness.studies_meta")),

  effectSummary: (get) => {
    const parts: string[] = [];
    const add = (label: string, v: unknown, c: unknown) => {
      const combined = combineCi(v, c);
      if (isPresent(combined)) parts.push(`${label}=${combined}`);
    };
    add("Survival", get("clinical_effectiveness.survival_rate"), get("clinical_effectiveness.survival_rate_ci"));
    add("HR", get("clinical_effectiveness.hazard_ratio"), get("clinical_effectiveness.hazard_ratio_ci"));
    add("OR", get("clinical_effectiveness.odds_ratio"), get("clinical_effectiveness.odds_ratio_ci"));
    add("RR", get("clinical_effectiveness.relative_risk"), get("clinical_effectiveness.relative_risk_ci"));
    return parts.length ? parts.join("; ") : null;
  },

  limitations: (get) => {
    let out = combineNote(
      get("clinical_effectiveness.heterogeneity"),
      get("clinical_effectiveness.heterogeneity_explanation")
    );
    out = combineNote(out, get("clinical_effectiveness.notes_clinical_effect_est"));
    return out;
  },
};

/* ------------------------------------------------------------------ *
 * Value resolution.
 * ------------------------------------------------------------------ */

export function resolveValue(spec: ValueSpec, get: Getter): string | null {
  switch (spec.kind) {
    case "field":
      return isPresent(get(spec.path)) ? String(get(spec.path)).trim() : null;
    case "ci":
      return combineCi(get(spec.value), get(spec.ci));
    case "note":
      return spec.paths.reduce<string | null>(
        (acc, p, i) => (i === 0 ? (isPresent(get(p)) ? String(get(p)).trim() : null) : combineNote(acc, get(p), spec.sep)),
        null
      );
    case "icd":
      return combineIcd(get(spec.codes), get(spec.name));
    case "const":
      return spec.text;
    case "computed":
      return COMPUTATIONS[spec.id](get);
  }
}

/* ------------------------------------------------------------------ *
 * Render model — what the component actually walks.
 * ------------------------------------------------------------------ */

export interface RenderRow {
  label: string;
  value: string; // already cleanVal'd -> may be NA_LABEL
  present: boolean;
}
export interface RenderTable {
  caption?: string;
  rows: RenderRow[];
}
export interface RenderSection {
  id: string;
  title: string;
  tables: RenderTable[]; // empty => render emptyText
  notes: string[];
  emptyText: string;
  hasData: boolean;
}

function resolveTable(t: SubTable, get: Getter): RenderTable | null {
  const rows: RenderRow[] = t.rows.map((r) => {
    const raw = resolveValue(r.value, get);
    return { label: r.label, value: cleanVal(raw), present: isPresent(raw) };
  });
  if (t.gated && !rows.some((r) => r.present)) return null;
  return { caption: t.caption, rows };
}

export function resolveSection(section: ReportSection, get: Getter): RenderSection {
  const tables = section.tables
    .map((t) => resolveTable(t, get))
    .filter((t): t is RenderTable => t !== null);
  const hasData = tables.some((t) => t.rows.some((r) => r.present));
  return {
    id: section.id,
    title: section.title,
    tables,
    notes: section.notes ?? [],
    emptyText: section.emptyText ?? NA_LABEL,
    hasData,
  };
}

/* ------------------------------------------------------------------ *
 * Submission form resolution (checkbox / text rows).
 * ------------------------------------------------------------------ */

export interface RenderFormRow {
  label: string;
  kind: "text" | "options";
  text?: string; // for text rows
  options?: Array<{ label: string; checked: boolean }>;
  suffix?: string;
}
export interface RenderFormBlock {
  id: string;
  title: string;
  intro?: string;
  rows: RenderFormRow[];
}

function matchChecked(match: MatchSpec, options: string[], get: Getter): Set<string> {
  const checked = new Set<string>();
  if (match.kind === "affirmative") {
    const aff = isAffirmative(get(match.path));
    if (aff === true) checked.add("Yes");
    else if (aff === false) checked.add("No");
  } else if (match.kind === "databases") {
    for (const db of detectDatabases(get(match.path))) checked.add(db);
  } else {
    const v = cleanVal(get(match.path)).toLowerCase();
    for (const o of options) if (o.toLowerCase() === v) checked.add(o);
  }
  return checked;
}

export function resolveFormBlock(block: FormBlock, get: Getter): RenderFormBlock {
  const rows: RenderFormRow[] = block.rows.map((row) => {
    if (row.kind === "text") {
      return { label: row.label, kind: "text", text: cleanVal(resolveValue(row.value, get)) };
    }
    // Databases: check the standard options present in the comma-separated
    // list (case-insensitive) AND append any non-standard source verbatim so
    // nothing entered in the data is lost.
    if (row.match.kind === "databases") {
      const raw = get(row.match.path);
      const detected = new Set(detectDatabases(raw));
      const options = [
        ...row.options.map((o) => ({ label: o, checked: detected.has(o) })),
        ...extraDatabases(raw).map((e) => ({ label: e, checked: true })),
      ];
      return { label: row.label, kind: "options", options, suffix: row.suffix };
    }
    const checked = matchChecked(row.match, row.options, get);
    return {
      label: row.label,
      kind: "options",
      options: row.options.map((o) => ({ label: o, checked: checked.has(o) })),
      suffix: row.suffix,
    };
  });
  return { id: block.id, title: block.title, intro: block.intro, rows };
}

/* ------------------------------------------------------------------ *
 * GRADE profile (A.3) — one row per outcome, filled by bucketing the
 * clinical outcome. Kept here because it's genuinely procedural.
 * ------------------------------------------------------------------ */

export interface GradeRow {
  outcome: GradeOutcome;
  studies: string;
  design: string;
  effect: string;
}

const GRADE_OUTCOMES: GradeOutcome[] = [
  "Mortality",
  "Morbidity",
  "Quality of life",
  "Serious adverse events",
];

export function resolveGrade(get: Getter): GradeRow[] {
  const bucket = bucketOutcome(get("clinical_effectiveness.outcome"));
  const design = cleanVal(get("clinical_effectiveness.study_design"));
  const studies = cleanVal(COMPUTATIONS.studiesMetaN(get));
  const effect = cleanVal(COMPUTATIONS.effectSummary(get));
  return GRADE_OUTCOMES.map((o) =>
    o === bucket
      ? { outcome: o, studies, design, effect }
      : { outcome: o, studies: "", design: "", effect: "" }
  );
}

/* ------------------------------------------------------------------ *
 * Top-level build.
 * ------------------------------------------------------------------ */

export interface ReportMeta {
  name: string;
  reference: string;
  package: string;
  kind: string;
  justification: string | null;
}

export interface ReportModel {
  meta: ReportMeta;
  synthesis: RenderSection[];
  submission: RenderFormBlock[];
  grade: GradeRow[];
  keyEvidence: {
    design: string;
    outcome: string;
    effect: string;
    limitations: string;
    hasRow: boolean;
  };
}

export function buildReport(src: EvidenceSource): ReportModel {
  const flat = flattenEvidence(src);
  const get = makeGetter(flat, GROUP_ALIASES);

  const meta: ReportMeta = {
    name: cleanVal(src.name),
    reference: cleanVal(src.reference_number),
    package: cleanVal(src.package?.name),
    kind: src.kind === "intervention" ? "Intervention" : "National Program",
    justification: isPresent(get("intervention.justification"))
      ? String(get("intervention.justification"))
      : null,
  };

  const design = cleanVal(get("clinical_effectiveness.study_design"));
  const outcome = cleanVal(get("clinical_effectiveness.outcome"));
  const effect = cleanVal(COMPUTATIONS.effectSummary(get));
  const limitations = cleanVal(COMPUTATIONS.limitations(get));
  const hasRow = [design, outcome, effect, limitations].some((v) => v !== NA_LABEL);

  return {
    meta,
    synthesis: SYNTHESIS_SECTIONS.map((s) => resolveSection(s, get)),
    submission: SUBMISSION_BLOCKS.map((b) => resolveFormBlock(b, get)),
    grade: resolveGrade(get),
    keyEvidence: { design, outcome, effect, limitations, hasRow },
  };
}