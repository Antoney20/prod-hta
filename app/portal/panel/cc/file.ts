// import { ScoringRow } from "@/types/panel/scoring";


// export interface SheetColumn {
//   key: string; // unique display key
//   field: string; // variable label (row 2, or the only header row)
//   group?: string; // criterion band (row 1) when grouped
//   col: number; // source column index
// }

// export interface ParsedSheet {
//   columns: SheetColumn[];
//   rows: Record<string, string>[];
// }

// /** A column's role in the upload: skip, the ref, the kind, or a data field with a key. */
// export interface ColumnPlan {
//   refKey: string;
//   kindKey: string;
//   fields: { columnKey: string; key: string; include: boolean }[];
// }

// const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
// export const slug = (s: unknown) =>
//   String(s ?? "")
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");
// const addr = (a = "") => {
//   const m = /^([A-Z]+)(\d+)$/.exec(a);
//   return { c: m?.[1] ?? "", r: Number(m?.[2] ?? 0) };
// };

// /* ----------------------------- parse ----------------------------- */

// export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
//   return file.name.toLowerCase().endsWith(".csv")
//     ? parseCsv(await file.text())
//     : parseXlsx(await file.arrayBuffer());
// }

// /* ---- XLSX (ExcelJS) ---- */
// async function parseXlsx(buf: ArrayBuffer): Promise<ParsedSheet> {
//   const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
//   const wb = new ExcelJS.Workbook();
//   await wb.xlsx.load(buf);

//   const ws = wb.worksheets[0];
//   if (!ws) return { columns: [], rows: [] };

//   const r1 = ws.getRow(1);
//   const r2 = ws.getRow(2);
//   const colCount = Math.max(
//     ws.columnCount || 0,
//     ws.actualColumnCount || 0,
//     r1.cellCount || 0,
//     r2.cellCount || 0,
//   );

//   // grouped header = at least one horizontal merge in row 1
//   let grouped = false;
//   for (let col = 1; col <= colCount; col++) {
//     const c = r1.getCell(col);
//     if (
//       c.isMerged &&
//       c.master &&
//       addr(c.master.address).r === 1 &&
//       addr(c.master.address).c !== addr(c.address).c
//     ) {
//       grouped = true;
//       break;
//     }
//   }
//   const headerRows = grouped ? 2 : 1;

//   const columns: SheetColumn[] = [];
//   const seen = new Map<string, number>();
//   for (let col = 1; col <= colCount; col++) {
//     let field = "";
//     let group: string | undefined;

//     if (!grouped) {
//       field = cellText(r1.getCell(col).value);
//     } else {
//       const c1 = r1.getCell(col);
//       const c2 = r2.getCell(col);
//       const m1 = c1.isMerged && c1.master ? c1.master : c1;
//       const band = cellText(m1.value);
//       const verticalSpan =
//         c2.isMerged &&
//         c2.master &&
//         addr(c2.master.address).r === 1 &&
//         addr(c2.master.address).c === addr(c2.address).c;

//       if (verticalSpan) {
//         field = band;
//         group = undefined;
//       } else {
//         field = cellText(c2.value);
//         if (!field) {
//           field = band;
//           group = undefined;
//         } else group = band && norm(band) !== norm(field) ? band : undefined;
//       }
//     }

//     if (!field) continue;
//     let key = group ? `${group} · ${field}` : field;
//     const dup = seen.get(key);
//     if (dup) {
//       seen.set(key, dup + 1);
//       key = `${key} (${dup + 1})`;
//     } else seen.set(key, 1);
//     columns.push({ key, field, group, col });
//   }

//   const rows: Record<string, string>[] = [];
//   ws.eachRow({ includeEmpty: false }, (row: any, n: number) => {
//     if (n <= headerRows) return;
//     const obj: Record<string, string> = {};
//     let has = false;
//     for (const c of columns) {
//       const v = cellText(row.getCell(c.col).value);
//       if (v !== "") has = true;
//       obj[c.key] = v;
//     }
//     if (has) rows.push(obj);
//   });

//   return { columns, rows };
// }

// function cellText(value: any): string {
//   if (value == null) return "";
//   if (value instanceof Date) return value.toISOString().slice(0, 10);
//   if (typeof value === "object") {
//     if ("text" in value) return String(value.text ?? "");
//     if ("result" in value) return String(value.result ?? "");
//     if ("richText" in value) return value.richText.map((t: any) => t.text).join("");
//     return "";
//   }
//   return String(value).trim();
// }

// /* ---- CSV (browser-safe, no ExcelJS stream) ---- */
// // minimal RFC-4180: quoted fields, embedded commas/newlines, "" escapes, CRLF
// function splitCsv(text: string): string[][] {
//   const rows: string[][] = [];
//   let row: string[] = [];
//   let field = "";
//   let q = false;
//   for (let i = 0; i < text.length; i++) {
//     const ch = text[i];
//     if (q) {
//       if (ch === '"') {
//         if (text[i + 1] === '"') { field += '"'; i++; }
//         else q = false;
//       } else field += ch;
//     } else if (ch === '"') q = true;
//     else if (ch === ",") { row.push(field); field = ""; }
//     else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
//     else if (ch !== "\r") field += ch;
//   }
//   if (field !== "" || row.length) { row.push(field); rows.push(row); }
//   return rows.filter((r) => r.some((c) => c.trim() !== ""));
// }

// function parseCsv(text: string): ParsedSheet {
//   const matrix = splitCsv(text);
//   if (!matrix.length) return { columns: [], rows: [] };

//   const r1 = matrix[0] ?? [];
//   const r2 = matrix[1] ?? [];
//   const width = Math.max(r1.length, r2.length);
//   const at = (r: string[] | undefined, i: number) => (r?.[i] ?? "").trim();

//   // grouped two-row header if any band label repeats across columns (CSV has no merges)
//   const grouped = r1.some((v, i) => norm(v) && r1.findIndex((x) => norm(x) === norm(v)) !== i);
//   const headerRows = grouped ? 2 : 1;

//   const columns: SheetColumn[] = [];
//   const seen = new Map<string, number>();
//   let lastBand = "";
//   for (let i = 0; i < width; i++) {
//     let field = "";
//     let group: string | undefined;

//     if (!grouped) {
//       field = at(r1, i);
//     } else {
//       const cell = at(r1, i);
//       const band = cell || lastBand; // forward-fill a band that spans columns
//       if (cell) lastBand = cell;
//       const sub = at(r2, i);
//       field = sub || band;
//       group = sub && band && norm(band) !== norm(sub) ? band : undefined;
//     }

//     if (!field) continue;
//     let key = group ? `${group} · ${field}` : field;
//     const dup = seen.get(key);
//     if (dup) {
//       seen.set(key, dup + 1);
//       key = `${key} (${dup + 1})`;
//     } else seen.set(key, 1);
//     columns.push({ key, field, group, col: i });
//   }

//   const rows: Record<string, string>[] = [];
//   for (let n = headerRows; n < matrix.length; n++) {
//     const obj: Record<string, string> = {};
//     let has = false;
//     for (const c of columns) {
//       const v = at(matrix[n], c.col);
//       if (v !== "") has = true;
//       obj[c.key] = v;
//     }
//     if (has) rows.push(obj);
//   }

//   return { columns, rows };
// }


// const REF_ALIASES = ["intervention", "intervention ref", "intervention no", "intervention number", "reference", "ref", "proposal ref"];
// const KIND_ALIASES = ["kind", "type", "proposal kind"];

// const matchCol = (parsed: ParsedSheet, aliases: string[]) =>
//   parsed.columns.find((c) => aliases.some((a) => norm(a) === norm(c.field) || norm(a) === norm(c.key)))?.key ?? "";

// export function defaultPlan(parsed: ParsedSheet): ColumnPlan {
//   const refKey = matchCol(parsed, REF_ALIASES);
//   const kindKey = matchCol(parsed, KIND_ALIASES);
//   const fields = parsed.columns
//     .filter((c) => c.key !== refKey && c.key !== kindKey)
//     .map((c) => ({ columnKey: c.key, key: slug(c.field), include: true }));
//   return { refKey, kindKey, fields };
// }

// export function planFields(plan: ColumnPlan): string[] {
//   return plan.fields.filter((f) => f.include && f.key).map((f) => f.key);
// }

// export function buildScoringRows(parsed: ParsedSheet, plan: ColumnPlan): ScoringRow[] {
//   return parsed.rows.map((row) => {
//     const out: ScoringRow = {
//       intervention_ref: plan.refKey ? String(row[plan.refKey] ?? "").trim() : "",
//       kind: plan.kindKey ? String(row[plan.kindKey] ?? "").trim() : "",
//     };
//     for (const f of plan.fields) {
//       if (!f.include || !f.key) continue;
//       const v = row[f.columnKey];
//       if (v !== "" && v != null) out[f.key] = v;
//     }
//     return out;
//   });
// }

// export const validRows = (rows: ScoringRow[]) =>
//   rows.filter((r) => r.intervention_ref.trim() && r.kind.trim());

// export const invalidRows = (rows: ScoringRow[]) =>
//   rows.filter((r) => !r.intervention_ref.trim() || !r.kind.trim());