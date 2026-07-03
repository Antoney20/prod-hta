
import type { EvidenceInterventionRef } from "@/types/new/assessment";
import type { ProgramProposal } from "@/types/new/program";
import type { SchemaField, BulkUploadRow, InterventionPackage } from "@/types/new/intervention-package";

export type ColRole = "ignore" | "name" | "reference";
export type MatchKind = "intervention" | "program";
 
export interface SheetColumn {
  key: string; // unique header label
  col: number; // 1-based source column
}
 
export interface ParsedSheet {
  headers: string[];
  columns: SheetColumn[];
  rows: Record<string, any>[];
}
 
export interface PackageRow {
  index: number;
  name: string;
  reference: string;
  errors: { target: string; message: string }[];
  match: { kind: MatchKind; id: string | number; ref: string } | null; // proposal by reference
  packageId: number | null;                                            // existing package by name (iexact)
}
 
const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const lower = (s: unknown) => String(s ?? "").trim().toLowerCase();
 
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
  const colCount = Math.max(ws.columnCount || 0, ws.actualColumnCount || 0, r1.cellCount || 0);
 
  const columns: SheetColumn[] = [];
  const seen = new Map<string, number>();
  for (let col = 1; col <= colCount; col++) {
    const field = cellText(r1.getCell(col).value);
    if (!field) continue;
    let key = field;
    const dup = seen.get(key);
    if (dup) { seen.set(key, dup + 1); key = `${key} (${dup + 1})`; }
    else seen.set(key, 1);
    columns.push({ key, col });
  }
 
  const rows: Record<string, any>[] = [];
  ws.eachRow({ includeEmpty: false }, (row: any, n: number) => {
    if (n <= 1) return; // header
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
 
/* ----------------------------- auto-map ----------------------------- */
 
const NAME_ALIASES = ["package", "package name", "name", "group"];
const REF_ALIASES = [
  "reference", "reference number", "ref", "ref no", "intervention", "intervention no",
  "intervention number", "proposal ref", "program ref", "national program ref",
];
 
/** Guess which column is the package name and which is the reference. */
export function autoMap(parsed: ParsedSheet): Record<string, ColRole> {
  const map: Record<string, ColRole> = {};
  let nameSet = false;
  let refSet = false;
 
  for (const c of parsed.columns) {
    const h = norm(c.key);
    if (!refSet && REF_ALIASES.some((a) => norm(a) === h)) { map[c.key] = "reference"; refSet = true; continue; }
    if (!nameSet && NAME_ALIASES.some((a) => norm(a) === h)) { map[c.key] = "name"; nameSet = true; continue; }
    map[c.key] = "ignore";
  }
 
  // fallbacks: first column = name, second = reference
  if (!nameSet && parsed.columns[0]) { map[parsed.columns[0].key] = "name"; nameSet = true; }
  if (!refSet && parsed.columns[1]) { map[parsed.columns[1].key] = "reference"; refSet = true; }
 
  return map;
}
 
export function unmappedRequired(mapping: Record<string, ColRole>): ("name" | "reference")[] {
  const roles = Object.values(mapping);
  const missing: ("name" | "reference")[] = [];
  if (!roles.includes("name")) missing.push("name");
  if (!roles.includes("reference")) missing.push("reference");
  return missing;
}
 
/* ----------------------------- build + match ----------------------------- */
 
export function buildRows(parsed: ParsedSheet, mapping: Record<string, ColRole>): PackageRow[] {
  const nameCol = parsed.columns.find((c) => mapping[c.key] === "name")?.key;
  const refCol = parsed.columns.find((c) => mapping[c.key] === "reference")?.key;
 
  return parsed.rows.map((row, i) => {
    const name = String(nameCol ? row[nameCol] ?? "" : "").trim();
    const reference = String(refCol ? row[refCol] ?? "" : "").trim();
    return { index: i + 1, name, reference, errors: [], match: null, packageId: null };
  });
}
 
/** Resolve reference -> proposal and package name -> existing package (case-insensitive). */
export function matchRows(
  rows: PackageRow[],
  interventions: EvidenceInterventionRef[],
  programs: ProgramProposal[],
  packages: InterventionPackage[],
): PackageRow[] {
  const iByRef = new Map(interventions.map((i) => [norm(i.reference_number), i]));
  const pByRef = new Map(programs.map((p) => [norm(p.reference_number), p]));
  const pkgByName = new Map(packages.map((p) => [lower(p.name), p]));
 
  return rows.map((r) => {
    const errors: PackageRow["errors"] = [];
 
    // package — case-insensitive name match against existing packages
    let packageId: number | null = null;
    if (!r.name) errors.push({ target: "name", message: "Package name is required" });
    else {
      const pkg = pkgByName.get(lower(r.name));
      if (pkg) packageId = pkg.id;
      else errors.push({ target: "name", message: "Package not found — create it first" });
    }
 
    // reference — match a proposal
    let match: PackageRow["match"] = null;
    if (!r.reference) errors.push({ target: "reference", message: "Reference is required" });
    else {
      const key = norm(r.reference);
      const iv = iByRef.get(key);
      const pg = !iv ? pByRef.get(key) : undefined;
      match = iv
        ? { kind: "intervention", id: iv.id, ref: iv.reference_number }
        : pg
          ? { kind: "program", id: pg.id, ref: pg.reference_number }
          : null;
      if (!match) errors.push({ target: "reference", message: "No matching intervention or program" });
    }
 
    return { ...r, errors, match, packageId };
  });
}
 
export const toPayload = (r: PackageRow): BulkUploadRow => ({
  name: r.name,
  reference_number: r.reference,
});
 
/* ----------------------------- template + export ----------------------------- */
 
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
 
export async function downloadTemplate(): Promise<void> {
  await writeSheet("Template", ["Package", "Reference"], [
    { Package: "Oncology", Reference: "INTERV-SHA-2025-01-0001" },
  ], "intervention-package-link-template.xlsx");
}
 
export async function exportUnmatched(rows: PackageRow[]): Promise<void> {
  const bad = rows.filter((r) => r.errors.length);
  const headers = ["Package", "Reference", "Reason"];
  const data = bad.map((r) => ({
    Package: r.name, Reference: r.reference, Reason: r.errors.map((e) => e.message).join("; "),
  }));
  await writeSheet("Unmatched", headers, data, "intervention-package-unmatched.xlsx");
}