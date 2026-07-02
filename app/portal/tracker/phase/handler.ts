// Spreadsheet -> phase bulk rows. Map columns to name | reference | ignore,
// then match the reference against interventions / national programs and the
// phase name against existing phases (iexact).


import type { EvidenceInterventionRef } from "@/types/new/assessment";
import type { ProgramProposal } from "@/types/new/program";
import type { InterventionPhase, PhaseBulkUploadRow } from "@/types/new/intervention-phase";
import { ColRole, ParsedSheet } from "../../benefits-package/packages/handler";


export type MatchKind = "intervention" | "program";

export interface PhaseRow {
  index: number;
  name: string;
  reference: string;
  errors: { target: string; message: string }[];
  match: { kind: MatchKind; id: string | number; ref: string } | null;
  phaseId: number | null;
}

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const lower = (s: unknown) => String(s ?? "").trim().toLowerCase();

/* ----------------------------- auto-map ----------------------------- */

const NAME_ALIASES = ["phase", "round", "iteration", "cycle", "name"];
const REF_ALIASES = [
  "reference", "reference number", "ref", "ref no", "intervention", "intervention no",
  "intervention number", "proposal ref", "program ref", "national program ref",
];

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

export function buildRows(parsed: ParsedSheet, mapping: Record<string, ColRole>): PhaseRow[] {
  const nameCol = parsed.columns.find((c) => mapping[c.key] === "name")?.key;
  const refCol = parsed.columns.find((c) => mapping[c.key] === "reference")?.key;

  return parsed.rows.map((row, i) => ({
    index: i + 1,
    name: String(nameCol ? row[nameCol] ?? "" : "").trim(),
    reference: String(refCol ? row[refCol] ?? "" : "").trim(),
    errors: [],
    match: null,
    phaseId: null,
  }));
}

export function matchRows(
  rows: PhaseRow[],
  interventions: EvidenceInterventionRef[],
  programs: ProgramProposal[],
  phases: InterventionPhase[],
): PhaseRow[] {
  const iByRef = new Map(interventions.map((i) => [norm(i.reference_number), i]));
  const pByRef = new Map(programs.map((p) => [norm(p.reference_number), p]));
  const phaseByName = new Map(phases.map((p) => [lower(p.name), p]));

  return rows.map((r) => {
    const errors: PhaseRow["errors"] = [];

    let phaseId: number | null = null;
    if (!r.name) errors.push({ target: "name", message: "Phase name is required" });
    else {
      const phase = phaseByName.get(lower(r.name));
      if (phase) phaseId = phase.id;
      else errors.push({ target: "name", message: "Phase not found — create it first" });
    }

    let match: PhaseRow["match"] = null;
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

    return { ...r, errors, match, phaseId };
  });
}

export const toPayload = (r: PhaseRow): PhaseBulkUploadRow => ({
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
  await writeSheet("Template", ["Phase", "Reference"], [
    { Phase: "Batch 001", Reference: "INTERV-SHA-2025-01-0001" },
  ], "intervention-phase-link-template.xlsx");
}

export async function exportUnmatched(rows: PhaseRow[]): Promise<void> {
  const bad = rows.filter((r) => r.errors.length);
  await writeSheet("Unmatched", ["Phase", "Reference", "Reason"],
    bad.map((r) => ({ Phase: r.name, Reference: r.reference, Reason: r.errors.map((e) => e.message).join("; ") })),
    "intervention-phase-unmatched.xlsx");
}