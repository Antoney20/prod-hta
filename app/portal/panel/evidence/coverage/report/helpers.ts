/**
 * report/helpers.ts
 * ------------------------------------------------------------------
 * Pure value primitives ported 1:1 from the R evidence-synthesis script
 * (clean_val, is_present, combine_ci, combine_note, is_affirmative,
 * detect_databases, bucket_outcome) plus the flattening layer that turns
 * a CoverageDetail into the same flat `group__field` namespace the R code
 * read out of the Excel workbook.
 *
 * Nothing here renders or knows about React. The report engine (resolve.ts)
 * and the map (evidence-map.ts) build on top of these.
 */

export const NA_LABEL = "No Data";

const NA_TOKENS = new Set(["not_available", "not_applicable", "na", "n/a", ""]);
const YES_TOKENS = new Set(["yes", "y", "true", "1", "done", "conducted"]);
const NO_TOKENS = new Set(["no", "n", "false", "0", "not conducted", "not done"]);

/** R: slugify() — lower, squish, non-alnum -> "_", trim underscores. */
export function slug(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** R: is_present() — a value that actually carries content. */
export function isPresent(v: unknown): boolean {
  return v !== null && v !== undefined && String(v).trim() !== "";
}

/**
 * R: clean_val() — display-time normalisation. Absent values and the
 * "na / not_available / n/a" family collapse to the NA_LABEL sentinel.
 */
export function cleanVal(v: unknown, na: string = NA_LABEL): string {
  if (!isPresent(v)) return na;
  const t = String(v).trim();
  if (NA_TOKENS.has(t.toLowerCase())) return na;
  return t;
}

/** R: combine_ci() — pair a point estimate with its interval -> "val (ci)". */
export function combineCi(value: unknown, ci: unknown): string | null {
  const hasV = isPresent(value);
  const hasC = isPresent(ci);
  if (hasV && hasC) return `${String(value).trim()} (${String(ci).trim()})`;
  if (hasV) return String(value).trim();
  if (hasC) return String(ci).trim();
  return null;
}

/** R: combine_note() — append an explanation after a separator. Chainable. */
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

/** R: is_affirmative() — tri-state yes/no/unknown from free text. */
export function isAffirmative(v: unknown): boolean | null {
  if (!isPresent(v)) return null;
  const t = String(v).trim().toLowerCase();
  if (YES_TOKENS.has(t)) return true;
  if (NO_TOKENS.has(t)) return false;
  return null;
}

/** R: detect_databases() — match free text against the template checkboxes. */
const KNOWN_DATABASES: Array<[label: string, test: RegExp]> = [
  ["PubMed/MEDLINE", /pubmed|medline/],
  ["Embase", /embase/],
  ["Cochrane Library", /cochrane/],
  ["Scopus", /scopus/],
  ["Web of Science", /web of science|wos\b/],
  ["CINAHL", /cinahl/],
  ["Google Scholar", /google scholar|g[-\s]?scholar|gscholar/],
  ["ClinicalTrials.gov", /clinicaltrials|clinical trials\.?gov|clinical trials registry/],
  ["LILACS", /lilacs/],
  ["PsycINFO", /psyc[h]?info/],
  ["Global Health (CABI)", /global health|cabi/],
  ["African Journals Online (AJOL)", /ajol|african journals/],
  ["WHO Global Index Medicus", /global index medicus|who global|\bgim\b/],
];

/** Canonical database labels, in display order — the checkbox set for Form A.1. */
export const DATABASE_OPTIONS: string[] = KNOWN_DATABASES.map(([label]) => label);

// The Databases field arrives comma- (or ; / newline) separated, any case.
const DB_SPLIT = /[,;\n]+/;

export function splitDatabases(text: unknown): string[] {
  if (!isPresent(text)) return [];
  return String(text)
    .split(DB_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
}

function canonicalDatabase(token: string): string | null {
  const t = token.toLowerCase();
  for (const [label, re] of KNOWN_DATABASES) if (re.test(t)) return label;
  return null;
}

/** Canonical databases present in the free-text list (case-insensitive). */
export function detectDatabases(text: unknown): string[] {
  const out: string[] = [];
  for (const tok of splitDatabases(text)) {
    const c = canonicalDatabase(tok);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

/**
 * Tokens that don't map to a known database — surfaced verbatim so nothing
 * from the data (an in-house or less common source) is silently dropped.
 */
export function extraDatabases(text: unknown): string[] {
  const out: string[] = [];
  for (const tok of splitDatabases(text)) {
    if (canonicalDatabase(tok)) continue;
    const disp = tok.replace(/\s+/g, " ").trim();
    if (disp && !out.some((x) => x.toLowerCase() === disp.toLowerCase())) out.push(disp);
  }
  return out;
}

/** R: bucket_outcome() — route a free-text outcome to a GRADE row. */
export type GradeOutcome =
  | "Mortality"
  | "Morbidity"
  | "Quality of life"
  | "Serious adverse events";

export function bucketOutcome(text: unknown): GradeOutcome | null {
  const t = cleanVal(text).toLowerCase();
  if (t === NA_LABEL.toLowerCase()) return null;
  if (/mortality|death|survival|fatal/.test(t)) return "Mortality";
  if (/quality of life|qol|satisfaction/.test(t)) return "Quality of life";
  if (/adverse event|sae|toxicity|complication/.test(t)) return "Serious adverse events";
  if (/morbidity|hospitalization|progression|recovery|incidence|prevalence/.test(t))
    return "Morbidity";
  return null;
}

/* ------------------------------------------------------------------ *
 * Flattening: CoverageDetail -> flat `group__field` namespace.
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

/** Minimal structural shape the flattener needs — decoupled from the API type. */
export interface EvidenceSource {
  name?: string | null;
  reference_number?: string | null;
  package?: { name?: string | null } | null;
  phase?: { name?: string | null } | null;
  kind?: string | null;
  criteria?: Array<{
    criterion_name?: string | null;
    data?: Record<string, unknown> | null;
    // optional, forwarded straight from CoverageDetail.criteria — used only to
    // render duplicate records; the declarative engine still reads `data`.
    headers?: EvidenceHeader[] | null;
    score?: number | null;
    instances?: EvidenceInstance[] | null;
  }> | null;
}

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
 * carries more than one evidence row. The declarative synthesis above shows
 * the primary (fullest) record; this exposes every record for the panel.
 * ------------------------------------------------------------------ */

export interface DuplicateRecordRow {
  label: string;
  value: string;   // already cleanVal'd -> may be NA_LABEL
  present: boolean;
}
export interface DuplicateRecord {
  label: string;               // "A", "B", "C", …
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
  headers: EvidenceHeader[],
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
    if (instances.length < 2) continue;   // only surface genuine duplicates
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

/**
 * A getter that resolves a "group.field" (or "group__field") path against the
 * flat namespace, tolerantly:
 *   1. exact group slug,
 *   2. alias substrings (canonical group -> criterion-name fragments),
 *   3. field: exact slug, else unique suffix match inside the group.
 *
 * This tolerance is what lets the map stay readable even when the live
 * criterion names don't match the R column headers verbatim.
 */
export type Getter = (path: string) => unknown;

export function makeGetter(
  data: FlatEvidence,
  aliases: Record<string, string[][]> = {}
): Getter {
  const { byGroup, groups } = data;

  // All groups that satisfy a token: exact slug first, then every alias match.
  // Returning *all* matches (not just the first) lets one logical group span
  // several live criteria — e.g. Burden of Disease split into separate
  // Mortality and Morbidity criteria both feed "burden_of_disease".
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
    // e.g. token "databases" -> key "databases_searched"; token "search_date"
    // -> key "search_dates". Uniqueness guard prevents cross-wiring; tokens
    // shorter than 4 chars only match exactly.
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