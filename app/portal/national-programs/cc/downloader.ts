import type { NationalProgram, ProgramProposal } from "@/types/new/program";
import { htmlToText } from "@/components/shared/text";

function cellValue(v: unknown): string {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return htmlToText(String(v));
}

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB") : "";

// Excel sheet names: ≤31 chars, no  : \ / ? * [ ]
const safeSheetName = (name: string, fallback: string) => {
  const cleaned = (name || fallback).replace(/[:\\/?*[\]]/g, " ").trim();
  return (cleaned || fallback).slice(0, 31);
};

export async function downloadProposalsXlsx(
  programs: NationalProgram[],
  proposals: ProgramProposal[],
  filename?: string,
) {
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();

  // group proposals by program id
  const byProgram = new Map<number, ProgramProposal[]>();
  for (const p of proposals) {
    if (!byProgram.has(p.program)) byProgram.set(p.program, []);
    byProgram.get(p.program)!.push(p);
  }

  // ── Summary sheet: every proposal, program-agnostic core columns ──
  const summary = wb.addWorksheet("All Proposals");
  summary.addRow(["Program Code", "Program", "Ref No.", "Package", "Title", "Justification", "Submitted"]);
  summary.getRow(1).font = { bold: true };

  const progById = new Map(programs.map((p) => [p.id, p]));
  for (const p of proposals) {
    const prog = progById.get(p.program);
    summary.addRow([
      prog?.code ?? "",
      prog?.name ?? "",
      p.reference_number ?? "",
      (p as any).package_name ?? "",
      htmlToText(p.title ?? ""),
      p.justification ? htmlToText(p.justification) : "",
      fmtDate(p.submitted_date),
    ]);
  }
  summary.columns.forEach((c: any, i: number) => {
    c.width = i === 4 || i === 5 ? 40 : 20;
    c.alignment = { vertical: "top", wrapText: true };
  });

  // ── One sheet per program, with that program's dynamic columns ──
  const usedNames = new Set<string>(["All Proposals"]);
  for (const program of programs) {
    const rows = byProgram.get(program.id) ?? [];
    if (rows.length === 0) continue;

    const cols = program.field_schema ?? [];
    let name = safeSheetName(`${program.code} ${program.name}`, `Program ${program.id}`);
    // de-dupe sheet names
    let n = 2;
    while (usedNames.has(name)) name = safeSheetName(`${name} (${n++})`, `Program ${program.id}`);
    usedNames.add(name);

    const ws = wb.addWorksheet(name);
    const header = [
      "Ref No.", "Package", "Title", "Justification",
      ...cols.map((c) => c.label),
      "Submitted",
    ];
    ws.addRow(header);
    ws.getRow(1).font = { bold: true };

    for (const p of rows) {
      ws.addRow([
        p.reference_number ?? "",
        (p as any).package_name ?? "",
        htmlToText(p.title ?? ""),
        p.justification ? htmlToText(p.justification) : "",
        ...cols.map((c) => cellValue((p.data as any)?.[c.key])),
        fmtDate(p.submitted_date),
      ]);
    }

    ws.columns.forEach((c: any) => {
      c.width = 24;
      c.alignment = { vertical: "top", wrapText: true };
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `national-program-proposals-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}