import type { AppraisalRow } from "@/types/panel/appraisal-report";

export type Decision = "include" | "exclude" | "pending";
export type Proposal = AppraisalRow & { _key: string };
export type Field = { key: string; value: string };

export const rid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
export const keyed = (rows: AppraisalRow[]): Proposal[] =>
  rows.map((r) => ({ ...r, _key: (r as any)._key ?? rid() }));
export const strip = (rows: Proposal[]): AppraisalRow[] => rows.map(({ _key, ...r }) => r);

export const str = (v: unknown) => String(v ?? "").trim();
export const asDecision = (d: unknown): Decision =>
  d === "include" || d === "exclude" ? d : "pending";

export const pkgOf = (r: AppraisalRow) => str(r.package) || "Unassigned";
export const phaseOf = (r: AppraisalRow) => str(r.phase);
export const nameOf = (r: AppraisalRow) => str(r.intervention) || "Unnamed intervention";
export const refOf = (r: AppraisalRow) => str(r.ref);
export const idOf = (r: AppraisalRow) => str(r.id);
export const isScored = (r: AppraisalRow) => str(r.score) !== "";

/** Evidence coverage is keyed by the intervention id (UUID). Service rows of one
 *  intervention share that id, so every service row resolves to one coverage page. */
export const evidenceHref = (r: AppraisalRow): string | null => {
  const id = idOf(r);
  return id ? `/portal/panel/evidence/coverage/${id}` : null;
};

export interface PackageGroup { key: string; label: string; count: number; }

export const groupByPackage = (rows: Proposal[]): PackageGroup[] => {
  const m = new Map<string, number>();
  rows.forEach((r) => { const k = pkgOf(r); m.set(k, (m.get(k) ?? 0) + 1); });
  return [...m.entries()]
    .sort((a, b) =>
      a[0] === "Unassigned" ? 1 : b[0] === "Unassigned" ? -1 : a[0].localeCompare(b[0]),
    )
    .map(([key, count]) => ({ key, label: key, count }));
};

export const distinctPhases = (rows: Proposal[]): string[] =>
  [...new Set(rows.map(phaseOf).filter(Boolean))].sort();

export const includedIn = (rows: Proposal[], pkg: string): Proposal[] =>
  rows.filter((r) => pkgOf(r) === pkg && asDecision(r.decision) === "include");

/* ---- decision styling ---- */
export const DECISION_STYLE: Record<Decision, string> = {
  include: "bg-green-100 text-green-700 border-green-200",
  exclude: "bg-red-100 text-red-600 border-red-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
};
export const DECISION_ACCENT: Record<Decision, string> = {
  include: "border-l-green-400",
  exclude: "border-l-red-400",
  pending: "border-l-transparent",
};

/* ---- detail / labels ---- */
export const CORE_KEYS = new Set([
  "_key", "id", "ref", "intervention", "package", "phase", "decision", "comment", "score",
]);

const DETAIL_LABELS: Record<string, string> = {
  service: "Service", recommendation: "Recommendation", rationale: "Rationale",
  conditions: "Conditions", score: "Score",
  scope: "Scope", access_point: "Access Point", tariff: "Tariff", ppm: "PPM",
  access_rules: "Access Rules",
};
export const labelFor = (k: string) =>
  DETAIL_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ---- revise-existing form helpers ---- */
export const toFields = (data?: Record<string, any>): Field[] =>
  data && Object.keys(data).length
    ? Object.entries(data).map(([key, value]) => ({
        key, value: typeof value === "string" ? value : JSON.stringify(value),
      }))
    : [{ key: "", value: "" }];

export const fieldsToData = (fields: Field[]): Record<string, string> => {
  const data: Record<string, string> = {};
  fields.forEach(({ key, value }) => { if (key.trim()) data[key.trim()] = value; });
  return data;
};