import type { ProgramField, FieldType, NationalProgram, ProgramProposal } from "@/types/new/program";

export type ImportMode = "update" | "skip";
export type RowMode = "create" | "update" | "skip";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, any>[];
}

export interface MapTarget {
  key: string;
  label: string;
  required: boolean;
  type: FieldType | "date" | "text";
  options?: string[];
  special?: boolean;
}

export interface RowResult {
  index: number;
  reference: string;
  title: string;
  justification?: string;
  submitted_date?: string;
  data: Record<string, any>;
  match: ProgramProposal | null;
  mode: RowMode;
  errors: { target: string; message: string }[];
}

export interface AutoMapResult {
  mapping: Record<string, string>;
  newColumns: string[];
}

const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const normRef = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/* ---------------- parse ---------------- */

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();

  if (file.name.toLowerCase().endsWith(".csv")) {
    await wb.csv.read(streamFromBuffer(buf));
  } else {
    await wb.xlsx.load(buf);
  }

  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    const v = cellText(cell.value);
    if (v) headers.push(v);
  });
  if (!headers.length) return { headers: [], rows: [] };

  const rows: Record<string, any>[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, any> = {};
    let hasValue = false;
    headers.forEach((h, i) => {
      const v = cellText(row.getCell(i + 1).value);
      if (v !== "") hasValue = true;
      obj[h] = v;
    });
    if (hasValue) rows.push(obj);
  });

  return { headers, rows };
}

function cellText(value: any): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return String((value as any).text ?? "");
    if ("result" in value) return String((value as any).result ?? "");
    if ("richText" in value) return (value as any).richText.map((t: any) => t.text).join("");
    return "";
  }
  return String(value).trim();
}

function streamFromBuffer(buf: ArrayBuffer): any {
  return new Blob([buf]).stream();
}

export function buildTargets(fields: ProgramField[] = []): MapTarget[] {
  return [
    { key: "reference_number", label: "Reference No.", required: false, type: "text", special: true },
    { key: "title", label: "Title", required: true, type: "text", special: true },
    { key: "justification", label: "Justification", required: false, type: "text", special: true },
    { key: "submitted_date", label: "Submitted date", required: false, type: "date", special: true },
    ...fields.map((f) => ({
      key: f.key,
      label: f.label || f.key,
      required: !!f.required,
      type: f.type,
      options: f.options,
    })),
  ];
}

// reference column may be named many ways — match generously
const REF_ALIASES = [
  "referenceno", "reference", "referencenumber", "refno", "ref",
  "interventionnumber", "interventionno", "intervention",
  "proposalref", "proposalreference", "programref", "nationalprogramref",
];

export function autoMap(headers: string[], targets: MapTarget[]): AutoMapResult {
  const mapping: Record<string, string> = {};
  const used = new Set<string>();
  for (const t of targets) {
    const hit = headers.find((h) => {
      if (used.has(h)) return false;
      const nh = norm(h);
      if (nh === norm(t.key) || nh === norm(t.label)) return true;
      if (t.key === "reference_number" && REF_ALIASES.includes(nh)) return true;
      return false;
    });
    if (hit) { mapping[t.key] = hit; used.add(hit); }
  }
  const newColumns = headers.filter((h) => !used.has(h));
  return { mapping, newColumns };
}

export function unmappedRequired(targets: MapTarget[], mapping: Record<string, string>): MapTarget[] {
  return targets.filter((t) => t.required && !mapping[t.key]);
}

/** slugify a raw column header into a field key */
export function slugKey(label: string): string {
  return (
    String(label)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field"
  );
}

/** turn picked spreadsheet columns into new plain-text ProgramFields, skipping existing keys */
export function fieldsFromColumns(columns: string[], existing: ProgramField[]): ProgramField[] {
  const existingKeys = new Set(existing.map((f) => f.key));
  const seen = new Set<string>();
  const out: ProgramField[] = [];
  for (const col of columns) {
    const key = slugKey(col);
    if (!key || existingKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, label: col, type: "text" as FieldType, required: false });
  }
  return out;
}

/* ---------------- existing-proposal index ---------------- */

export function indexProposalsByRef(proposals: ProgramProposal[]): Map<string, ProgramProposal> {
  const m = new Map<string, ProgramProposal>();
  for (const p of proposals) {
    if (p.reference_number) m.set(normRef(p.reference_number), p);
  }
  return m;
}

/* ---------------- coercion + validation ---------------- */

export function coerce(raw: any, type: MapTarget["type"]): { value: any; error?: string } {
  if (raw == null || raw === "") return { value: type === "multiselect" ? [] : "" };
  const s = String(raw).trim();

  switch (type) {
    case "number":
    case "integer": {
      const n = Number(s);
      if (Number.isNaN(n)) return { value: s, error: "not a number" };
      if (type === "integer" && !Number.isInteger(n)) return { value: n, error: "not a whole number" };
      return { value: n };
    }
    case "boolean": {
      const t = s.toLowerCase();
      if (["true", "yes", "y", "1"].includes(t)) return { value: true };
      if (["false", "no", "n", "0"].includes(t)) return { value: false };
      return { value: s, error: "use yes/no" };
    }
    case "date": {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return { value: s, error: "invalid date" };
      return { value: d.toISOString().slice(0, 10) };
    }
    case "multiselect":
      return { value: s.split(/[;,|]/).map((x) => x.trim()).filter(Boolean) };
    case "email": {
      if (!/^\S+@\S+\.\S+$/.test(s)) return { value: s, error: "invalid email" };
      return { value: s };
    }
    case "url": {
      if (!/^https?:\/\//i.test(s)) return { value: `https://${s}` };
      return { value: s };
    }
    default:
      return { value: s };
  }
}

function isEmpty(v: any) {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0);
}

/* ---------------- build + match + validate ---------------- */

export function buildRows(
  parsed: ParsedSheet,
  mapping: Record<string, string>,
  targets: MapTarget[],
  refIndex: Map<string, ProgramProposal>,
  importMode: ImportMode,
): RowResult[] {
  const refHeader = mapping["reference_number"];

  return parsed.rows.map((row, i) => {
    const errors: RowResult["errors"] = [];

    const reference = refHeader ? String(row[refHeader] ?? "").trim() : "";
    const match = reference ? refIndex.get(normRef(reference)) ?? null : null;
    const mode: RowMode = !match ? "create" : importMode === "update" ? "update" : "skip";

    const sheetData: Record<string, any> = {};
    let title = "";
    let justification: string | undefined;
    let submitted_date: string | undefined;

    for (const t of targets) {
      if (t.key === "reference_number") continue;
      const header = mapping[t.key];
      const raw = header ? row[header] : "";
      const { value, error } = coerce(raw, t.type);

      if (mode !== "skip") {
        if (t.required && isEmpty(value) && !(mode === "update" && t.key === "title")) {
          errors.push({ target: t.key, message: `${t.label} is required` });
        } else if (error) {
          errors.push({ target: t.key, message: `${t.label}: ${error}` });
        } else if ((t.type === "select" || t.type === "multiselect") && t.options?.length && !isEmpty(value)) {
          const vals = Array.isArray(value) ? value : [value];
          const bad = vals.filter((v) => !t.options!.includes(v));
          if (bad.length) errors.push({ target: t.key, message: `${t.label}: invalid option(s) "${bad.join(", ")}"` });
        }
      }

      if (t.key === "title") title = String(value ?? "");
      else if (t.key === "justification") justification = value || undefined;
      else if (t.key === "submitted_date") submitted_date = value || undefined;
      else if (!isEmpty(value)) sheetData[t.key] = value;
    }

    let finalData = sheetData;
    if (mode === "update" && match) {
      finalData = { ...(match.data ?? {}), ...sheetData };
      if (!title) title = match.title ?? "";
      if (justification === undefined) justification = match.justification ?? undefined;
      if (submitted_date === undefined) submitted_date = (match.submitted_date as string) ?? undefined;
    }

    return { index: i + 1, reference, title, justification, submitted_date, data: finalData, match, mode, errors };
  });
}

/* ---------------- template download ---------------- */

export async function downloadTemplate(program: NationalProgram): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Template");
  ws.addRow(buildTargets(program.field_schema ?? []).map((t) => t.label));
  ws.getRow(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${program.code || "program"}-template.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}