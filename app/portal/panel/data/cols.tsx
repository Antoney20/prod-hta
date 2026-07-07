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