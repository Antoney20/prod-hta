

import type { TopicPriority, TopicPriorityWritePayload, DecisionType } from "@/types/new/topic-prioritization";
import { createTopicPriority, updateTopicPriority } from "@/app/api/new/tp";

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (s: unknown) => String(s ?? "").trim();


export type ColRole = "ignore" | "reference" | "decision" | "decision_date" | "routing_decision" | "feedback";

export interface SheetColumn { key: string; col: number; }
export interface ParsedSheet { columns: SheetColumn[]; rows: Record<string, string>[]; }

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

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();
  if (file.name.toLowerCase().endsWith(".csv")) await wb.csv.read(new Blob([buf]).stream());
  else await wb.xlsx.load(buf);

  const ws = wb.worksheets[0];
  if (!ws) return { columns: [], rows: [] };

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

  const rows: Record<string, string>[] = [];
  ws.eachRow({ includeEmpty: false }, (row: any, n: number) => {
    if (n <= 1) return;
    const obj: Record<string, string> = {};
    let has = false;
    for (const c of columns) {
      const v = cellText(row.getCell(c.col).value);
      if (v !== "") has = true;
      obj[c.key] = v;
    }
    if (has) rows.push(obj);
  });

  return { columns, rows };
}

const ALIASES: Record<Exclude<ColRole, "ignore">, string[]> = {
  reference: ["reference", "reference number", "ref", "ref no", "intervention", "intervention no"],
  decision: ["decision", "decision status", "status", "outcome"],
  decision_date: ["decision date", "date", "decided at"],
  routing_decision: ["routing decision", "routing", "route"],
  feedback: ["feedback", "comment", "comments", "note to submitter"],
};

export function autoMap(parsed: ParsedSheet): Record<string, ColRole> {
  const map: Record<string, ColRole> = {};
  const taken = new Set<ColRole>();
  for (const c of parsed.columns) {
    const h = norm(c.key);
    let role: ColRole = "ignore";
    for (const [r, names] of Object.entries(ALIASES) as [Exclude<ColRole, "ignore">, string[]][]) {
      if (!taken.has(r) && names.some((a) => norm(a) === h)) { role = r; taken.add(r); break; }
    }
    map[c.key] = role;
  }
  if (![...taken].includes("reference") && parsed.columns[0]) map[parsed.columns[0].key] = "reference";
  return map;
}

/* ----------------------------- build + match ----------------------------- */

export interface FeedbackRow {
  index: number;
  reference: string;
  decision: string;       // decision NAME from sheet (resolved to id at submit)
  decision_date: string;
  routing_decision: string;
  feedback: string;
  errors: string[];
  match: TopicPriority | null;  // existing status row, if any
}

export function buildRows(
  parsed: ParsedSheet,
  mapping: Record<string, ColRole>,
  records: TopicPriority[],
): FeedbackRow[] {
  const col = (role: ColRole) => parsed.columns.find((c) => mapping[c.key] === role)?.key;
  const refCol = col("reference");
  const decCol = col("decision");
  const dateCol = col("decision_date");
  const routeCol = col("routing_decision");
  const fbCol = col("feedback");

  const byRef = new Map(records.map((r) => [norm(r.reference_number), r]));

  return parsed.rows.map((row, i) => {
    const reference = clean(refCol ? row[refCol] : "");
    const errors: string[] = [];
    if (!reference) errors.push("Reference is required");
    const match = reference ? byRef.get(norm(reference)) ?? null : null;
    if (reference && !match) errors.push("No matching intervention/status record");

    return {
      index: i + 1,
      reference,
      decision: clean(decCol ? row[decCol] : ""),
      decision_date: clean(dateCol ? row[dateCol] : ""),
      routing_decision: clean(routeCol ? row[routeCol] : ""),
      feedback: clean(fbCol ? row[fbCol] : ""),
      errors,
      match,
    };
  });
}

/* ----------------------------- submit ----------------------------- */

export interface BulkResult { updated: number; created: number; failed: number; }

export async function submitRows(
  rows: FeedbackRow[],
  decisions: DecisionType[],
): Promise<BulkResult> {
  const decByName = new Map(decisions.map((d) => [norm(d.name), d.id]));
  const result: BulkResult = { updated: 0, created: 0, failed: 0 };

  for (const r of rows) {
    if (r.errors.length || !r.match) { result.failed++; continue; }

    const decisionId = r.decision ? decByName.get(norm(r.decision)) ?? null : null;
    if (r.decision && !decisionId) { result.failed++; continue; } // unknown decision name

    const payload: Partial<TopicPriorityWritePayload> = {
      intervention: r.match.intervention_id,
      decision: decisionId,
      decision_date: r.decision_date || null,
      routing_decision: r.routing_decision || null,
      feedback: r.feedback,
    };

    // Existing status row → PATCH; scored-only (id null) → POST create
    const ok = r.match.id
      ? await updateTopicPriority(r.match.id, payload)
      : await createTopicPriority(payload as TopicPriorityWritePayload);
    ok ? (r.match.id ? result.updated++ : result.created++) : result.failed++;
  }

  return result;
}

/* ----------------------------- export ----------------------------- */

function stripHtml(html: string): string {
  return String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function downloadFeedbackXlsx(records: TopicPriority[], filename?: string) {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Feedback Status");

  const header = [
    "Reference", "Intervention", "Package", "Phase",
    "Decision", "Routing Decision", "Decision Date", "Scored", "On Panel", "Feedback",
  ];
  ws.addRow(header);
  ws.getRow(1).font = { bold: true };

  for (const r of records) {
    ws.addRow([
      r.reference_number,
      r.intervention_name,
      r.package ?? "",
      r.phase ?? "",
      r.decision?.name ?? "",
      r.routing_decision ?? "",
      r.decision_date ?? "",
      r.is_scored ? "Yes" : "No",
      r.move_to_panel ? "Yes" : "No",
      stripHtml(r.feedback ?? ""),
    ]);
  }

  ws.columns.forEach((c: any, i: number) => {
    c.width = i < 2 ? 30 : i === 9 ? 50 : 18;
    c.alignment = { vertical: "top", wrapText: true };
  });

  const outBuf = await wb.xlsx.writeBuffer();
  const blob = new Blob([outBuf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `feedback-status-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadTemplate() {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Template");
  ws.addRow(["Reference", "Decision", "Decision Date", "Routing Decision", "Feedback"]);
  ws.getRow(1).font = { bold: true };
  ws.addRow(["INTERV-2026-03-11-0002", "Approved", "2026-03-20", "Routed to Panel A", "Meets criteria."]);
  ws.columns.forEach((c: any) => (c.width = 24));
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url; a.download = "feedback-status-template.xlsx"; a.click();
  URL.revokeObjectURL(url);
}