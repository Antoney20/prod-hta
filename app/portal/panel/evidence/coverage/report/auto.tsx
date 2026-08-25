/**
 * report/auto.ts
 * ------------------------------------------------------------------
 * Dynamic, service-aware report engine. Builds the render model straight
 * from each criterion's `headers` (schema) + `data`/`instances` (values).
 * Records are split by their `service` field into tabs; a criterion whose
 * only record carries no service is treated as shared and shows in every tab.
 * Labels/keys come from the payload, so nothing drifts.
 */
import { cleanVal, isPresent, NA_LABEL, type EvidenceHeader } from "./helpers";

/* ---- input (structural; CoverageDetail is assignable) ---- */

interface AutoInstanceInput { data?: Record<string, unknown> | null; score?: number | null }
interface AutoCriterionInput {
  criterion_id?: string | null;
  criterion_name?: string | null;
  headers?: EvidenceHeader[] | null;
  data?: Record<string, unknown> | null;
  status?: string | null;
  instances?: AutoInstanceInput[] | null;
}
export interface AutoInput {
  name?: string | null;
  reference_number?: string | null;
  kind?: string | null;
  package?: { name?: string | null } | null;
  overall?: string | null;
  coverage?: { covered?: number; total?: number; percent?: number } | null;
  criteria?: AutoCriterionInput[] | null;
}

/* ---- output ---- */

export interface AutoRow {
  key: string; label: string; value: string; present: boolean; long: boolean;
}
export interface AutoInstance { label: string; score: number | null; rows: AutoRow[] }
export interface AutoCriterion {
  id: string;
  index: number;
  name: string;
  status: string;
  filled: number;
  total: number;
  hasData: boolean;
  rows: AutoRow[];
  instances: AutoInstance[]; // extra records for this criterion within the service
}
export interface AutoService { key: string; label: string; criteria: AutoCriterion[] }
export interface AutoMeta {
  kind: string; name: string; reference: string; package: string;
  overall: string; coverage: { covered: number; total: number; percent: number };
}
export interface AutoReport { meta: AutoMeta; single: boolean; services: AutoService[] }

/* ---- config ---- */

const IDENTITY_KEYS = new Set([
  "intervention_name", "intervention", "intervention_ref", "intervention_ref_no",
  "intervention_code", "id", "name", "package", "package_name", "service",
]);

const CRITERION_ORDER: string[][] = [
  ["clinical", "effectiveness"], ["safety"], ["quality"],
  ["burden", "mortality"], ["burden", "morbidity"], ["burden"], ["incidence"],
  ["cost", "effectiveness"], ["budget"],
  ["feasibility"], ["access"], ["catastrophic"], ["equity"],
  ["congruence"], ["government"],
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LONG_CHARS = 140;

/* ---- primitives ---- */

const cleanLabel = (s: unknown) => String(s ?? "").replace(/\s*\n\s*/g, " ").trim();
const titleize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** service grouping key: lowercase alphanumeric only (collapses "Out Patient"/"OutPatient"). */
const serviceKey = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");

function displayVal(v: unknown): string {
  const c = cleanVal(v);
  if (c === NA_LABEL) return c;
  return c.replace(/<br\s*\/?>/gi, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isLong(display: string, present: boolean): boolean {
  if (!present || display === NA_LABEL) return false;
  return display.length > LONG_CHARS || display.includes("\n");
}

function orderRank(name: string): number {
  const n = name.toLowerCase();
  for (let i = 0; i < CRITERION_ORDER.length; i++) {
    if (CRITERION_ORDER[i].every((frag) => n.includes(frag))) return i;
  }
  return CRITERION_ORDER.length;
}

function rowsFor(headers: EvidenceHeader[], data: Record<string, unknown>): AutoRow[] {
  const schema = headers.length
    ? headers.map((h) => ({ key: h.key, label: h.label }))
    : Object.keys(data).map((k) => ({ key: k, label: k }));

  const rows: AutoRow[] = [];
  for (const h of schema) {
    if (IDENTITY_KEYS.has(h.key)) continue;
    const present = isPresent(data[h.key]);
    const value = displayVal(data[h.key]);
    rows.push({ key: h.key, label: cleanLabel(h.label), value, present, long: isLong(value, present) });
  }
  return rows;
}

function statusFor(rows: AutoRow[], hasRecord: boolean): string {
  if (!hasRecord) return "missing";
  const present = rows.filter((r) => r.present).length;
  if (present === 0) return "empty";
  return present === rows.length ? "complete" : "incomplete";
}

/* ---- parsed intermediate ---- */

interface Record_ { svc: string; svcLabel: string; data: Record<string, unknown>; score: number | null }
interface Parsed {
  id: string;
  name: string;
  headers: EvidenceHeader[];
  records: Record_[];
}

function parse(c: AutoCriterionInput): Parsed {
  const raw = (c.instances?.length ? c.instances : c.data ? [{ data: c.data, score: null }] : []);
  const records: Record_[] = raw.map((r) => {
    const d = r.data ?? {};
    const label = String(d.service ?? "").trim();
    return { svc: serviceKey(label), svcLabel: label, data: d, score: r.score ?? null };
  });
  return {
    id: c.criterion_id ?? "",
    name: titleize((c.criterion_name ?? "Criterion").trim()),
    headers: c.headers ?? [],
    records,
  };
}

/** Build one criterion view from a chosen record pool. */
function makeCriterion(p: Parsed, pool: Record_[], index: number): AutoCriterion {
  const primary = pool[0];
  const rows = primary ? rowsFor(p.headers, primary.data) : [];
  const extras = pool.slice(1);

  return {
    id: p.id,
    index,
    name: p.name,
    status: statusFor(rows, !!primary),
    filled: rows.filter((r) => r.present).length,
    total: rows.length,
    hasData: rows.some((r) => r.present),
    rows,
    instances: extras.map((rec, i) => ({
      label: LETTERS[i] ?? String(i + 1),
      score: rec.score,
      rows: rowsFor(p.headers, rec.data),
    })),
  };
}

/* ---- build ---- */

export function buildAutoReport(src: AutoInput): AutoReport {
  const meta: AutoMeta = {
    kind: src.kind ?? "Proposal",
    name: src.name ?? "—",
    reference: src.reference_number ?? "—",
    package: src.package?.name ?? "—",
    overall: (src.overall ?? "").toLowerCase(),
    coverage: {
      covered: src.coverage?.covered ?? 0,
      total: src.coverage?.total ?? 0,
      percent: src.coverage?.percent ?? 0,
    },
  };

  const parsed = (src.criteria ?? [])
    .map(parse)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => orderRank(a.p.name) - orderRank(b.p.name) || a.i - b.i)
    .map(({ p }) => p);

  // distinct assigned services across the whole target, first-seen order
  const svcOrder: string[] = [];
  const svcLabel: Record<string, string> = {};
  for (const p of parsed) {
    for (const rec of p.records) {
      if (!rec.svc) continue;
      if (!(rec.svc in svcLabel)) {
        svcLabel[rec.svc] = rec.svcLabel;
        svcOrder.push(rec.svc);
      }
    }
  }

  const single = svcOrder.length <= 1;

  if (single) {
    // one flat report — every record for a criterion pooled together
    const criteria = parsed.map((p, i) => makeCriterion(p, p.records, i + 1));
    return { meta, single: true, services: [{ key: "all", label: "All", criteria }] };
  }

  // one tab per service; a criterion shows its matching records, else its
  // service-less (shared) records as a fallback representative
  const services: AutoService[] = svcOrder.map((key) => {
    const criteria = parsed.map((p, i) => {
      const matched = p.records.filter((r) => r.svc === key);
      const shared = p.records.filter((r) => !r.svc);
      const pool = matched.length ? matched : shared;
      return makeCriterion(p, pool, i + 1);
    });
    return { key, label: svcLabel[key], criteria };
  });

  return { meta, single: false, services };
}