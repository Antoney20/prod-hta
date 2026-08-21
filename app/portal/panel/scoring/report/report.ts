import { PanelScoreSummaryRow } from "@/types/new/panel-score";

// Same priority list as scoring.ts groupCriteria — table + export order match
// the wizard. Matched by loose prefix so BoD (Morbidity) and BoD (Mortality)
// both fall in the "burden of disease" slot; within the slot we sort by exact
// name so Morbidity is deterministically before Mortality.
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

const rank = (name: string): number => {
  const n = looseKey(name);
  const i = CRITERION_ORDER.findIndex((k) => n.startsWith(k));
  return i === -1 ? CRITERION_ORDER.length : i;
};

export interface CriterionColumn {
  key: string;   // normalized criteria name (lookup key)
  name: string;  // display name (first-seen spelling)
}

/** Distinct criteria across all rows, ordered by CRITERION_ORDER then exact
 *  name (keeps BoD Morbidity/Mortality adjacent and stable). */
export function criteriaColumns(rows: PanelScoreSummaryRow[]): CriterionColumn[] {
  const seen = new Map<string, string>();
  for (const r of rows) {
    for (const s of r.scores) {
      const key = looseKey(s.criteria_name);
      if (key && !seen.has(key)) seen.set(key, (s.criteria_name || "").trim());
    }
  }
  return Array.from(seen.entries())
    .map(([key, name]) => ({ key, name }))
    .sort((a, b) => {
      const ra = rank(a.name);
      const rb = rank(b.name);
      return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
    });
}

/** This unit's score for a column (averaged across reviewers if >1). */
export function scoreForColumn(
  row: PanelScoreSummaryRow,
  col: CriterionColumn
): number | null {
  const hits = row.scores.filter((s) => looseKey(s.criteria_name) === col.key);
  if (hits.length === 0) return null;
  const vals = hits.map((s) => s.score).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 100) / 100; // keep .5 / .25 like the screenshot
}

export interface UnitReviewer {
  reviewer_id: number;
  reviewer_name: string;
}

/** Distinct reviewers who scored this unit (one row each in "All scores"). */
export function reviewersOf(row: PanelScoreSummaryRow): UnitReviewer[] {
  const seen = new Map<number, string>();
  for (const s of row.scores) {
    if (!seen.has(s.reviewer_id)) seen.set(s.reviewer_id, s.reviewer_name || "");
  }
  return Array.from(seen.entries()).map(([reviewer_id, reviewer_name]) => ({
    reviewer_id,
    reviewer_name,
  }));
}

/** ONE reviewer's score for a column (no averaging — a reviewer scores a
 *  criterion at most once per unit). */
export function scoreForReviewerColumn(
  row: PanelScoreSummaryRow,
  reviewerId: number,
  col: CriterionColumn
): number | null {
  const hit = row.scores.find(
    (s) => s.reviewer_id === reviewerId && looseKey(s.criteria_name) === col.key
  );
  return typeof hit?.score === "number" ? hit.score : null;
}

const CRITERIA_THRESHOLD = 6;

/** Group date, dd Mon yyyy.
 *  Rule: a FULL scoring session (more than 6 distinct scored criteria) groups
 *  by when scoring happened (`scored_at`); a partial unit groups by the target's
 *  submission date (`submitted_at`). Each side falls back to the other, then to
 *  the earliest score created_at, so a row always lands somewhere sensible. */
export function rowDate(row: PanelScoreSummaryRow): { key: string; label: string } {
  const distinctCriteria = new Set(
    row.scores.map((s) => looseKey(s.criteria_name)).filter(Boolean)
  ).size;

  const scored =
    row.scored_at ||
    row.scores.map((s) => s.created_at).filter(Boolean).sort()[0] ||
    null;
  const submitted = row.submitted_at || null;

  const iso =
    distinctCriteria > CRITERIA_THRESHOLD
      ? scored || submitted
      : submitted || scored;

  if (!iso) return { key: "unknown", label: "No date" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { key: "unknown", label: "No date" };
  const key = d.toISOString().slice(0, 10); // yyyy-mm-dd, sorts correctly
  const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return { key, label };
}

/** Rows grouped by date, newest group first. */
export function groupByDate(
  rows: PanelScoreSummaryRow[]
): { key: string; label: string; rows: PanelScoreSummaryRow[] }[] {
  const groups = new Map<string, { key: string; label: string; rows: PanelScoreSummaryRow[] }>();
  for (const r of rows) {
    const { key, label } = rowDate(r);
    let g = groups.get(key);
    if (!g) {
      g = { key, label, rows: [] };
      groups.set(key, g);
    }
    g.rows.push(r);
  }
  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === "unknown") return 1;
    if (b.key === "unknown") return -1;
    return b.key.localeCompare(a.key); // newest date first
  });
}