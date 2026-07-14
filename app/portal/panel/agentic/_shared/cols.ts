import { AgenticResultRow, AppraisalScoreResult } from "@/types/new/agentic-results";


export const short = (raw: string) => {
  const n = raw.trim().toLowerCase();
  if (n.includes("burden") && n.includes("mortality")) return "BOD-Mort";
  if (n.includes("burden") && n.includes("morbidity")) return "BOD-Morb";
  if (n.includes("access") && n.includes("healthcare")) return "Access";
  if (n.includes("budgetary") && n.includes("affordability")) return "Budgetary";
  if (n.includes("feasibility") && n.includes("implementation")) return "Feasibility";
  if (n.includes("incidence") && n.includes("occurrence")) return "Incidence";
  if (n.includes("catastrophic") && n.includes("expenditure")) return "Expenditure";
  if (n.includes("congruence") && n.includes("existing")) return "Congruence";
  return raw.trim();
};

export interface CritCol {
  key: string;   // normalised name — the join key
  name: string;  // full criterion name
  label: string; // short header
}

/** The latest run per row carries the cells we display. */
export const latestOf = (row: AgenticResultRow) => row.appraisals[0] ?? null;

/** Derive the union of criteria across every row's latest appraisal, stable-ordered. */
export const deriveColumns = (rows: AgenticResultRow[]): CritCol[] => {
  const map = new Map<string, CritCol>();
  for (const r of rows) {
    const ap = latestOf(r);
    if (!ap) continue;
    for (const s of ap.scores) {
      const key = s.criterion.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { key, name: s.criterion, label: short(s.criterion) });
    }
  }
  return [...map.values()];
};

/** Fast criterion lookup for a row's latest appraisal. */
export const scoreMapOf = (row: AgenticResultRow): Map<string, AppraisalScoreResult> => {
  const ap = latestOf(row);
  const m = new Map<string, AppraisalScoreResult>();
  if (ap) for (const s of ap.scores) m.set(s.criterion.trim().toLowerCase(), s);
  return m;
};

// add to cols.ts
export const mapFor = (scores: AppraisalScoreResult[]): Map<string, AppraisalScoreResult> => {
  const m = new Map<string, AppraisalScoreResult>();
  for (const s of scores) m.set(s.criterion.trim().toLowerCase(), s);
  return m;
};