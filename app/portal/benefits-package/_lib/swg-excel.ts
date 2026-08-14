import ExcelJS from "exceljs";
import {
  DEFAULT_SWG_COLUMNS, DEFAULT_SWG_SECTIONS,
  type SwgColumn, type SwgRow, type SwgSection,
} from "@/types/panel/benefits-package";

const KEY_ALIASES: Record<string, string> = {
  ref: "ref", reference: "ref", "s/no": "", "s/n": "", no: "",
  "proposed intervention": "intervention", intervention: "intervention",
  "benefit package": "package", package: "package",
  justification: "justification",
  "proposed next steps": "next_steps", "next steps": "next_steps",
  "include or exclude": "decision", decision: "decision",
  "service type": "service_type",
  "benefits package access": "package_access",
  "hta type": "hta_type", track: "hta_type",
};

export const slug = (s: unknown) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const keyFor = (label: string) => {
  const alias = KEY_ALIASES[label.trim().toLowerCase()];
  return alias !== undefined ? alias : slug(label);
};

const isSerial = (label: string) => /^(s\/?n|s\/?no|no\.?|#)$/i.test(label.trim());

const sectionKey = (label: string): string => {
  const x = label.toLowerCase();
  if (x.includes("rapid")) return "rapid";
  if (x.includes("full")) return "full";
  if (x.includes("panel") || x.includes("appraisal")) return "panel";
  return slug(label) || "other";
};

const sectionLabel = (key: string) =>
  DEFAULT_SWG_SECTIONS.find((s) => s.key === key)?.label ??
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const cellText = (cell: ExcelJS.Cell): string => {
  const v: any = cell.value;
  if (v == null) return "";
  if (typeof v === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((r: any) => r.text).join("");
    if ("result" in v) return v.result == null ? "" : String(v.result);
    if ("text" in v) return String(v.text);
    if ("hyperlink" in v) return String(v.text ?? v.hyperlink);
  }
  return String(v);
};

export interface ParsedSwg {
  columns: SwgColumn[];
  sections: SwgSection[];
  rows: SwgRow[];
}

const HEADER_HINTS = [
  "ref", "proposed intervention", "intervention",
  "benefit package", "justification", "proposed next steps",
];

const looksLikeHeader = (cells: string[]) =>
  cells.filter((c) => c.trim()).length >= 2 &&
  cells.some((c) => HEADER_HINTS.includes(c.trim().toLowerCase()));

/** Core parser. Header row → columns (serial column dropped).
 *  Any row with exactly one non-empty cell is a section divider. */
export function parseSwgMatrix(grid: string[][]): ParsedSwg {
  if (!grid.length) return { columns: [], sections: [], rows: [] };

  let hi = grid.findIndex(looksLikeHeader);
  if (hi < 0) hi = 0;

  const cols = grid[hi]
    .map((label, index) => ({ index, label: (label ?? "").trim(), key: keyFor(label ?? "") }))
    .filter((c) => c.label && c.key && !isSerial(c.label));

  const sections: SwgSection[] = [];
  const rows: SwgRow[] = [];
  let current = "";

  for (let r = hi + 1; r < grid.length; r++) {
    const cells = grid[r];
    const nonEmpty = cells.filter((c) => (c || "").trim()).length;
    if (nonEmpty === 0) continue;
    if (nonEmpty === 1) {
      const label = (cells.find((c) => (c || "").trim()) || "").trim();
      current = sectionKey(label);
      if (!sections.some((s) => s.key === current)) sections.push({ key: current, label });
      continue;
    }
    const row: SwgRow = { hta_type: current };
    for (const c of cols) row[c.key] = (cells[c.index] || "").trim();
    rows.push(row);
  }

  return { columns: cols.map(({ key, label }) => ({ key, label })), sections, rows };
}

export async function parseSwgWorkbook(file: File): Promise<ParsedSwg> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return { columns: [], sections: [], rows: [] };
  const grid: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= ws.columnCount; c++) cells.push(cellText(row.getCell(c)));
    grid.push(cells);
  });
  return parseSwgMatrix(grid);
}

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export const parseSwgCsv = (text: string): ParsedSwg => parseSwgMatrix(splitCsv(text));

/** JSON: array of rows, or { items | rows | topics: [...] }, or a single object. */
export function normalizeSwgJson(parsed: any): ParsedSwg {
  const list: any[] = Array.isArray(parsed) ? parsed
    : Array.isArray(parsed?.items) ? parsed.items
    : Array.isArray(parsed?.rows) ? parsed.rows
    : Array.isArray(parsed?.topics) ? parsed.topics
    : parsed && typeof parsed === "object" ? [parsed] : [];

  const sections: SwgSection[] = [];
  const rows: SwgRow[] = [];

  for (const it of list) {
    if (!it || typeof it !== "object") continue;
    const row: SwgRow = {};
    for (const [k, v] of Object.entries(it)) {
      const key = keyFor(k);
      if (!key) continue;
      row[key] = typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    }
    if (row.hta_type) row.hta_type = sectionKey(String(row.hta_type));
    if (!Object.values(row).some((v) => String(v ?? "").trim())) continue;
    rows.push(row);
    const hk = String(row.hta_type ?? "");
    if (hk && !sections.some((s) => s.key === hk)) sections.push({ key: hk, label: sectionLabel(hk) });
  }
  return { columns: DEFAULT_SWG_COLUMNS, sections, rows };
}

/* -------- download -------------------------------------------------- */

const HEADER_FILL = "FF27AAE1";
const SECTION_FILL = "FFFE7105";

export function triggerDownload(buf: ArrayBuffer, filename: string) {
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export async function downloadSwg(
  name: string, columns: SwgColumn[], sections: SwgSection[], rows: SwgRow[],
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet((name || "SWG").slice(0, 28));
  const head = ["S/No", ...columns.map((c) => c.label)];
  ws.addRow(head).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  const span = head.length;
  const order: SwgSection[] = sections.length ? sections : [{ key: "", label: "" }];
  for (const sec of order) {
    const secRows = rows.filter((r) => (r.hta_type || "") === sec.key);
    if (!secRows.length && sec.key) continue;
    if (sec.label) {
      const sr = ws.addRow([sec.label]);
      ws.mergeCells(sr.number, 1, sr.number, span);
      const c = sr.getCell(1);
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SECTION_FILL } };
    }
    secRows.forEach((r, i) =>
      ws.addRow([i + 1, ...columns.map((col) => (r[col.key] as string) ?? "")]).eachCell(
        (cell) => (cell.alignment = { vertical: "top", wrapText: true }),
      ),
    );
  }
  ws.getColumn(1).width = 6;
  columns.forEach((_, i) => (ws.getColumn(i + 2).width = i === 0 ? 22 : 36));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  triggerDownload(await wb.xlsx.writeBuffer(), `${name || "swg-prioritized"}.xlsx`);
}