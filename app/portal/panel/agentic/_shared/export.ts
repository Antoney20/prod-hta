import { AgenticResultRow } from "@/types/new/agentic-results";
import { CritCol, mapFor, } from "./cols";

export async function exportResults(rows: AgenticResultRow[], columns: CritCol[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Appraisal results");

  const header = [
    "Reference", "Name", "Package", "Phase", "Type",
    "Run #", "Generated", "Latest", "Status",  "Selected", "Final comments",
    ...columns.map((c) => c.name),                      
    ...columns.map((c) => `${c.name} — reasoning`),      
    ...columns.map((c) => `${c.name} — notes`),          
  ];
  const r1 = ws.addRow(header);
  r1.font = { bold: true, color: { argb: "FFFFFFFF" } };
  r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF27AAE1" } };
  r1.alignment = { vertical: "middle", horizontal: "left", wrapText: true };

  for (const r of rows) {
    const total = r.appraisals.length;
    r.appraisals.forEach((ap, idx) => {
      const m = mapFor(ap.scores);
      const num = total - idx;                        
      const isLatest = idx === 0;

      const cells: (string | number)[] = [
        r.reference_number ?? "",
        r.name ?? "",
        r.package ?? "",
        r.phase ?? "",
        r.target_type === "national_proposal" ? "National programme" : "Intervention",
        num,
        new Date(ap.created_at).toLocaleString(),
        isLatest ? "Latest" : "",
        ap.success ? "OK" : "Issue",
        ap.selected ? "Yes" : "No",
        ap.final_comments ?? "",
      ];

      for (const c of columns) {
        const s = m.get(c.key);
        cells.push(s?.effective_score ?? s?.score ?? "");
      }
      for (const c of columns) {
        cells.push(m.get(c.key)?.reasoning ?? "");
      }
      for (const c of columns) {
        cells.push(m.get(c.key)?.notes ?? "");
      }

      const row = ws.addRow(cells);
      row.alignment = { vertical: "top", wrapText: true };
      if (isLatest) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF6FC" } };
        });
      }
    });
  }

  const scoreStart = 12;                                 
  const reasonStart = scoreStart + columns.length;
  const notesStart = reasonStart + columns.length;

  ws.columns.forEach((c, i) => {
    const col = i + 1;
    if (col === 2) c.width = 34;                          // name
    else if (col === 7) c.width = 20;  
    else if (col === 11) c.width = 40;                    // generated
    else if (col >= reasonStart) c.width = 48;            // reasoning + notes — wide
    else if (col >= scoreStart) c.width = 12;             // score cols — narrow
    else c.width = 16;                                    // meta
  });

  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 1 }];  

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `appraisal-results-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}