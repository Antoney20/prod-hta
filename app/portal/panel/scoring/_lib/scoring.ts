import { UUID } from "@/types/new/shared";
import { CriteriaAppraisalTool, PanelAppraisalScore } from "@/types/new/panel-score";
import { EvidenceCriterion, EvidenceRecord, EvidenceTarget } from "@/types/new/decision-template";

export const SERVICE_KEYS = ["service", "services"] as const;

/** lowercase alphanumeric — mirrors backend make_service_key / _service_of */
export const serviceKey = (s: string): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const norm = (s: string): string => (s || "").trim().toLowerCase();

/* ---------------------------------------------------------------- services */

/** A criterion's evidence as a flat list of per-record SCALAR data objects,
 *  whatever the source shape:
 *   - /scoring/ endpoint: `evidence` is EvidenceRecord[] → unwrap each record's
 *     own `evidence` object.
 *   - legacy retrieve/generate: `evidence` is a merged object and the scalar
 *     per-record data lives in `children[]` → use those. Falling back to the
 *     merged object is the OLD bug (that object is where `[871, 0]` lives), so
 *     we only use it when there are no per-record entries at all. */
function recordsOf(crit: EvidenceCriterion): Record<string, unknown>[] {
  const c = crit as unknown as {
    evidence?: unknown;
    children?: { evidence?: Record<string, unknown> }[];
  };
  if (Array.isArray(c.evidence)) {
    return (c.evidence as EvidenceRecord[]).map((r) => r?.evidence ?? {});
  }
  if (c.children?.length) {
    return c.children.map((r) => r.evidence ?? {});
  }
  const obj = c.evidence as Record<string, unknown> | undefined;
  return obj && Object.keys(obj).length ? [obj] : [];
}

/** The service a single record belongs to ("" = no service). */
function serviceOf(ev: Record<string, unknown>): string {
  for (const k of SERVICE_KEYS) {
    const v = ev?.[k];
    if (Array.isArray(v)) {
      const first = v.find((x) => x != null && x !== "");
      if (first != null) return String(first).trim();
    } else if (v != null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

export function collectServices(target: EvidenceTarget): string[] {
  const seen = new Map<string, string>();
  for (const crit of target.criteria) {
    for (const ev of recordsOf(crit)) {
      const label = serviceOf(ev);
      const key = serviceKey(label);
      if (key && !seen.has(key)) seen.set(key, label);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

/** One record's SCALAR data for a scope.
 *   - No service ("") → the first no-service record (shared data), else {}.
 *   - a named service → that service's record; else the shared record; else {}.
 *  Never returns the merged bag, so a field is never `[871, 0]`. */
export function evidenceForService(
  crit: EvidenceCriterion,
  service: string
): Record<string, unknown> {
  const records = recordsOf(crit);
  if (records.length === 0) return {};

  const general = records.find((ev) => !serviceKey(serviceOf(ev)));
  const want = serviceKey(service);
  if (!want) return general ?? {};

  const matched = records.find((ev) => serviceKey(serviceOf(ev)) === want);
  return matched ?? general ?? {};
}

/** Does a scope actually surface evidence? True when at least one criterion
 *  resolves to a non-empty evidence object for `service` via the SAME resolver
 *  the wizard renders through — so "should this tab exist" and "does this tab
 *  show anything" can never drift apart. `""` = the no-service scope. */
export function scopeHasEvidence(target: EvidenceTarget, service: string): boolean {
  return target.criteria.some(
    (crit) => Object.keys(evidenceForService(crit, service)).length > 0
  );
}

/** Whether to offer the no-service scope. Not "does an empty-service record
 *  exist" (a hollow `{service:""}` shell would wrongly qualify) but "does the
 *  no-service scope resolve to real evidence for any criterion." */
export function hasNoServiceScope(target: EvidenceTarget): boolean {
  return scopeHasEvidence(target, "");
}

/** Scopes to score, straight from the API: named services, plus a leading "" for
 *  the no-service scope only when it actually resolves to evidence. */
export const unitsOf = (target: EvidenceTarget): string[] =>
  hasNoServiceScope(target) ? ["", ...collectServices(target)] : collectServices(target);

/* ------------------------------------------------------ criteria grouping */

export interface CriterionOption {
  id: UUID;                 // CriteriaAppraisalTool row id (what the score FK points to)
  score: number | null;     // points for this option
  scoring_approach: string; // HTML
}

export interface CriterionGroup {
  key: string;              // normalized criteria name
  name: string;             // display name (criteria)
  description: string;      // HTML — from the first row that carries one
  options: CriterionOption[];
}

/* ----------------------------------------------------- display formatting */
// Thousands-group numeric evidence for display. String-based, so decimal
// precision is preserved verbatim (no toLocaleString rounding). Only clean
// whole/decimal numbers qualify — codes, dates, CIs, ranges pass through.
// Display-only: never feed the result back into scoring/band arithmetic.
const NUMERIC = /^-?\d+(\.\d+)?$/;

const addCommas = (s: string): string => {
  const neg = s.startsWith("-");
  const [int, dec] = (neg ? s.slice(1) : s).split(".");
  return (neg ? "-" : "") + int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec != null ? "." + dec : "");
};

/** Comma-group a scalar (or array of scalars) for display. Non-numeric values
 *  are returned untouched. */
export function formatEvidenceValue(v: unknown): unknown {
  if (typeof v === "number" && Number.isFinite(v)) return addCommas(String(v));
  if (typeof v === "string" && NUMERIC.test(v.trim())) return addCommas(v.trim());
  if (Array.isArray(v)) return v.map(formatEvidenceValue);
  return v;
}

// Wizard/display order for criteria. Matched by loose prefix (punctuation and
// spacing collapsed), so "Burden of Disease (Morbidity)" AND "(Mortality)" both
// resolve to the "burden of disease" slot and sort next to each other. Anything
// not listed here sorts alphabetically AFTER these.
const CRITERION_ORDER = [
  "clinical effectiveness",
  "safety",
  "quality",
  "burden of disease",
  "incidence or occurrence of diseases",
  "population",
  "equity",
  "cost effectiveness",
  "budgetary impact and affordability of intervention",
  "feasibility of implementation of the intervention",
  "catastrophic health expenditure",
  "access to healthcare",
  "congruence with existing priorities in the health sector",
];

const looseKey = (s: string): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const criterionRank = (name: string): number => {
  const n = looseKey(name);
  const i = CRITERION_ORDER.findIndex((k) => n.startsWith(k));
  return i === -1 ? CRITERION_ORDER.length : i;
};

/** Fold the flat appraisal-tool rows into one group per criteria name, each
 *  holding its scoring options (sorted high → low). Groups are ordered by
 *  CRITERION_ORDER (BoD Morbidity/Mortality adjacent), then alphabetically for
 *  anything unlisted. Headers are ignored. */
export function groupCriteria(tools: CriteriaAppraisalTool[]): CriterionGroup[] {
  const map = new Map<string, CriterionGroup>();
  for (const t of tools) {
    const key = norm(t.criteria);
    let g = map.get(key);
    if (!g) {
      g = { key, name: (t.criteria || "").trim(), description: t.description || "", options: [] };
      map.set(key, g);
    }
    if (!g.description && t.description) g.description = t.description;
    g.options.push({ id: t.id, score: t.score, scoring_approach: t.scoring_approach || "" });
  }
  const groups = Array.from(map.values());
  for (const g of groups) g.options.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  groups.sort((a, b) => {
    const ra = criterionRank(a.name);
    const rb = criterionRank(b.name);
    return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
  });
  return groups;
}

/* ---------------------------------------------------------------- scores */

export interface PanelScoreValue {
  value: number | null;
  criteria_label?: string;
  option_id?: string;
  max?: number | null;
}

export const scoreValueOf = (s?: PanelAppraisalScore): number => {
  const v = (s?.score as PanelScoreValue | undefined)?.value;
  return typeof v === "number" ? v : 0;
};

const rowKey = (targetId: string, criteriaId: string, service: string) =>
  `${targetId}|${criteriaId}|${serviceKey(service)}`;

export function buildScoreMap(scores: PanelAppraisalScore[]): Map<string, PanelAppraisalScore> {
  const m = new Map<string, PanelAppraisalScore>();
  for (const s of scores) {
    const tid = s.target_id || s.intervention || s.national_proposal || "";
    // m.set(rowKey(tid, s.criteria, s.service_key || s.service || ""), s);
    m.set(rowKey(tid, s.criteria, s.service_key || s.service || ""), s);
  }
  return m;
}

export function scoreFor(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  criteriaId: string,
  service: string
): PanelAppraisalScore | undefined {
  return map.get(rowKey(targetId, criteriaId, service));
}

/** A group is scored if ANY of its option rows carries my score. */
// export function scoreForGroup(
//   map: Map<string, PanelAppraisalScore>,
//   targetId: string,
//   group: CriterionGroup,
//   service: string
// ): PanelAppraisalScore | undefined {
//   for (const o of group.options) {
//     const s = scoreFor(map, targetId, o.id, service);
//     if (s) return s;
//   }
//   return undefined;
// }

/** A group is scored if ANY of its option rows carries my score, OR a saved
 *  score for this scope belongs to this group by its persisted option_id /
 *  criteria_label (covers rebuilt tool rows where the stored FK option id no
 *  longer matches a current group.options entry — the case where a saved score
 *  fails to lock the scope). */
export function scoreForGroup(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  group: CriterionGroup,
  service: string
): PanelAppraisalScore | undefined {
  // fast path: FK option id matches a current option row
  for (const o of group.options) {
    const s = scoreFor(map, targetId, o.id, service);
    if (s) return s;
  }
  // fallback: a saved score in THIS scope whose stored label/option belongs here
  const want = serviceKey(service);
  const optionIds = new Set(group.options.map((o) => o.id));
  for (const s of map.values()) {
    const tid = s.target_id || s.intervention || s.national_proposal || "";
    if (tid !== targetId) continue;
    if (serviceKey(s.service_key || s.service || "") !== want) continue;
    const sv = s.score as unknown as PanelScoreValue | undefined;
    if (sv?.option_id && optionIds.has(sv.option_id)) return s;
    if (sv?.criteria_label && norm(sv.criteria_label) === group.key) return s;
    if (s.criteria && optionIds.has(s.criteria)) return s;
  }
  return undefined;
}

export function groupsScored(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  service: string,
  groups: CriterionGroup[]
): boolean {
  return groups.length > 0 && groups.every((g) => !!scoreForGroup(map, targetId, g, service));
}

/** Has this reviewer committed ANY score for this scope (target + service)?
 *  This is the lock/done signal: submit is the commit point and a scope can't
 *  be rescored after, so a partial submit (e.g. 8/12) locks the scope exactly
 *  like a full one. Existence of a single row for the (target, service_key) is
 *  enough — no per-criterion / option-id matching, so a rebuilt tool row can
 *  never make a genuinely-scored scope read as unscored. */
export function scopeScored(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  service: string
): boolean {
  const want = serviceKey(service);
  for (const s of map.values()) {
    const tid = s.target_id || s.intervention || s.national_proposal || "";
    if (tid !== targetId) continue;
    if (serviceKey(s.service_key || s.service || "") === want) return true;
  }
  return false;
}

/* ------------------------------- completeness for the overview table/rail */
/* These take the flat tool list and group internally, so the main page and
   table keep working unchanged while being correct per-criterion.          */

/** A unit (scope) counts as scored the moment ANY score is committed for it —
 *  the SAME lock signal the wizard uses (scopeScored). This aligns the overview
 *  table's per-service Yes with the wizard lock: a partial submit (e.g. 8/12)
 *  still locks the scope, so it must read Yes here too, not require all 12
 *  groups. `_criteria` is retained only for call-site/signature compatibility. */
export function unitScored(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  service: string,
  _criteria: CriteriaAppraisalTool[]
): boolean {
  return scopeScored(map, targetId, service);
}

export function unitProgress(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  service: string,
  criteria: CriteriaAppraisalTool[]
): { scored: number; total: number; score: number } {
  const groups = groupCriteria(criteria);
  let scored = 0;
  let score = 0;
  for (const g of groups) {
    const s = scoreForGroup(map, targetId, g, service);
    if (s) {
      scored += 1;
      score += scoreValueOf(s);
    }
  }
  return { scored, total: groups.length, score };
}

/** Rollup for the overview. A scope is "scored" when any score is committed for
 *  it (scopeScored), so a target reads fully scored only when EVERY scope has
 *  been scored — i.e. all services (plus the general scope, when present) are
 *  done. `_criteria` kept for signature compatibility. */
export function targetRollup(
  map: Map<string, PanelAppraisalScore>,
  target: EvidenceTarget,
  _criteria: CriteriaAppraisalTool[]
): { scoredUnits: number; totalUnits: number; anyScored: boolean } {
  const units = unitsOf(target);
  const scoredUnits = units.filter((u) => scopeScored(map, target.id, u)).length;
  const anyScored = scoredUnits > 0;
  return { scoredUnits, totalUnits: units.length, anyScored };
}