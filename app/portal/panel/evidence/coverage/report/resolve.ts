import {
  NA_LABEL,
  bucketOutcome,
  cleanVal,
  collectDuplicateRecords,
  combineCi,
  combineIcd,
  combineNote,
  detectDatabases,
  extraDatabases,
  flattenEvidence,
  isAffirmative,
  isPresent,
  makeGetter,
  slug,
  type DuplicateGroup,
  type EvidenceInstance,
  type EvidenceSource,
  type Getter,
  type GradeOutcome,
} from "./helpers";
import {
  GROUP_ALIASES,
  SUBMISSION_BLOCKS,
  buildSynthesisSections,
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
 * Budget Impact (B.6) — multi-year, tabbed. Read directly off the
 * budget criterion's evidence records rather than through the flat
 * getter, because the year fields are too numerous/positional to spell
 * out as flat form rows. One tabbed block is emitted per record, so a
 * criterion carrying more than one uploaded record repeats the table.
 * ------------------------------------------------------------------ */

export interface BudgetYear {
  year: number;
  rows: RenderRow[];
  hasData: boolean;
}
export interface BudgetRecord {
  label: string; // "A"/"B"/… when >1 record, else ""
  years: BudgetYear[];
  costBasis: RenderRow[];
  summary: RenderRow[];
  offsets: RenderRow[];
  judgment: RenderRow[];
  hasData: boolean;
}
export interface BudgetImpactModel {
  records: BudgetRecord[];
  hasData: boolean;
}

// [label, field-key suffix] — combined with `year_{N}_` per year.
const BUDGET_YEAR_FIELDS: Array<[string, string]> = [
  ["Eligible Population", "eligible_population"],
  ["Target Coverage (%)", "target_coverage"],
  ["Number Treated", "number_treated"],
  ["Total Cost (KES)", "total_cost_kes"],
  ["Current Cost (KES)", "current_cost_kes"],
  ["Incremental Budget (KES)", "incremental_budget_kes"],
];

const BUDGET_COST_BASIS: Array<[string, string]> = [
  ["Service", "service"],
  ["Est. Target Population", "est_target_population"],
  ["Obs. Morbidity", "obs_morbidity"],
  ["Coverage (%)", "coverage"],
  ["TDABC Unit Cost (KES)", "tdabc_unit_cost_kes"],
  ["TDABC Tariff (KES)", "tdabc_tariff_kes"],
  ["Optimised Tariff (KES)", "optimised_tariff_kes"],
  ["SHA Current Tariff (KES)", "sha_current_tariff_kes"],
];

const BUDGET_SUMMARY: Array<[string, string]> = [
  ["Annual Growth Factor", "annual_growth_factor"],
  ["5-Year Incremental Budget Impact (KES)", "5_year_incremental_budget_impact_kes"],
  ["SHA Annual Budget (KES)", "sha_annual_budget_kes"],
  ["As % Of SHA Budget", "as_of_sha_budget"],
];

const BUDGET_OFFSETS: Array<[string, string]> = [
  ["Budget Offsets Available (Disinvestment)?", "budget_offsets_available_disinvestment"],
  ["Budget Offsets - Specify", "budget_offsets_specify"],
  ["External Donor Funding Anticipated?", "external_donor_funding_anticipated"],
  ["Donor Funding - Specify", "donor_funding_specify"],
];

const BUDGET_JUDGMENT: Array<[string, string]> = [
  ["Affordability Judgment", "affordability_judgment"],
  ["Notes", "notes"],
];

const RECORD_LETTERS_BI = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Slug-normalised key lookup over a single record's data. */
function normalizedLookup(data: Record<string, unknown>): (key: string) => unknown {
  const map = new Map<string, unknown>();
  for (const [k, v] of Object.entries(data ?? {})) map.set(slug(k), v);
  return (key: string) => map.get(slug(key));
}

// function biRow(look: (k: string) => unknown, label: string, key: string): RenderRow {
//   const raw = look(key);
//   const v = isPresent(raw) ? String(raw).trim() : null;
//   return { label, value: cleanVal(v), present: isPresent(v) };
// }


/** Format a numeric-looking value with thousands separators; pass through otherwise. */
function withCommas(v: string): string {
  // Only touch plain numbers (optional leading -, digits, optional decimals).
  if (!/^-?\d+(\.\d+)?$/.test(v)) return v;
  const [intPart, decPart] = v.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart != null ? `${grouped}.${decPart}` : grouped;
}

function biRow(look: (k: string) => unknown, label: string, key: string): RenderRow {
  const raw = look(key);
  const v = isPresent(raw) ? String(raw).trim() : null;
  return { label, value: v == null ? cleanVal(v) : withCommas(cleanVal(v)), present: isPresent(v) };
} 
function buildBudgetRecord(data: Record<string, unknown>): BudgetRecord {
  const look = normalizedLookup(data);

  const years: BudgetYear[] = [];
  for (let y = 1; y <= 5; y++) {
    const rows = BUDGET_YEAR_FIELDS.map(([label, suffix]) => biRow(look, label, `year_${y}_${suffix}`));
    years.push({ year: y, rows, hasData: rows.some((r) => r.present) });
  }

  const costBasis = BUDGET_COST_BASIS.map(([l, k]) => biRow(look, l, k));
  const summary = BUDGET_SUMMARY.map(([l, k]) => biRow(look, l, k));
  const offsets = BUDGET_OFFSETS.map(([l, k]) => biRow(look, l, k));
  const judgment = BUDGET_JUDGMENT.map(([l, k]) => biRow(look, l, k));

  const hasData =
    years.some((y) => y.hasData) ||
    [costBasis, summary, offsets, judgment].some((g) => g.some((r) => r.present));

  return { label: "", years, costBasis, summary, offsets, judgment, hasData };
}

export function resolveBudgetImpact(src: EvidenceSource): BudgetImpactModel {
  const crit = (src.criteria ?? []).find((c) => slug(c?.criterion_name).includes("budget"));
  if (!crit) return { records: [], hasData: false };

  const instances = (crit.instances ?? []).filter((i) => i && i.data);
  const sources: Record<string, unknown>[] =
    instances.length > 0
      ? instances.map((i) => (i.data ?? {}) as Record<string, unknown>)
      : crit.data
      ? [crit.data as Record<string, unknown>]
      : [];

  const records = sources.map(buildBudgetRecord).filter((r) => r.hasData);
  const multi = records.length > 1;
  records.forEach((r, i) => {
    r.label = multi ? RECORD_LETTERS_BI[i] ?? String(i + 1) : "";
  });

  return { records, hasData: records.length > 0 };
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
  duplicates: DuplicateGroup[];
  budgetImpact: BudgetImpactModel;
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
    synthesis: buildSynthesisSections(src).map((s) => resolveSection(s, get)),
    submission: SUBMISSION_BLOCKS.map((b) => resolveFormBlock(b, get)),
    grade: resolveGrade(get),
    keyEvidence: { design, outcome, effect, limitations, hasRow },
    duplicates: collectDuplicateRecords(src),
    budgetImpact: resolveBudgetImpact(src),
  };
}

/* ------------------------------------------------------------------ *
 * Service tabs — split the report by the service each record names.
 *
 * Grouping key is the criterion's own `service` / `services` COLUMN only.
 * A criterion that declares such a header is "service-bearing": records with
 * a value go to that named-service tab (one record per criterion per tab).
 *
 *  • Overview        — default view; the fullest record per criterion, always
 *                      clean (no duplicate block).
 *  • Named services  — one tab per distinct service value; one record per
 *                      criterion, clean.
 *  • No service      — the collector: every record NOT assigned to a named
 *                      service for this intervention. That means blank-value
 *                      records from service-bearing criteria AND all records
 *                      from criteria that have no service column. Duplicates
 *                      are kept here (this is the only place they show).
 * ------------------------------------------------------------------ */

type CriterionOf = NonNullable<EvidenceSource["criteria"]>[number];

const OVERVIEW_KEY = "__overview__";
const OVERVIEW_LABEL = "Overview";
const NO_SERVICE_KEY = "__no_service__";
const NO_SERVICE_LABEL = "No service";

/** The record-data key of a criterion's service column, or null if none. */
function serviceHeaderKey(c: CriterionOf): string | null {
  for (const h of c?.headers ?? []) {
    const k = slug(h?.key);
    if (k === "service" || k === "services") return h!.key as string;
  }
  return null;
}

/** Instances for a criterion, falling back to the primary `data` record. */
function instancesOf(c: CriterionOf): EvidenceInstance[] {
  if (c?.instances?.length) return c.instances;
  if (c?.data) return [{ data: c.data }];
  return [];
}

/** Read a record's service value via slug-normalised lookup. */
function serviceValueOf(
  data: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  if (!data) return null;
  const want = slug(key);
  for (const [k, v] of Object.entries(data)) {
    if (slug(k) === want) return isPresent(v) ? String(v).trim() : null;
  }
  return null;
}

/** Choose the record with the most populated fields. */
function pickFullest(list: EvidenceInstance[]): EvidenceInstance | undefined {
  let best: EvidenceInstance | undefined;
  let bestCount = -1;
  for (const inst of list) {
    const count = Object.values(inst?.data ?? {}).filter(isPresent).length;
    if (count > bestCount) {
      best = inst;
      bestCount = count;
    }
  }
  return best;
}

interface ServiceKey {
  key: string;
  label: string;
}

/** Distinct named service values across service-bearing criteria (first-seen
 *  order), plus whether any record is unassigned to a named service — i.e.
 *  either a blank service value, or any record under a non-service criterion. */
function enumerateServices(src: EvidenceSource): { services: ServiceKey[]; hasNoService: boolean } {
  const seen = new Map<string, string>();
  let hasNoService = false;
  for (const c of src.criteria ?? []) {
    const svcKey = serviceHeaderKey(c);
    if (!svcKey) {
      // no service column → all its records are unassigned collector material
      if (instancesOf(c).length > 0) hasNoService = true;
      continue;
    }
    for (const inst of instancesOf(c)) {
      const v = serviceValueOf(inst?.data, svcKey);
      if (v == null) {
        hasNoService = true;
        continue;
      }
      const k = v.toLowerCase();
      if (!seen.has(k)) seen.set(k, v);
    }
  }
  return { services: [...seen.entries()].map(([key, label]) => ({ key, label })), hasNoService };
}

/** A source copy for a NAMED service: each criterion keeps only the single
 *  record matching that service value; non-service criteria keep their fullest
 *  record so every tab still shows all 12 criteria. Clean, one record each. */
function filterSourceByNamedService(src: EvidenceSource, serviceKey: string): EvidenceSource {
  const criteria = (src.criteria ?? []).map((c) => {
    const svcKey = serviceHeaderKey(c);
    let chosen: EvidenceInstance | undefined;
    if (!svcKey) {
      chosen = pickFullest(instancesOf(c));
    } else {
      const matching = instancesOf(c).filter((inst) => {
        const v = serviceValueOf(inst?.data, svcKey);
        return v != null && v.toLowerCase() === serviceKey;
      });
      chosen = pickFullest(matching);
    }
    return { ...c, data: chosen?.data ?? {}, instances: chosen ? [chosen] : [] };
  });
  return { ...src, criteria };
}

/** A source copy for the NO-SERVICE collector: each criterion keeps ALL records
 *  not assigned to a named service — blank-value records (service-bearing) or
 *  every record (non-service criteria). Duplicates are preserved. */
function filterSourceNoService(src: EvidenceSource): EvidenceSource {
  const criteria = (src.criteria ?? []).map((c) => {
    const svcKey = serviceHeaderKey(c);
    const kept = svcKey
      ? instancesOf(c).filter((inst) => serviceValueOf(inst?.data, svcKey) == null)
      : instancesOf(c);
    return {
      ...c,
      data: pickFullest(kept)?.data ?? {},
      instances: kept,
    };
  });
  return { ...src, criteria };
}

export interface ServiceReport {
  key: string;
  label: string;
  model: ReportModel;
}
export interface ServiceReportBundle {
  meta: ReportMeta;
  services: ServiceReport[];
  single: boolean; // true => render the single overview model, no tab bar
}

export function buildServiceReports(src: EvidenceSource): ServiceReportBundle {
  const { services, hasNoService } = enumerateServices(src);

  // Default "Overview": fullest record per criterion, always clean.
  const overview = buildReport(src);
  overview.duplicates = [];

  const tabs: ServiceReport[] = [{ key: OVERVIEW_KEY, label: OVERVIEW_LABEL, model: overview }];

  for (const { key, label } of services) {
    tabs.push({ key, label, model: buildReport(filterSourceByNamedService(src, key)) });
  }

  if (hasNoService) {
    // The collector keeps its duplicates (buildReport → collectDuplicateRecords).
    tabs.push({
      key: NO_SERVICE_KEY,
      label: NO_SERVICE_LABEL,
      model: buildReport(filterSourceNoService(src)),
    });
  }

  // No named services and nothing unassigned would be impossible if there's any
  // data; single view only when there are no service tabs at all beyond Overview.
  const single = services.length === 0 && !hasNoService;

  return { meta: overview.meta, services: tabs, single };
}