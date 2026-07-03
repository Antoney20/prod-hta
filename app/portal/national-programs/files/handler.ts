import type { ProgramField, FieldType, NationalProgram } from "@/types/new/program";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, any>[];
}

export interface MapTarget {
  key: string;            // "title" | "submitted_date" | field.key
  label: string;
  required: boolean;
  type: FieldType | "date" | "text";
  options?: string[];
  special?: boolean;      // title / submitted_date (fixed columns, not in `data`)
}

export interface RowResult {
  index: number;
  title: string;
  justification?: string;
  submitted_date?: string;
  data: Record<string, any>;
  errors: { target: string; message: string }[];
}

const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

/* ---------------- parse ---------------- */

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();

  // .csv vs .xlsx/.xls — ExcelJS has separate readers
  if (file.name.toLowerCase().endsWith(".csv")) {
    await wb.csv.read(streamFromBuffer(buf));
  } else {
    await wb.xlsx.load(buf);
  }

  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };

  // first non-empty row = headers
  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    const v = cellText(cell.value);
    if (v) headers.push(v);
  });
  if (!headers.length) return { headers: [], rows: [] };

  const rows: Record<string, any>[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
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

// ExcelJS cell values can be rich objects (formula/hyperlink/date) — flatten to text
function cellText(value: any): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return String((value as any).text ?? "");           // rich text / hyperlink
    if ("result" in value) return String((value as any).result ?? "");        // formula
    if ("richText" in value) return (value as any).richText.map((t: any) => t.text).join("");
    return "";
  }
  return String(value).trim();
}

// ExcelJS csv.read wants a Node-ish readable; wrap the ArrayBuffer in a Blob stream
function streamFromBuffer(buf: ArrayBuffer): any {
  return new Blob([buf]).stream();
}

/* ---------------- targets + auto-map ---------------- */

export function buildTargets(fields: ProgramField[] = []): MapTarget[] {
  return [
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

/** Best-effort header→target mapping by normalized key or label. */
export function autoMap(headers: string[], targets: MapTarget[]): Record<string, string> {
  const map: Record<string, string> = {};
  const used = new Set<string>();
  for (const t of targets) {
    const hit = headers.find(
      (h) => !used.has(h) && (norm(h) === norm(t.key) || norm(h) === norm(t.label)),
    );
    if (hit) {
      map[t.key] = hit;
      used.add(hit);
    }
  }
  return map;
}

export function unmappedRequired(targets: MapTarget[], mapping: Record<string, string>): MapTarget[] {
  return targets.filter((t) => t.required && !mapping[t.key]);
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

/** Build typed rows + collect per-cell errors against the mapping. */
export function buildRows(
  parsed: ParsedSheet,
  mapping: Record<string, string>,
  targets: MapTarget[],
): RowResult[] {
  return parsed.rows.map((row, i) => {
    const errors: RowResult["errors"] = [];
    const data: Record<string, any> = {};
    let title = "";
    let justification: string | undefined;
    let submitted_date: string | undefined;

    for (const t of targets) {
      const header = mapping[t.key];
      const raw = header ? row[header] : "";
      const { value, error } = coerce(raw, t.type);

      if (t.required && isEmpty(value)) {
        errors.push({ target: t.key, message: `${t.label} is required` });
      } else if (error) {
        errors.push({ target: t.key, message: `${t.label}: ${error}` });
      } else if ((t.type === "select" || t.type === "multiselect") && t.options?.length && !isEmpty(value)) {
        const vals = Array.isArray(value) ? value : [value];
        const bad = vals.filter((v) => !t.options!.includes(v));
        if (bad.length) errors.push({ target: t.key, message: `${t.label}: invalid option(s) "${bad.join(", ")}"` });
      }

      if (t.key === "title") title = String(value ?? "");
      else if (t.key === "justification") justification = value || undefined;
      else if (t.key === "submitted_date") submitted_date = value || undefined;
      else if (!isEmpty(value)) data[t.key] = value;
    }

    return { index: i + 1, title, justification, submitted_date, data, errors };
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