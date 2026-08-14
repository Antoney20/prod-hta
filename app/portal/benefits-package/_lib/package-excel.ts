import ExcelJS from "exceljs";
import type { ProposedPackage, RevisedPackage } from "@/types/panel/benefits-package";
import { triggerDownload } from "./swg-excel";

const HEADER_FILL = "FF1D70B8";
const GROUP_FILL = "FF27AAE1";

const styleHeader = (row: ExcelJS.Row) =>
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });

const groupRow = (ws: ExcelJS.Worksheet, label: string, span: number) => {
  const gr = ws.addRow([label]);
  ws.mergeCells(gr.number, 1, gr.number, span);
  const gc = gr.getCell(1);
  gc.font = { bold: true, color: { argb: "FFFFFFFF" } };
  gc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_FILL } };
};

export async function downloadProposed(
  pkgs: ProposedPackage[],
  filename = "proposed-benefits-package",
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Proposed");
  const cols = ["S/No", "Ref", "Intervention", "Service", "Routing", "Decision", "Comment"];
  styleHeader(ws.addRow(cols));
  for (const p of pkgs) {
    groupRow(ws, `${p.name}${p.fund ? " — " + p.fund : ""}`, cols.length);
    let n = 1;
    for (const s of p.services)
      for (const it of s.interventions)
        ws.addRow([n++, it.ref, it.name, s.service, it.routing, it.decision, it.comment]).eachCell(
          (c) => (c.alignment = { vertical: "top", wrapText: true }),
        );
  }
  [6, 30, 40, 24, 30, 12, 34].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  triggerDownload(await wb.xlsx.writeBuffer(), `${filename}.xlsx`);
}

export async function downloadRevised(
  pkgs: RevisedPackage[],
  filename = "revised-benefits-package",
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Revised");
  const cols = ["S/No", "Ref", "Intervention", "Service", "Package Access", "Comment"];
  styleHeader(ws.addRow(cols));
  for (const p of pkgs) {
    groupRow(ws, `${p.name}${p.fund ? " — " + p.fund : ""}`, cols.length);
    let n = 1;
    for (const it of p.items)
      ws.addRow([n++, it.ref, it.name, it.service_type, it.package_access, it.comment]).eachCell(
        (c) => (c.alignment = { vertical: "top", wrapText: true }),
      );
  }
  [6, 30, 40, 24, 24, 34].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  triggerDownload(await wb.xlsx.writeBuffer(), `${filename}.xlsx`);
}