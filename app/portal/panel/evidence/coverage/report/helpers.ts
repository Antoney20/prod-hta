/**
 * report/helpers.ts
 * ------------------------------------------------------------------
 * Pure value primitives + the flattening/getter layer that turns a
 * CoverageDetail into a flat `group__field` namespace. Nothing here
 * renders or knows about React. The auto map (evidence-map.ts) and the
 * resolver (resolve.ts) build on top of these.
 * ------------------------------------------------------------------
 */

export const NA_LABEL = "No Data";

const NA_TOKENS = new Set(["not_available", "not_applicable", "na", "n/a", ""]);

/** slugify() — lower, squish, non-alnum -> "_", trim underscores. */
export function slug(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** is_present() — a value that actually carries content. */
export function isPresent(v: unknown): boolean {
  return v !== null && v !== undefined && String(v).trim() !== "";
}

/**
 * clean_val() — display-time normalisation. Absent values and the
 * "na / not_available / n/a" family collapse to the NA_LABEL sentinel.
 */
export function cleanVal(v: unknown, na: string = NA_LABEL): string {
  if (!isPresent(v)) return na;
  const t = String(v).trim();
  if (NA_TOKENS.has(t.toLowerCase())) return na;
  return t;
}

/** combine_ci() — pair a point estimate with its interval -> "val (ci)". */
export function combineCi(value: unknown, ci: unknown): string | null {
  const hasV = isPresent(value);
  const hasC = isPresent(ci);
  if (hasV && hasC) return `${String(value).trim()} (${String(ci).trim()})`;
  if (hasV) return String(value).trim();
  if (hasC) return String(ci).trim();
  return null;
}

/** combine_note() — append an explanation after a separator. Chainable. */
export function combineNote(
  value: unknown,
  note: unknown,
  sep: string = " - "
): string | null {
  const hasV = isPresent(value);
  const hasN = isPresent(note);
  if (hasV && hasN) return `${String(value).trim()}${sep}${String(note).trim()}`;
  if (hasV) return String(value).trim();
  if (hasN) return String(note).trim();
  return null;
}

/** ICD display used in Burden of Disease: "codes - name" when both present. */
export function combineIcd(codes: unknown, name: unknown): string | null {
  if (isPresent(name) && isPresent(codes)) {
    return `${String(codes).trim()} - ${String(name).trim()}`;
  }
  return isPresent(codes) ? String(codes).trim() : null;
}

/* ------------------------------------------------------------------ *
 * Structural types shared across the report layer.
 * ------------------------------------------------------------------ */

/** One header definition carried alongside a criterion's data. */
export interface EvidenceHeader {
  key: string;
  label: string;
  type?: string;
  options?: string[];
}

/** A single evidence record for a criterion (used to surface duplicates). */
export interface EvidenceInstance {
  evidence_id?: string;
  data?: Record<string, unknown> | null;
  score?: number | null;
}

/** Minimal structural shape the report layer needs — decoupled from the API type. */
export interface EvidenceSource {
  name?: string | null;
  reference_number?: string | null;
  package?: { name?: string | null } | null;
  phase?: { name?: string | null } | null;
  kind?: string | null;
  criteria?: Array<{
    criterion_name?: string | null;
    data?: Record<string, unknown> | null;
    headers?: EvidenceHeader[] | null;
    score?: number | null;
    instances?: EvidenceInstance[] | null;
  }> | null;
}

/* ------------------------------------------------------------------ *
 * Flattening: CoverageDetail -> flat `group__field` namespace.
 * ------------------------------------------------------------------ */

export interface FlatEvidence {
  /** "groupslug__fieldslug" -> raw value (or null). */
  flat: Record<string, unknown>;
  /** groupslug -> { fieldslug: value }. */
  byGroup: Record<string, Record<string, unknown>>;
  /** present group slugs, in source order. */
  groups: string[];
}

/**
 * Build the flat namespace. Every criterion contributes its `data` keyed by
 * slug(criterion_name)__slug(fieldKey). Target-level metadata is exposed under
 * the synthetic "intervention" group so the map can reference name/ref/package.
 */
export function flattenEvidence(src: EvidenceSource): FlatEvidence {
  const flat: Record<string, unknown> = {};
  const byGroup: Record<string, Record<string, unknown>> = {};
  const groups: string[] = [];

  const put = (g: string, f: string, v: unknown) => {
    if (!byGroup[g]) {
      byGroup[g] = {};
      groups.push(g);
    }
    byGroup[g][f] = v;
    flat[`${g}__${f}`] = v;
  };

  // synthetic target metadata group
  put("intervention", "intervention_name", src.name ?? null);
  put("intervention", "intervention_ref_no", src.reference_number ?? null);
  put("intervention", "package", src.package?.name ?? null);
  put("intervention", "phase", src.phase?.name ?? null);

  for (const c of src.criteria ?? []) {
    const g = slug(c?.criterion_name);
    if (!g) continue;
    for (const [k, v] of Object.entries(c?.data ?? {})) {
      put(g, slug(k), v);
    }
  }

  return { flat, byGroup, groups };
}

/* ------------------------------------------------------------------ *
 * Duplicate records — the raw per-record breakdown for any criterion that
 * carries more than one evidence row. The synthesis shows the primary
 * (fullest) record; this exposes every record for the panel.
 * ------------------------------------------------------------------ */

export interface DuplicateRecordRow {
  label: string;
  value: string; // already cleanVal'd -> may be NA_LABEL
  present: boolean;
}
export interface DuplicateRecord {
  label: string; // "A", "B", "C", …
  score: number | null;
  rows: DuplicateRecordRow[];
}
export interface DuplicateGroup {
  criterionName: string;
  records: DuplicateRecord[];
}

const RECORD_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function instanceRows(
  data: Record<string, unknown>,
  headers: EvidenceHeader[]
): DuplicateRecordRow[] {
  if (headers.length) {
    return headers.map((h) => {
      const raw = data[h.key];
      return { label: h.label, value: cleanVal(raw), present: isPresent(raw) };
    });
  }
  // no schema declared → fall back to whatever keys the record carries
  return Object.entries(data).map(([k, v]) => ({
    label: k,
    value: cleanVal(v),
    present: isPresent(v),
  }));
}

export function collectDuplicateRecords(src: EvidenceSource): DuplicateGroup[] {
  const out: DuplicateGroup[] = [];
  for (const c of src.criteria ?? []) {
    const instances = c?.instances ?? [];
    if (instances.length < 2) continue; // only surface genuine duplicates
    const headers = c?.headers ?? [];
    out.push({
      criterionName: (c?.criterion_name ?? "Criterion").trim(),
      records: instances.map((inst, i) => ({
        label: RECORD_LETTERS[i] ?? String(i + 1),
        score: inst?.score ?? null,
        rows: instanceRows(inst?.data ?? {}, headers),
      })),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Getter — resolves a "group.field" (or "group__field") path against the
 * flat namespace, tolerantly:
 *   1. exact group slug,
 *   2. alias substrings (canonical group -> criterion-name fragments),
 *   3. field: exact slug, else unique suffix match inside the group.
 *
 * The auto synthesis uses each criterion's exact slug, so it resolves by
 * exact match; aliases only matter if a caller passes a canonical path.
 * ------------------------------------------------------------------ */

export type Getter = (path: string) => unknown;

export function makeGetter(
  data: FlatEvidence,
  aliases: Record<string, string[][]> = {}
): Getter {
  const { byGroup, groups } = data;

  const resolveGroups = (token: string): string[] => {
    const s = slug(token);
    const out: string[] = [];
    if (byGroup[s]) out.push(s);
    const rules = aliases[s];
    if (rules) {
      for (const g of groups) {
        if (g === s) continue;
        if (rules.some((need) => need.every((n) => g.includes(slug(n))))) out.push(g);
      }
    }
    return out;
  };

  const resolveField = (g: string, token: string): unknown => {
    const bucket = byGroup[g];
    if (!bucket) return null;
    const f = slug(token);
    if (f in bucket) return bucket[f]; // exact wins

    // Tolerant fallback for key-name drift: compare with underscores removed
    // and accept a unique key that contains (or is contained by) the token.
    const norm = (s: string) => slug(s).replace(/_/g, "");
    const fn = norm(f);
    if (fn.length < 4) return null;
    const hits = Object.keys(bucket).filter((k) => {
      const kn = norm(k);
      return kn === fn || kn.includes(fn) || fn.includes(kn);
    });
    return hits.length === 1 ? bucket[hits[0]] : null;
  };

  return (path: string) => {
    const [gTok, ...rest] = path.split(/[.]|__/);
    const fTok = rest.join("_");
    let firstFound: unknown = null;
    let sawGroup = false;
    for (const g of resolveGroups(gTok)) {
      sawGroup = true;
      const v = resolveField(g, fTok);
      if (isPresent(v)) return v; // first group carrying a value wins
      if (firstFound === null) firstFound = v;
    }
    return sawGroup ? firstFound : null;
  };
}