import { UUID } from "@/types/new/shared";
import { CriteriaAppraisalTool, PanelAppraisalScore } from "@/types/new/panel-score";
import { EvidenceCriterion, EvidenceTarget } from "@/types/new/decision-template";

export const SERVICE_KEYS = ["service", "services"] as const;

/** lowercase alphanumeric — mirrors backend make_service_key / _service_of */
export const serviceKey = (s: string): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const norm = (s: string): string => (s || "").trim().toLowerCase();

/* ---------------------------------------------------------------- services */

export function collectServices(target: EvidenceTarget): string[] {
  const seen = new Map<string, string>();
  for (const crit of target.criteria) {
    const records = crit.children?.length ? crit.children.map((c) => c.evidence) : [crit.evidence];
    for (const ev of records) {
      for (const k of SERVICE_KEYS) {
        const label = String(ev?.[k] ?? "").trim();
        const key = serviceKey(label);
        if (key && !seen.has(key)) seen.set(key, label);
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export function evidenceForService(
  crit: EvidenceCriterion,
  service: string
): Record<string, unknown> {
  if (!service) return crit.evidence;
  const want = serviceKey(service);
  for (const rec of crit.children ?? []) {
    for (const k of SERVICE_KEYS) {
      if (serviceKey(String(rec.evidence?.[k] ?? "")) === want) return rec.evidence;
    }
  }
  return crit.evidence;
}

export const unitsOf = (target: EvidenceTarget): string[] => ["", ...collectServices(target)];

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

/** Fold the flat appraisal-tool rows into one group per criteria name, each
 *  holding its scoring options (sorted high → low). Headers are ignored. */
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
export function scoreForGroup(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  group: CriterionGroup,
  service: string
): PanelAppraisalScore | undefined {
  for (const o of group.options) {
    const s = scoreFor(map, targetId, o.id, service);
    if (s) return s;
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

/* ------------------------------- completeness for the overview table/rail */
/* These take the flat tool list and group internally, so the main page and
   table keep working unchanged while being correct per-criterion.          */

export function unitScored(
  map: Map<string, PanelAppraisalScore>,
  targetId: string,
  service: string,
  criteria: CriteriaAppraisalTool[]
): boolean {
  return groupsScored(map, targetId, service, groupCriteria(criteria));
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

export function targetRollup(
  map: Map<string, PanelAppraisalScore>,
  target: EvidenceTarget,
  criteria: CriteriaAppraisalTool[]
): { scoredUnits: number; totalUnits: number; anyScored: boolean } {
  const units = unitsOf(target);
  const scoredUnits = units.filter((u) => unitScored(map, target.id, u, criteria)).length;
  const anyScored = units.some((u) => unitProgress(map, target.id, u, criteria).scored > 0);
  return { scoredUnits, totalUnits: units.length, anyScored };
}