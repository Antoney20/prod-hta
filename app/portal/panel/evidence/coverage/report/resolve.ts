import {
  NA_LABEL,
  cleanVal,
  collectDuplicateRecords,
  combineCi,
  combineIcd,
  combineNote,
  flattenEvidence,
  isPresent,
  makeGetter,
  slug,
  type DuplicateGroup,
  type EvidenceInstance,
  type EvidenceSource,
  type Getter,
} from "./helpers";
import {
  GROUP_ALIASES,
  buildSynthesisSections,
  type ReportSection,
  type SubTable,
  type ValueSpec,
} from "./evidence-map";

/* ------------------------------------------------------------------ *
 * Value resolution. The auto synthesis emits only `field` specs; the
 * others are kept for generality (a section could still carry a ci/note/
 * icd/const row). `computed` is intentionally not handled — it returns
 * null via the default.
 * ------------------------------------------------------------------ */

export function resolveValue(spec: ValueSpec, get: Getter): string | null {
  switch (spec.kind) {
    case "field":
      return isPresent(get(spec.path)) ? String(get(spec.path)).trim() : null;
    case "ci":
      return combineCi(get(spec.value), get(spec.ci));
    case "note":
      return spec.paths.reduce<string | null>(
        (acc, p, i) =>
          i === 0
            ? isPresent(get(p))
              ? String(get(p)).trim()
              : null
            : combineNote(acc, get(p), spec.sep),
        null
      );
    case "icd":
      return combineIcd(get(spec.codes), get(spec.name));
    case "const":
      return spec.text;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ *
 * Render model — what the component walks.
 * ------------------------------------------------------------------ */

export interface RenderRow {
  label: string;
  value: string; // already cleanVal'd -> may be NA_LABEL
  present: boolean;
}
export interface RenderTable {
  caption?: string;
  rows: RenderRow[];
}
export interface RenderSection {
  id: string;
  title: string;
  tables: RenderTable[]; // empty => render emptyText
  notes: string[];
  emptyText: string;
  hasData: boolean;
}

// function resolveTable(t: SubTable, get: Getter): RenderTable | null {
//   const rows: RenderRow[] = t.rows.map((r) => {
//     const raw = resolveValue(r.value, get);
//     return { label: r.label, value: cleanVal(raw), present: isPresent(raw) };
//   });
//   if (t.gated && !rows.some((r) => r.present)) return null;
//   return { caption: t.caption, rows };
// }

function resolveTable(t: SubTable, get: Getter): RenderTable | null {
  const rows: RenderRow[] = t.rows.map((r) => {
    const raw = resolveValue(r.value, get);
    return {
      label: humanizeLabel(r.label),
      value: groupNumeric(cleanVal(raw)),
      present: isPresent(raw),
    };
  });
  if (t.gated && !rows.some((r) => r.present)) return null;
  return { caption: t.caption, rows };
}

export function resolveSection(section: ReportSection, get: Getter): RenderSection {
  const tables = section.tables
    .map((t) => resolveTable(t, get))
    .filter((t): t is RenderTable => t !== null);
  const hasData = tables.some((t) => t.rows.some((r) => r.present));
  return {
    id: section.id,
    title: section.title,
    tables,
    notes: section.notes ?? [],
    emptyText: section.emptyText ?? NA_LABEL,
    hasData,
  };
}


/* Display-only: thousands-group a value that is a clean whole/decimal number.
   String-based so decimal precision is preserved (no toLocaleString rounding).
   Strict full-string match — CIs, ranges, codes, dates pass through unchanged.
   Never feeds back into scoring/band arithmetic; this is the render string. */
const NUMERIC = /^-?\d+(\.\d+)?$/;

const groupNumeric = (s: string): string => {
  const t = s.trim();
  if (!NUMERIC.test(t)) return s;
  const neg = t.startsWith("-");
  const [int, dec] = (neg ? t.slice(1) : t).split(".");
  return (neg ? "-" : "") + int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec != null ? "." + dec : "");
};


/* Field-key → readable label: underscores to spaces, collapse runs, then
   uppercase each word's first LETTER. Number-led words (100000) are untouched,
   and already-caps tokens (GBD, DALYs) are preserved — only the first char is
   ever raised, never lowered. */
const humanizeLabel = (s: string): string =>
  s
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/gi, (c) => c.toUpperCase());
/* ------------------------------------------------------------------ *
 * Top-level build.
 * ------------------------------------------------------------------ */

export interface ReportMeta {
  name: string;
  reference: string;
  package: string;
  kind: string;
  justification: string | null;
}

export interface ReportModel {
  meta: ReportMeta;
  synthesis: RenderSection[];
  duplicates: DuplicateGroup[];
}

export function buildReport(src: EvidenceSource): ReportModel {
  const flat = flattenEvidence(src);
  const get = makeGetter(flat, GROUP_ALIASES);

  const meta: ReportMeta = {
    name: cleanVal(src.name),
    reference: cleanVal(src.reference_number),
    package: cleanVal(src.package?.name),
    kind: src.kind === "intervention" ? "Intervention" : "National Program",
    justification: isPresent(get("intervention.justification"))
      ? String(get("intervention.justification"))
      : null,
  };

  return {
    meta,
    synthesis: buildSynthesisSections(src).map((s) => resolveSection(s, get)),
    duplicates: collectDuplicateRecords(src),
  };
}

/* ------------------------------------------------------------------ *
 * Service tabs — split the report by the service each record names.
 *
 * Grouping key is the criterion's own `service` / `services` COLUMN only.
 * A criterion that declares such a header is "service-bearing": records with
 * a value go to that named-service tab (one record per criterion per tab).
 *
 *  • Overview        — default view; the fullest record per criterion, always
 *                      clean (no duplicate block).
 *  • Named services  — one tab per distinct service value; one record per
 *                      criterion, clean.
 *  • No service      — the collector: every record NOT assigned to a named
 *                      service for this intervention. That means blank-value
 *                      records from service-bearing criteria AND all records
 *                      from criteria that have no service column. Duplicates
 *                      are kept here (this is the only place they show).
 * ------------------------------------------------------------------ */

type CriterionOf = NonNullable<EvidenceSource["criteria"]>[number];

const OVERVIEW_KEY = "__overview__";
const OVERVIEW_LABEL = "Overview";
const NO_SERVICE_KEY = "__no_service__";
const NO_SERVICE_LABEL = "No service";

/** The record-data key of a criterion's service column, or null if none. */
function serviceHeaderKey(c: CriterionOf): string | null {
  for (const h of c?.headers ?? []) {
    const k = slug(h?.key);
    if (k === "service" || k === "services") return h!.key as string;
  }
  return null;
}

/** Instances for a criterion, falling back to the primary `data` record. */
function instancesOf(c: CriterionOf): EvidenceInstance[] {
  if (c?.instances?.length) return c.instances;
  if (c?.data) return [{ data: c.data }];
  return [];
}

/** Read a record's service value via slug-normalised lookup. */
function serviceValueOf(
  data: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  if (!data) return null;
  const want = slug(key);
  for (const [k, v] of Object.entries(data)) {
    if (slug(k) === want) return isPresent(v) ? String(v).trim() : null;
  }
  return null;
}

/** Choose the record with the most populated fields. */
function pickFullest(list: EvidenceInstance[]): EvidenceInstance | undefined {
  let best: EvidenceInstance | undefined;
  let bestCount = -1;
  for (const inst of list) {
    const count = Object.values(inst?.data ?? {}).filter(isPresent).length;
    if (count > bestCount) {
      best = inst;
      bestCount = count;
    }
  }
  return best;
}

interface ServiceKey {
  key: string;
  label: string;
}

/** Distinct named service values across service-bearing criteria (first-seen
 *  order), plus whether any record is unassigned to a named service — i.e.
 *  either a blank service value, or any record under a non-service criterion. */
function enumerateServices(src: EvidenceSource): { services: ServiceKey[]; hasNoService: boolean } {
  const seen = new Map<string, string>();
  let hasNoService = false;
  for (const c of src.criteria ?? []) {
    const svcKey = serviceHeaderKey(c);
    if (!svcKey) {
      if (instancesOf(c).length > 0) hasNoService = true;
      continue;
    }
    for (const inst of instancesOf(c)) {
      const v = serviceValueOf(inst?.data, svcKey);
      if (v == null) {
        hasNoService = true;
        continue;
      }
      const k = v.toLowerCase();
      if (!seen.has(k)) seen.set(k, v);
    }
  }
  return { services: [...seen.entries()].map(([key, label]) => ({ key, label })), hasNoService };
}

/** A source copy for a NAMED service: each criterion keeps only the single
 *  record matching that service value; non-service criteria keep their fullest
 *  record so every tab still shows all criteria. Clean, one record each. */
function filterSourceByNamedService(src: EvidenceSource, serviceKey: string): EvidenceSource {
  const criteria = (src.criteria ?? []).map((c) => {
    const svcKey = serviceHeaderKey(c);
    let chosen: EvidenceInstance | undefined;
    if (!svcKey) {
      chosen = pickFullest(instancesOf(c));
    } else {
      const matching = instancesOf(c).filter((inst) => {
        const v = serviceValueOf(inst?.data, svcKey);
        return v != null && v.toLowerCase() === serviceKey;
      });
      chosen = pickFullest(matching);
    }
    return { ...c, data: chosen?.data ?? {}, instances: chosen ? [chosen] : [] };
  });
  return { ...src, criteria };
}

/** A source copy for the NO-SERVICE collector: each criterion keeps ALL records
 *  not assigned to a named service — blank-value records (service-bearing) or
 *  every record (non-service criteria). Duplicates are preserved. */
function filterSourceNoService(src: EvidenceSource): EvidenceSource {
  const criteria = (src.criteria ?? []).map((c) => {
    const svcKey = serviceHeaderKey(c);
    const kept = svcKey
      ? instancesOf(c).filter((inst) => serviceValueOf(inst?.data, svcKey) == null)
      : instancesOf(c);
    return {
      ...c,
      data: pickFullest(kept)?.data ?? {},
      instances: kept,
    };
  });
  return { ...src, criteria };
}

export interface ServiceReport {
  key: string;
  label: string;
  model: ReportModel;
}
export interface ServiceReportBundle {
  meta: ReportMeta;
  services: ServiceReport[];
  single: boolean; // true => render the single overview model, no tab bar
}

export function buildServiceReports(src: EvidenceSource): ServiceReportBundle {
  const { services, hasNoService } = enumerateServices(src);

  // Default "Overview": fullest record per criterion, always clean.
  const overview = buildReport(src);
  overview.duplicates = [];

  const tabs: ServiceReport[] = [{ key: OVERVIEW_KEY, label: OVERVIEW_LABEL, model: overview }];

  for (const { key, label } of services) {
    tabs.push({ key, label, model: buildReport(filterSourceByNamedService(src, key)) });
  }

  if (hasNoService) {
    tabs.push({
      key: NO_SERVICE_KEY,
      label: NO_SERVICE_LABEL,
      model: buildReport(filterSourceNoService(src)),
    });
  }

  const single = services.length === 0 && !hasNoService;

  return { meta: overview.meta, services: tabs, single };
}