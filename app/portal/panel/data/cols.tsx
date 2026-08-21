import { EvidenceTarget } from "@/types/new/decision-template";

export interface CritCol {
  key: string;
  name: string;
  kind: string;
  fields: string[];
  important: string[];
}

export const cellValue = (v: unknown): string =>
  v == null ? "" : Array.isArray(v) ? v.join(" · ") : String(v);

const NO_SERVICE = "No service";

/** Canonical grouping key for a service label: lower-cased, letters + digits only.
 *  So "Out-Patient", "out patient", and "OutPatient" all collapse to "outpatient".
 *  Only the grouping key is normalised — display keeps the first-seen spelling. */
const serviceKey = (label: string): string => {
  if (label === NO_SERVICE) return NO_SERVICE;
  const k = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  return k || label.trim().toLowerCase();
};

/** Read the service value out of one evidence object (`service`/`services` field). */
function serviceFromEvidence(ev: Record<string, unknown> | null | undefined): string | null {
  for (const [k, v] of Object.entries(ev ?? {})) {
    const key = k.trim().toLowerCase();
    if ((key === "service" || key === "services") && v != null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return null;
}

/** A target's single service (first record that carries one), else "No service".
 *  Reads per-record children so it returns one clean label, never a joined list. */
export function serviceOf(t: EvidenceTarget): string {
  for (const c of t.criteria ?? []) {
    const children = (c as any).children as Array<{ evidence?: Record<string, unknown> }> | undefined;
    if (children && children.length) {
      for (const child of children) {
        const s = serviceFromEvidence(child?.evidence);
        if (s) return s;
      }
    }
  }
  return NO_SERVICE;
}

/** One row per uploaded evidence record, reconstructed as the original upload
 *  rows. `evidence` maps criterion-key -> that row's evidence object. */
export interface ServiceRow {
  service: string; // display label ("No service" for unassigned)
  evidence: Map<string, Record<string, unknown>>;
}

/** Rebuild a target's uploaded rows, grouped by service.
 *
 *  Each criterion carries `children` — one per uploaded record, in upload order.
 *  Records are grouped by their own service (normalised key so spacing / case /
 *  punctuation variants merge), then, WITHIN a service, zipped by position: the
 *  k-th record of every criterion lines up on row k. That reconstructs the row
 *  the data was uploaded as, one record per row — nothing is ever stacked into a
 *  single cell, and there is no merged / general row. A criterion with fewer
 *  records than the service's longest simply leaves later rows blank. Records
 *  with no service collect under "No service". Falls back to the merged
 *  `evidence` only when a criterion has no children at all. */
export function serviceRowsOf(t: EvidenceTarget): ServiceRow[] {
  // normalised service key -> { label (first-seen), perCrit: crit-key -> records[] }
  const svc = new Map<
    string,
    { label: string; perCrit: Map<string, Record<string, unknown>[]> }
  >();
  const order: string[] = [];

  const ensureSvc = (label: string) => {
    const gk = serviceKey(label);
    let g = svc.get(gk);
    if (!g) {
      g = { label, perCrit: new Map() };
      svc.set(gk, g);
      order.push(gk);
    }
    return g;
  };

  for (const c of t.criteria ?? []) {
    const key = c.criterion.trim().toLowerCase();
    const children = (c as any).children as Array<{ evidence?: Record<string, unknown> }> | undefined;
    const records: Record<string, unknown>[] =
      children && children.length
        ? children.map((ch) => ch?.evidence ?? {})
        : c.evidence
          ? [c.evidence as unknown as Record<string, unknown>]
          : [];

    for (const ev of records) {
      const label = serviceFromEvidence(ev) ?? NO_SERVICE;
      const g = ensureSvc(label);
      const list = g.perCrit.get(key) ?? [];
      list.push(ev);
      g.perCrit.set(key, list);
    }
  }

  // Named services first (first-seen), "No service" last if present.
  const named = order.filter((k) => k !== NO_SERVICE);
  const ordered = svc.has(NO_SERVICE) ? [...named, NO_SERVICE] : named;

  const rows: ServiceRow[] = [];
  for (const gk of ordered) {
    const g = svc.get(gk)!;
    let maxRows = 0;
    for (const list of g.perCrit.values()) maxRows = Math.max(maxRows, list.length);
    for (let i = 0; i < maxRows; i++) {
      const evidence = new Map<string, Record<string, unknown>>();
      for (const [key, list] of g.perCrit) {
        if (list[i]) evidence.set(key, list[i]);
      }
      rows.push({ service: g.label, evidence });
    }
  }
  return rows;
}

export function buildColumns(targets: EvidenceTarget[]): CritCol[] {
  const seen = new Map<string, CritCol>();
  for (const t of targets)
    for (const c of t.criteria) {
      const key = c.criterion.trim().toLowerCase();
      const col = seen.get(key) ?? {
        key, name: c.criterion, kind: c.type, fields: [], important: [],
      };
      for (const f of Object.keys(c.evidence ?? {}))
        if (!col.fields.includes(f)) col.fields.push(f);
      for (const f of c.target_fields ?? [])
        if (!col.important.includes(f)) col.important.push(f);
      col.kind = col.kind || c.type;
      seen.set(key, col);
    }
  return [...seen.values()];
}

export const visibleFields = (c: CritCol, showAll: boolean): string[] => {
  if (showAll) return c.fields.length ? c.fields : ["—"];
  const imp = c.important.length ? c.important : c.fields;
  return imp.length ? imp : ["—"];
};