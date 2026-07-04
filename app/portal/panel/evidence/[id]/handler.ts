import { EvidenceInterventionRef } from "@/types/new/assessment";
import type { CriterionHeader, CriterionEvidence, EvidenceInput } from "@/types/new/evidence-panel";
import type { ProgramProposal } from "@/types/new/program";

export type TargetKind = "intervention" | "national_proposal";
export type RowMode = "create" | "update" | "error";

export interface TargetRef {
  kind: TargetKind;
  id: string;
  reference_number: string;
  name: string;
}

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
}

export interface EvidenceRowResult {
  index: number;
  reference: string;
  target: TargetRef | null;
  data: Record<string, unknown>;
  match: CriterionEvidence | null;   // existing evidence for this criterion+target
  mode: RowMode;
  errors: string[];
}

const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const normRef = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const isEmpty = (v: any) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

const REF_ALIASES = [
  "referenceno", "reference", "referencenumber", "refno", "ref",
  "interventionno", "interventionnumber", "intervention",
  "proposalref", "programref", "nationalprogramref",
];

export const slugKey = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");


export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();

  if (file.name.toLowerCase().endsWith(".csv")) await wb.csv.read(new Blob([buf]).stream() as any);
  else await wb.xlsx.load(buf);

  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };

  const headers: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
    const v = cellText(cell.value);
    if (v) headers.push(v);
  });
  if (!headers.length) return { headers: [], rows: [] };

  const rows: Record<string, string>[] = [];
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n === 1) return;
    const obj: Record<string, string> = {};
    let has = false;
    headers.forEach((h, i) => {
      const v = cellText(row.getCell(i + 1).value);
      if (v !== "") has = true;
      obj[h] = v;
    });
    if (has) rows.push(obj);
  });

  return { headers, rows };
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

/* ── target index across BOTH sources ────────── */
export function buildTargetIndex(
  interventions: EvidenceInterventionRef[],
  programs: ProgramProposal[],
): Map<string, TargetRef> {
  const m = new Map<string, TargetRef>();
  for (const iv of interventions) {
    if (!iv.reference_number) continue;
    m.set(normRef(iv.reference_number), {
      kind: "intervention",
      id: String(iv.id),
      reference_number: iv.reference_number,
      name: iv.intervention_name ?? iv.reference_number,
    });
  }
  for (const pr of programs) {
    if (!pr.reference_number) continue;
    const k = normRef(pr.reference_number);
    if (m.has(k)) continue;                      // intervention wins on collision
    m.set(k, {
      kind: "national_proposal",
      id: String(pr.id),
      reference_number: pr.reference_number,
      name: pr.title ?? pr.reference_number,
    });
  }
  return m;
}

/** whole-string first, then split compound refs ("A / B / C") and take first hit */
export function resolveTarget(reference: string, index: Map<string, TargetRef>): TargetRef | null {
  const whole = index.get(normRef(reference));
  if (whole) return whole;
  for (const token of reference.split(/[\/;,]/)) {
    const t = index.get(normRef(token));
    if (t) return t;
  }
  return null;
}

/* ── existing evidence for THIS criterion, by target ── */
export function indexEvidenceByTarget(evidence: CriterionEvidence[]): Map<string, CriterionEvidence> {
  const m = new Map<string, CriterionEvidence>();
  for (const e of evidence) {
    const tid = e.intervention ?? e.national_proposal;
    if (tid) m.set(String(tid), e);
  }
  return m;
}

/* ── auto-map: ref + known headers, surface leftovers ── */
export function autoMap(sheetHeaders: string[], headers: CriterionHeader[]): {
  refHeader: string;
  mapping: Record<string, string>;   // headerKey -> sheet column
  newColumns: string[];              // unmapped sheet columns
} {
  const used = new Set<string>();
  const ref = sheetHeaders.find((h) => REF_ALIASES.includes(norm(h)));
  const refHeader = ref ?? "";
  if (ref) used.add(ref);

  const mapping: Record<string, string> = {};
  for (const hd of headers) {
    const hit = sheetHeaders.find(
      (h) => !used.has(h) && (norm(h) === norm(hd.key) || norm(h) === norm(hd.label)),
    );
    if (hit) { mapping[hd.key] = hit; used.add(hit); }
  }

  const newColumns = sheetHeaders.filter((h) => !used.has(h));
  return { refHeader, mapping, newColumns };
}

/* ── coerce a cell against its header type ───── */
export function coerce(raw: any, header: CriterionHeader): { value: any; error?: string } {
  if (raw == null || raw === "") return { value: "" };
  const s = String(raw).trim();
  switch (header.type) {
    case "number": {
      const n = Number(s.replace(/,/g, ""));
      return Number.isNaN(n) ? { value: s, error: "not a number" } : { value: n };
    }
    case "choice": {
      if (header.options?.length && !header.options.includes(s))
        return { value: s, error: `invalid option "${s}"` };
      return { value: s };
    }
    default:
      return { value: s };
  }
}

/* ── build rows: match target, upsert-mode, validate ── */
export function buildRows(
  parsed: ParsedSheet,
  refHeader: string,
  mapping: Record<string, string>,
  headers: CriterionHeader[],
  targetIndex: Map<string, TargetRef>,
  evidenceIndex: Map<string, CriterionEvidence>,
): EvidenceRowResult[] {
  const seen = new Set<string>();
  return parsed.rows.map((row, i) => {
    const errors: string[] = [];
    const reference = refHeader ? String(row[refHeader] ?? "").trim() : "";
    const target = reference ? resolveTarget(reference, targetIndex) : null;

    const data: Record<string, unknown> = {};
    for (const h of headers) {
      const col = mapping[h.key];
      if (!col) continue;
      const { value, error } = coerce(row[col], h);
      if (error) errors.push(`${h.label}: ${error}`);
      if (!isEmpty(value)) data[h.key] = value;
    }

    let mode: RowMode = "error";
    if (!reference) errors.push("Missing reference number");
    else if (!target) errors.push(`Ref "${reference}" not found in interventions or programs`);
    else if (seen.has(target.id)) errors.push("Duplicate reference within this file");
    else {
      seen.add(target.id);
      mode = evidenceIndex.has(target.id) ? "update" : "create";
    }

    return {
      index: i + 1,
      reference,
      target,
      data,
      match: target ? evidenceIndex.get(target.id) ?? null : null,
      mode,
      errors,
    };
  });
}

export function toEvidenceInput(criterionId: string, r: EvidenceRowResult): EvidenceInput {
  const base: EvidenceInput = { criterion: criterionId, data: r.data };
  if (r.target?.kind === "intervention") base.intervention = r.target.id;
  else if (r.target?.kind === "national_proposal") base.national_proposal = r.target.id;
  return base;
}

/* ── template: ref + current data labels ─────── */
export async function downloadTemplate(name: string, code: string, headers: CriterionHeader[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Evidence");
  ws.addRow(["Reference No.", ...headers.map((h) => h.label)]);
  ws.getRow(1).font = { bold: true };
  ws.columns = [{ width: 24 }, ...headers.map(() => ({ width: 22 }))];

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${code || slugKey(name) || "criterion"}-evidence-template.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}