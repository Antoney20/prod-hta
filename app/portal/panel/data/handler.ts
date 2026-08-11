import { EvidenceTarget } from "@/types/new/decision-template";
import { CritCol, cellValue, visibleFields } from "./cols";

type PreparedCol = { c: CritCol; fields: string[] };

// neutral only — no brand fills. structure comes from merges + a light grid.
const GRID = { style: "thin", color: { argb: "FFDDDDDD" } } as const;
const RULE = { style: "medium", color: { argb: "FF8A8A8A" } } as const;
const MUTED = "FF8A8A8A";

/** Two-row header: the four fixed columns merge down across both rows, and each
 *  criterion name merges across its field columns. Returns the total column count. */
function writeHeader(ws: any, cols: PreparedCol[]): number {
  const top: string[] = ["Reference", "Name", "Package", "Phase"];
  const sub: string[] = ["", "", "", ""];
  for (const { c, fields } of cols) {
    top.push(c.name, ...Array(Math.max(0, fields.length - 1)).fill(""));
    sub.push(...fields);
  }

  const r1 = ws.addRow(top);
  const r2 = ws.addRow(sub);
  r1.height = 26;
  r2.height = 22;
  [r1, r2].forEach((r: any) => {
    r.font = { bold: true, size: 10 };
    r.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });

  // fixed columns span both header rows
  for (let c = 1; c <= 4; c++) ws.mergeCells(1, c, 2, c);
  // each criterion spans its field columns
  let col = 5;
  for (const { fields } of cols) {
    const span = Math.max(1, fields.length);
    if (span > 1) ws.mergeCells(1, col, 1, col + span - 1);
    col += span;
  }

  return 4 + cols.reduce((n, { fields }) => n + Math.max(1, fields.length), 0);
}

/** Light grid on every cell, a slightly heavier rule under the header, sensible
 *  widths, and frozen header + first four columns. */
function frameSheet(ws: any, totalCols: number) {
  const last = ws.rowCount;
  for (let r = 1; r <= last; r++)
    for (let c = 1; c <= totalCols; c++)
      ws.getCell(r, c).border = { top: GRID, left: GRID, bottom: GRID, right: GRID };

  for (let c = 1; c <= totalCols; c++) {
    const cell = ws.getCell(2, c);
    cell.border = { ...cell.border, bottom: RULE };
  }

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 34;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 16;
  for (let c = 5; c <= totalCols; c++) ws.getColumn(c).width = 22;

  ws.views = [{ state: "frozen", xSplit: 4, ySplit: 2 }];
}

async function saveWorkbook(wb: any, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportGrid(
  targets: EvidenceTarget[], columns: CritCol[], showAll = true,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Evidence");

  const cols: PreparedCol[] = columns.map((c) => ({ c, fields: visibleFields(c, showAll) }));
  const totalCols = writeHeader(ws, cols);

  for (const t of targets) {
    const byName = new Map(t.criteria.map((c) => [c.criterion.trim().toLowerCase(), c] as const));

    // main row — merged / consolidated view
    const main: (string | number)[] = [
      t.reference_number ?? "", t.name ?? "", t.package ?? "", t.phase ?? "",
    ];
    for (const { c, fields } of cols) {
      const cell = byName.get(c.key);
      for (const f of fields) main.push(cell ? cellValue(cell.evidence?.[f]) : "");
    }
    const mr = ws.addRow(main);
    mr.font = { size: 10 };
    mr.alignment = { vertical: "top", wrapText: true };

    // duplicated criteria — one record per row, below the main row
    const maxRec = cols.reduce((n, { c }) => {
      const len = byName.get(c.key)?.children?.length ?? 0;
      return len > 1 ? Math.max(n, len) : n;
    }, 0);
    for (let k = 0; k < maxRec; k++) {
      const sub: (string | number)[] = ["", `Record ${k + 1}`, "", ""];
      for (const { c, fields } of cols) {
        const cell = byName.get(c.key);
        const rec = (cell?.children?.length ?? 0) > 1 ? cell!.children![k] : undefined;
        for (const f of fields) sub.push(rec ? cellValue(rec.evidence?.[f]) : "");
      }
      const sr = ws.addRow(sub);
      sr.font = { size: 10, italic: true, color: { argb: MUTED } };
      sr.alignment = { vertical: "top", wrapText: true };
    }
  }

  frameSheet(ws, totalCols);
  await saveWorkbook(wb, `evidence-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/** A blank version of the same grid — merged headers, no data — for offline use. */
export async function downloadTemplate(columns: CritCol[], showAll = true): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Template");

  const cols: PreparedCol[] = columns.map((c) => ({ c, fields: visibleFields(c, showAll) }));
  const totalCols = writeHeader(ws, cols);

  for (let i = 0; i < 12; i++) ws.addRow([]);   // empty rows to fill in

  frameSheet(ws, totalCols);
  await saveWorkbook(wb, `evidence-template-${new Date().toISOString().slice(0, 10)}.xlsx`);
}