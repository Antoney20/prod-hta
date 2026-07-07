import { EvidenceTarget } from "@/types/new/decision-template";
import { CritCol, cellValue, visibleFields } from "./cols";

export async function exportGrid(
  targets: EvidenceTarget[], columns: CritCol[], showAll = true,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Evidence");

  const cols = columns.map((c) => ({ c, fields: visibleFields(c, showAll) }));

  const top: string[] = ["Reference", "Name", "Package", "Phase"];
  const sub: string[] = ["", "", "", ""];
  for (const { c, fields } of cols) {
    top.push(c.name, ...Array(fields.length - 1).fill(""));
    sub.push(...fields);
  }
  const r1 = ws.addRow(top);
  const r2 = ws.addRow(sub);
  [r1, r2].forEach((r) => {
    r.font = { bold: true, color: { argb: "FFFFFFFF" } };
    r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF27AAE1" } };
    r.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });

  let col = 5;
  for (const { fields } of cols) {
    const span = Math.max(1, fields.length);
    if (span > 1) ws.mergeCells(1, col, 1, col + span - 1);
    col += span;
  }

  for (const t of targets) {
    const byName = new Map(t.criteria.map((c) => [c.criterion.trim().toLowerCase(), c] as const));
    const row: (string | number)[] = [t.reference_number ?? "", t.name ?? "", t.package ?? "", t.kind];
    for (const { c, fields } of cols) {
      const cell = byName.get(c.key);
      for (const f of fields) row.push(cell ? cellValue(cell.evidence?.[f]) : "");
    }
    ws.addRow(row);
  }

  ws.columns.forEach((c) => { c.width = 22; });
  ws.views = [{ state: "frozen", xSplit: 4, ySplit: 2 }];

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `evidence-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}