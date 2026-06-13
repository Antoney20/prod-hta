// evidence-extract/handler.ts
// Spreadsheet parse (single OR grouped two-row headers) + criteria-aware mapping
// + intervention/program pre-check. Uses ExcelJS. Install: `npm i exceljs`.

import type { EvidenceCriterion } from "@/types/new/evidence-extraction";
import type { EvidenceExtractionPayload } from "@/types/new/evidence-extraction";
import type { EvidenceInterventionRef } from "@/types/new/assessment";
import type { ProgramProposal } from "@/types/new/program";

/** A resolved spreadsheet column. `group` is the criterion band from the top row (if any). */
export interface SheetColumn {
  key: string;            // unique display key: "Clinical effectiveness · Survival rate" | "Intervention No."
  field: string;          // the variable label (row 2, or the only header row)
  group?: string;         // the criterion band (row 1), only when the header is actually grouped
  col: number;            // 1-based source column index
}

export interface ParsedSheet {
  headers: string[];       // = columns.map(c => c.key)
  columns: SheetColumn[];
  rows: Record<string, any>[];
}

export interface MapTarget {
  key: string;             // "reference" | "icd_11" | `${code}.${fieldKey}`
  label: string;
  group: string;           // "Link" | "Routing" | criterion name
  required: boolean;
  type: "text" | "number" | "date";
  special?: boolean;       // fixed column, not part of `data`
}

export type MatchKind = "intervention" | "program";

export interface ExtractionRow {
  index: number;
  reference: string;
  routing_decision?: string;
  icd_11?: string;
  disease_definition?: string;
  data: Record<string, Record<string, any>>;
  errors: { target: string; message: string }[];
  match: { kind: MatchKind; id: number | string; ref: string } | null;
}

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const addr = (a = "") => { const m = /^([A-Z]+)(\d+)$/.exec(a); return { c: m?.[1] ?? "", r: Number(m?.[2] ?? 0) }; };

/* ----------------------------- parse ----------------------------- */

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();

  if (file.name.toLowerCase().endsWith(".csv")) {
    await wb.csv.read(new Blob([buf]).stream());
  } else {
    await wb.xlsx.load(buf);
  }

  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], columns: [], rows: [] };

  const r1 = ws.getRow(1);
  const r2 = ws.getRow(2);
  const colCount = Math.max(ws.columnCount || 0, ws.actualColumnCount || 0, r1.cellCount || 0, r2.cellCount || 0);

  // grouped header = at least one HORIZONTAL merge in row 1 (a criterion band spanning >1 column)
  let grouped = false;
  for (let col = 1; col <= colCount; col++) {
    const c = r1.getCell(col);
    if (c.isMerged && c.master && addr(c.master.address).r === 1 && addr(c.master.address).c !== addr(c.address).c) {
      grouped = true; break;
    }
  }
  const headerRows = grouped ? 2 : 1;

  // build one SheetColumn per non-empty column, combining the two rows when grouped
  const columns: SheetColumn[] = [];
  const seen = new Map<string, number>();
  for (let col = 1; col <= colCount; col++) {
    let field = "";
    let group: string | undefined;

    if (!grouped) {
      field = cellText(r1.getCell(col).value);
    } else {
      const c1 = r1.getCell(col);
      const c2 = r2.getCell(col);
      // criterion band: master value when this cell is part of a horizontal merge, else its own value
      const m1 = c1.isMerged && c1.master ? c1.master : c1;
      const band = cellText(m1.value);
      // a cell merged DOWN into row 1 (e.g. A1:A2) is a fixed header that spans both rows
      const verticalSpan = c2.isMerged && c2.master &&
        addr(c2.master.address).r === 1 && addr(c2.master.address).c === addr(c2.address).c;

      if (verticalSpan) { field = band; group = undefined; }
      else {
        field = cellText(c2.value);
        if (!field) { field = band; group = undefined; }     // band sits alone over an empty row-2 cell
        else group = band && norm(band) !== norm(field) ? band : undefined;
      }
    }

    if (!field) continue;
    let key = group ? `${group} · ${field}` : field;
    const dup = seen.get(key);
    if (dup) { seen.set(key, dup + 1); key = `${key} (${dup + 1})`; }
    else seen.set(key, 1);
    columns.push({ key, field, group, col });
  }

  // data starts after the header rows — never treat a header row as data, never drop a data row
  const rows: Record<string, any>[] = [];
  ws.eachRow({ includeEmpty: false }, (row: any, n: number) => {
    if (n <= headerRows) return;
    const obj: Record<string, any> = {};
    let has = false;
    for (const c of columns) {
      const v = cellText(row.getCell(c.col).value);
      if (v !== "") has = true;
      obj[c.key] = v;
    }
    if (has) rows.push(obj);
  });

  return { headers: columns.map((c) => c.key), columns, rows };
}

function cellText(value: any): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return String(value.text ?? "");
    if ("result" in value) return String(value.result ?? "");
    if ("richText" in value) return value.richText.map((t: any) => t.text).join("");
    return "";
  }
  return String(value).trim();
}

/* ----------------------------- targets + auto-map ----------------------------- */

const FIXED: MapTarget[] = [
  { key: "reference", label: "Intervention / Program Ref", group: "Link", required: true, type: "text", special: true },
  { key: "routing_decision", label: "Routing / Decision", group: "Routing", required: false, type: "text", special: true },
  { key: "icd_11", label: "ICD-11", group: "Routing", required: false, type: "text", special: true },
  { key: "disease_definition", label: "Definition of disease", group: "Routing", required: false, type: "text", special: true },
];

// extra aliases so common sheet headers map without manual help
const ALIASES: Record<string, string[]> = {
  reference: ["intervention no", "intervention number", "reference", "ref no", "ref", "proposal ref"],
  icd_11: ["icd 11", "icd-11", "icd11"],
  routing_decision: ["routing", "decision", "routing decision"],
  disease_definition: ["definition of disease", "disease definition"],
};

export function buildTargets(criteria: EvidenceCriterion[] = []): MapTarget[] {
  const dyn: MapTarget[] = [...criteria]
    .sort((a, b) => a.position - b.position)
    .flatMap((c) =>
      (c.field_schema ?? []).map((f) => ({
        key: `${c.code}.${f.key}`,
        label: f.label || f.key,
        group: c.name,
        required: !!f.required,
        type: (f.type === "number" || f.type === "integer" ? "number" : "text") as MapTarget["type"],
      })),
    );
  return [...FIXED, ...dyn];
}

const isCriterion = (t: MapTarget) => t.group !== "Link" && t.group !== "Routing";

/** Group-aware auto-map: prefer a column whose criterion band AND variable both match,
 *  then fall back to a field-only / alias match. Skips columns already taken. */
export function autoMap(parsed: ParsedSheet, targets: MapTarget[]): Record<string, string> {
  const map: Record<string, string> = {};
  const used = new Set<string>();

  const fieldMatch = (c: SheetColumn, t: MapTarget) => {
    const last = t.key.split(".").pop();
    if (norm(c.field) === norm(t.label) || norm(c.field) === norm(last)) return true;
    return (ALIASES[t.key] ?? []).some((a) => norm(a) === norm(c.field) || norm(a) === norm(c.key));
  };

  // pass 1 — criterion band + variable both match (the grouped-header sweet spot)
  for (const t of targets) {
    if (!isCriterion(t)) continue;
    const hit = parsed.columns.find(
      (c) => !used.has(c.key) && c.group && norm(c.group) === norm(t.group) && fieldMatch(c, t),
    );
    if (hit) { map[t.key] = hit.key; used.add(hit.key); }
  }
  // pass 2 — anything still unmapped, match on field/alias alone
  for (const t of targets) {
    if (map[t.key]) continue;
    const hit = parsed.columns.find((c) => !used.has(c.key) && fieldMatch(c, t));
    if (hit) { map[t.key] = hit.key; used.add(hit.key); }
  }
  return map;
}

export function unmappedRequired(targets: MapTarget[], mapping: Record<string, string>): MapTarget[] {
  return targets.filter((t) => t.required && !mapping[t.key]);
}

/* ----------------------------- coerce + rows ----------------------------- */

function coerce(raw: any, type: MapTarget["type"]): { value: any; error?: string } {
  if (raw == null || raw === "") return { value: "" };
  const s = String(raw).trim();
  if (type === "number") {
    const n = Number(s.replace(/[, ]/g, ""));
    return Number.isNaN(n) ? { value: s } : { value: n };
  }
  if (type === "date") {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? { value: s, error: "invalid date" } : { value: d.toISOString().slice(0, 10) };
  }
  return { value: s };
}

const isEmpty = (v: any) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

export function buildRows(parsed: ParsedSheet, mapping: Record<string, string>, targets: MapTarget[]): ExtractionRow[] {
  return parsed.rows.map((row, i) => {
    const errors: ExtractionRow["errors"] = [];
    const data: Record<string, Record<string, any>> = {};
    const fixed: Record<string, any> = {};

    for (const t of targets) {
      const header = mapping[t.key];
      const { value, error } = coerce(header ? row[header] : "", t.type);
      if (t.required && isEmpty(value)) errors.push({ target: t.key, message: `${t.label} is required` });
      else if (error) errors.push({ target: t.key, message: `${t.label}: ${error}` });

      if (isEmpty(value)) continue;
      if (t.special) fixed[t.key] = value;
      else {
        const [code, fk] = t.key.split(".");
        (data[code] ??= {})[fk] = value;
      }
    }

    return {
      index: i + 1,
      reference: String(fixed.reference ?? ""),
      routing_decision: fixed.routing_decision,
      icd_11: fixed.icd_11,
      disease_definition: fixed.disease_definition,
      data,
      errors,
      match: null,
    };
  });
}

/* ----------------------------- pre-check (reference matching) ----------------------------- */

export function matchRows(
  rows: ExtractionRow[],
  interventions: EvidenceInterventionRef[],
  programs: ProgramProposal[],
): ExtractionRow[] {
  const iByRef = new Map(interventions.map((i) => [norm(i.reference_number), i]));
  const pByRef = new Map(programs.map((p) => [norm(p.reference_number), p]));
  return rows.map((r) => {
    const key = norm(r.reference);
    const iv = iByRef.get(key);
    const pg = !iv ? pByRef.get(key) : undefined;
    const match = iv
      ? { kind: "intervention" as const, id: iv.id, ref: iv.reference_number }
      : pg
        ? { kind: "program" as const, id: pg.id, ref: pg.reference_number }
        : null;
    return { ...r, match };
  });
}

export function toPayload(r: ExtractionRow): EvidenceExtractionPayload {
  return {
    intervention_proposal: r.match?.kind === "intervention" ? String(r.match.id) : null,
    national_proposal: r.match?.kind === "program" ?String(r.match.id) : null,
    routing_decision: r.routing_decision || null,
    icd_11: r.icd_11 || null,
    disease_definition: r.disease_definition || null,
    data: r.data,
  };
}

/* ----------------------------- exports ----------------------------- */

function flat(r: ExtractionRow, targets: MapTarget[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const t of targets) {
    out[t.label] = t.special
      ? (r as any)[t.key] ?? ""
      : r.data[t.key.split(".")[0]]?.[t.key.split(".")[1]] ?? "";
  }
  return out;
}

async function writeSheet(name: string, headers: string[], rows: Record<string, any>[], file: string) {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(name);
  ws.addRow(headers);
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow(headers.map((h) => r[h] ?? "")));
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url; a.download = file; a.click();
  URL.revokeObjectURL(url);
}

export async function exportUnmatched(rows: ExtractionRow[], targets: MapTarget[]): Promise<void> {
  const headers = [...targets.map((t) => t.label), "Reason"];
  const data = rows.map((r) => ({ ...flat(r, targets), Reason: "No matching intervention or national program" }));
  await writeSheet("Unmatched", headers, data, "evidence-unmatched.xlsx");
}

export async function downloadTemplate(criteria: EvidenceCriterion[]): Promise<void> {
  await writeSheet("Template", buildTargets(criteria).map((t) => t.label), [], "evidence-extraction-template.xlsx");
}

export async function exportFailed(
  items: { row: ExtractionRow; error: string }[],
  targets: MapTarget[],
): Promise<void> {
  const headers = [...targets.map((t) => t.label), "Reason"];
  const data = items.map(({ row, error }) => ({ ...flat(row, targets), Reason: error }));
  await writeSheet("Failed", headers, data, "evidence-failed.xlsx");
}