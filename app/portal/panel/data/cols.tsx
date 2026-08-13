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

/** A target's single service (first criterion that carries one), else "No service". */
export function serviceOf(t: EvidenceTarget): string {
  for (const c of t.criteria ?? []) {
    const s = serviceFromEvidence(c.evidence as Record<string, unknown> | undefined);
    if (s) return s;
  }
  return NO_SERVICE;
}

/** One expandable sub-row per distinct service across the target's child records.
 *  `evidence` maps criterion-key -> that service's evidence object for the columns. */
export interface ServiceRow {
  service: string; // display label ("No service" for unassigned)
  evidence: Map<string, Record<string, unknown>>;
}

/** Group a target's child records by service into per-service rows.
 *  Each criterion may carry `children` (record variants); each child's service
 *  is read from its own evidence. Records with no service collect under
 *  "No service". Falls back to the merged `evidence` when a criterion has no
 *  children, so every service row still shows a value where one exists. */
export function serviceRowsOf(t: EvidenceTarget): ServiceRow[] {
  // service label -> (criterion key -> evidence object)
  const groups = new Map<string, Map<string, Record<string, unknown>>>();
  const order: string[] = [];

  const ensure = (label: string) => {
    let g = groups.get(label);
    if (!g) {
      g = new Map();
      groups.set(label, g);
      order.push(label);
    }
    return g;
  };

  for (const c of t.criteria ?? []) {
    const key = c.criterion.trim().toLowerCase();
    const children = (c as any).children as Array<{ evidence?: Record<string, unknown> }> | undefined;

    if (children && children.length) {
      for (const child of children) {
        const ev = child?.evidence ?? {};
        const label = serviceFromEvidence(ev) ?? NO_SERVICE;
        ensure(label).set(key, ev);
      }
    } else if (c.evidence) {
      const ev = c.evidence as Record<string, unknown>;
      const label = serviceFromEvidence(ev) ?? NO_SERVICE;
      ensure(label).set(key, ev);
    }
  }

  // Named services first (first-seen), "No service" last if present.
  const named = order.filter((l) => l !== NO_SERVICE);
  const ordered = groups.has(NO_SERVICE) ? [...named, NO_SERVICE] : named;
  return ordered.map((service) => ({ service, evidence: groups.get(service)! }));
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