import ExcelJS from "exceljs";
import { updateReport } from "@/app/api/new/panel/appraisal-report";
import type {
  AppraisalColumn, AppraisalRow, ImportMode, ParsedReport,
} from "@/types/panel/appraisal-report";

/* ---------- keys & labels ---------- */

export const slug = (s: unknown) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// Light header normalisation only — no fixed schema is imposed.
const ALIASES: Record<string, string> = {
  ref: "ref", reference: "ref", code: "ref",
  "s/no": "", "s/n": "", "s.no": "", no: "", "no.": "", "#": "",
  "proposed intervention": "intervention", intervention: "intervention",
  "benefit package": "package", package: "package",
  service: "service", "service type": "service",  "service name": "service",  "proposed service": "service",
  "service category": "service",
  decision: "decision", "include or exclude": "decision",
  recommendation: "recommendation", score: "score",
  rationale: "rationale", justification: "rationale",
  conditions: "conditions", phase: "phase", "intervention phase": "phase",
};

const isSerial = (label: string) => /^(s\/?\.?no|s\/?n|no\.?|#)$/i.test(label.trim());

const keyFor = (label: string) => {
  const a = ALIASES[label.trim().toLowerCase()];
  return a !== undefined ? a : slug(label);
};

const LABELS: Record<string, string> = {
  ref: "Ref", intervention: "Intervention", package: "Benefit Package",
  service: "Service", phase: "Phase", score: "Score",
  recommendation: "Recommendation", decision: "Decision",
  rationale: "Rationale", conditions: "Conditions",
};
export const labelFor = (k: string) =>
  LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ---------- column derivation (data-driven) ---------- */

const PREFERRED = [
  "ref", "intervention", "package", "service", "phase",
  "score", "recommendation", "decision", "rationale", "conditions",
];
const HIDDEN = new Set(["_key"]);
export const hasVal = (v: unknown) => String(v ?? "").trim() !== "";

/** Columns come entirely from the data: preferred keys first (only if present),
 *  then any remaining keys in the order first seen. */
export const deriveColumns = (rows: AppraisalRow[]): AppraisalColumn[] => {
  const present: string[] = [];
  const seen = new Set<string>();
  rows.forEach((r) =>
    Object.entries(r).forEach(([k, v]) => {
      if (HIDDEN.has(k) || seen.has(k) || !hasVal(v)) return;
      seen.add(k); present.push(k);
    }),
  );
  const head = PREFERRED.filter((k) => seen.has(k));
  const extras = present.filter((k) => !PREFERRED.includes(k));
  return [...head, ...extras].map((k) => ({ key: k, label: labelFor(k) }));
};

/* ---------- parse ---------- */

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

const HINTS = ["ref", "intervention", "proposed intervention", "service", "benefit package", "decision", "score"];
const looksLikeHeader = (cells: string[]) =>
  cells.filter((c) => c.trim()).length >= 2 &&
  cells.some((c) => HINTS.includes(c.trim().toLowerCase()));

// Carry these down across blank cells (merged intervention/ref/package blocks).
const CARRY = new Set(["ref", "intervention", "package"]);

function buildRows(
  grid: string[][], headerIndex: number,
  cols: { index: number; key: string }[],
): AppraisalRow[] {
  const rows: AppraisalRow[] = [];
  const carry: Record<string, string> = {};

  for (let r = headerIndex + 1; r < grid.length; r++) {
    const cells = grid[r];
    if (!cells || !cells.some((c) => (c || "").trim())) continue;

    const row: AppraisalRow = {};
    for (const c of cols) {
      let val = (cells[c.index] || "").trim();
      if (CARRY.has(c.key)) {
        if (val) carry[c.key] = val;
        else val = carry[c.key] ?? "";
      }
      row[c.key] = val;
    }
    if (Object.values(row).some(hasVal)) rows.push(row);
  }
  return rows;
}

/** grid → { columns, rows }. Header auto-detected, serial column dropped. */
export function autoMap(grid: string[][]): ParsedReport {
  if (!grid.length) return { columns: [], rows: [] };
  let hi = grid.findIndex(looksLikeHeader);
  if (hi < 0) hi = 0;

  const cols = grid[hi]
    .map((label, index) => ({ index, label: (label ?? "").trim(), key: keyFor(label ?? "") }))
    .filter((c) => c.label && c.key && !isSerial(c.label));

  const rows = buildRows(grid, hi, cols);
  return { columns: cols.map(({ key }) => ({ key, label: labelFor(key) })), rows };
}

export async function parseWorkbook(file: File): Promise<ParsedReport> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return { columns: [], rows: [] };
  const grid: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= ws.columnCount; c++) cells.push(cellText(row.getCell(c)));
    grid.push(cells);
  });
  return autoMap(grid);
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

export const parseCsv = (text: string): ParsedReport => autoMap(splitCsv(text));

export function normalizeJson(parsed: any): ParsedReport {
  const list: any[] = Array.isArray(parsed) ? parsed
    : Array.isArray(parsed?.items) ? parsed.items
    : Array.isArray(parsed?.rows) ? parsed.rows
    : parsed && typeof parsed === "object" ? [parsed] : [];

  const rows: AppraisalRow[] = [];
  for (const it of list) {
    if (!it || typeof it !== "object") continue;
    const row: AppraisalRow = {};
    for (const [k, v] of Object.entries(it)) {
      const key = keyFor(k);
      if (!key) continue;
      row[key] = typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    }
    if (Object.values(row).some(hasVal)) rows.push(row);
  }
  return { columns: deriveColumns(rows), rows };
}

/** Single entry point: dispatch by extension. */
export async function parse(file: File): Promise<ParsedReport> {
  const n = file.name.toLowerCase();
  if (n.endsWith(".json")) return normalizeJson(JSON.parse(await file.text()));
  if (n.endsWith(".csv")) return parseCsv(await file.text());
  return parseWorkbook(file);
}

/* ---------- submit ---------- */

// Identity = ref+service (an intervention repeats per service, so ref alone
// is NOT unique). Falls back to intervention+service, then whole-row.
const natKey = (r: AppraisalRow): string => {
  const base = String(r.ref ?? r.intervention ?? "").trim().toLowerCase();
  const svc = String(r.service ?? "").trim().toLowerCase();
  return [base, svc].filter(Boolean).join("|") || JSON.stringify(r);
};

export interface SubmitResult { added: number; items: AppraisalRow[]; }

/** Persist an import. `replace` overwrites; `append` merges, skipping duplicate
 *  ref+service pairs. De-dupes within the batch too. */
export async function submit(opts: {
  id: string;
  existing: AppraisalRow[];
  incoming: AppraisalRow[];
  mode: ImportMode;
}): Promise<SubmitResult> {
  const { id, existing, incoming, mode } = opts;

  const seen = new Set<string>();
  const batch: AppraisalRow[] = [];
  for (const r of incoming) {
    const k = natKey(r);
    if (seen.has(k)) continue;
    seen.add(k);
    batch.push(r);
  }

  let items: AppraisalRow[];
  let added: number;
  if (mode === "append") {
    const have = new Set(existing.map(natKey));
    const fresh = batch.filter((r) => !have.has(natKey(r)));
    added = fresh.length;
    items = [...existing, ...fresh];
  } else {
    added = batch.length;
    items = batch;
  }

  await updateReport(id, { items });
  return { added, items };
}

/* ---------- export ---------- */

const HEADER_FILL = "FF27AAE1";
const GROUP_FILL = "FFFE7105";

export function triggerDownload(buf: ArrayBuffer, filename: string) {
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Export grouped by intervention: the intervention becomes a merged orange
 *  banner and is dropped from the per-row columns; every other present column
 *  (data-driven) is written. */
export async function downloadReport(
  name: string, rows: AppraisalRow[], groupKey = "intervention",
) {
  const cols = deriveColumns(rows).filter((c) => c.key !== groupKey);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet((name || "Appraised").slice(0, 28));

  const head = ["S/No", ...cols.map((c) => c.label)];
  ws.addRow(head).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  const span = head.length;

  const groups = new Map<string, AppraisalRow[]>();
  for (const r of rows) {
    const g = String(r[groupKey] ?? "").trim() || "—";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(r);
  }

  for (const [label, gRows] of groups) {
    const sr = ws.addRow([label]);
    ws.mergeCells(sr.number, 1, sr.number, span);
    const c = sr.getCell(1);
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_FILL } };
    gRows.forEach((r, i) =>
      ws.addRow([i + 1, ...cols.map((col) => String(r[col.key] ?? ""))]).eachCell(
        (cell) => (cell.alignment = { vertical: "top", wrapText: true }),
      ),
    );
  }

  ws.getColumn(1).width = 6;
  cols.forEach((_, i) => (ws.getColumn(i + 2).width = 30));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  triggerDownload(await wb.xlsx.writeBuffer(), `${slug(name) || "appraised-report"}.xlsx`);
}