import ExcelJS from "exceljs";
import { CriteriaInformation } from "@/types/new/criteria-info";

/* Target-agnostic resolution — mirrors targetOf() in the table so the
 * export shows the same Ref/Name/Type the panel sees on screen. */
function resolveTarget(row: CriteriaInformation) {
  const isNational = row.target_type === "national_proposal";
  return {
    typeLabel: isNational ? "National Programme" : "Intervention",
    name: (isNational ? row.national_proposal_name : row.intervention_name) ?? "",
    ref: (isNational ? row.national_proposal_reference_number : row.intervention_reference_number) ?? "",
  };
}

/* Column definitions — [header, accessor]. Criterion narrative columns are
 * wide; metadata columns are narrow. Order follows the criteria model. */
const COLUMNS: Array<{
  header: string;
  width: number;
  get: (row: CriteriaInformation) => string;
}> = [
  { header: "Ref No.", width: 22, get: (r) => resolveTarget(r).ref },
  { header: "Proposal", width: 34, get: (r) => resolveTarget(r).name },
  { header: "Target Type", width: 18, get: (r) => resolveTarget(r).typeLabel },
  { header: "Package", width: 28, get: (r) => r.package_name ?? "Not assigned" },
  { header: "Created By", width: 22, get: (r) => r.created_by_name ?? "" },
  { header: "Brief Info", width: 40, get: (r) => r.brief_info ?? "" },
  { header: "Clinical Effectiveness", width: 40, get: (r) => r.clinical_effectiveness ?? "" },
  { header: "Burden of Disease", width: 40, get: (r) => r.burden_of_disease ?? "" },
  { header: "BoD Type", width: 14, get: (r) => r.bod_type ?? "" },
  { header: "Population", width: 40, get: (r) => r.population ?? "" },
  { header: "Equity", width: 40, get: (r) => r.equity ?? "" },
  { header: "Cost-Effectiveness", width: 40, get: (r) => r.cost_effectiveness ?? "" },
  { header: "Budget Impact & Affordability", width: 40, get: (r) => r.budget_impact_affordability ?? "" },
  { header: "Feasibility of Implementation", width: 40, get: (r) => r.feasibility_of_implementation ?? "" },
  { header: "Catastrophic Health Expenditure", width: 40, get: (r) => r.catastrophic_health_expenditure ?? "" },
  { header: "Access to Healthcare", width: 40, get: (r) => r.access_to_healthcare ?? "" },
  { header: "Congruence with Health Priorities", width: 40, get: (r) => r.congruence_with_health_priorities ?? "" },
  { header: "Additional Info", width: 40, get: (r) => r.additional_info ?? "" },
  {
    header: "Created At",
    width: 16,
    get: (r) =>
      r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })
        : "",
  },
];

const BRAND_ARGB = "FF27AAE1";

/**
 * Build and download a .xlsx of the supplied criteria rows.
 * Pass the already-filtered rows so the export matches what's on screen.
 */
export async function exportCriteriaExcel(rows: CriteriaInformation[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  const ws = wb.addWorksheet("Criteria Information", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }));

  // Header styling
  const headerRow = ws.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_ARGB } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB0B0B0" } } };
  });

  // Data rows
  rows.forEach((row) => {
    const added = ws.addRow(COLUMNS.map((c) => c.get(row)));
    added.alignment = { vertical: "top", wrapText: true };
    added.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
    });
  });

  ws.autoFilter = { from: "A1", to: `${ws.getColumn(COLUMNS.length).letter}1` };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `criteria-information-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}