import type { DecisionTemplate, DecisionBand } from "@/types/new/decision-template";

interface CritCol { key: string; name: string; kind: string; features: string[]; }

const bandText = (b: DecisionBand): string => {
  if (b.combo) return b.combo.join(" · ");
  if (b.op) { const v = Array.isArray(b.value) ? b.value.join("–") : b.value; return `${b.op} ${v}`; }
  return b.label ?? "";
};

export async function exportGrid(templates: DecisionTemplate[], columns: CritCol[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Decisions");

  // header row 1: criterion names spanning their features
  const top: string[] = ["Reference", "Target", "Package", "Type"];
  const sub: string[] = ["", "", "", ""];
  for (const c of columns) {
    const feats = c.features.length ? c.features : ["score"];
    top.push(c.name, ...Array(feats.length - 1).fill(""));
    sub.push(...feats);
  }
  const r1 = ws.addRow(top);
  const r2 = ws.addRow(sub);
  [r1, r2].forEach((r) => {
    r.font = { bold: true, color: { argb: "FFFFFFFF" } };
    r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF27AAE1" } };
  });

  // merge criterion name cells across their feature span
  let col = 5; // after the 4 fixed cols (1-indexed)
  for (const c of columns) {
    const span = Math.max(1, c.features.length);
    if (span > 1) ws.mergeCells(1, col, 1, col + span - 1);
    col += span;
  }

  for (const t of templates) {
    const row: (string | number)[] = [
      t.reference_number ?? "",
      t.target_name ?? "",
      t.package_name ?? "",
      t.kind,
    ];
    for (const c of columns) {
      const cell = (t.criteria ?? []).find((x) => x.criterion === c.key);
      const feats = c.features.length ? c.features : ["score"];
      for (const f of feats) {
        if (!cell) { row.push(""); continue; }
        const bands = (cell.selected_bands ?? []).filter((b) => !b.field || b.field === f || f === "score");
        row.push(bands.map((b) => `${bandText(b)}→${b.score}`).join(" | ") || (cell.score ?? ""));
      }
    }
    ws.addRow(row);
  }

  ws.views = [{ state: "frozen", xSplit: 4, ySplit: 2 }];
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `decision-templates-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}