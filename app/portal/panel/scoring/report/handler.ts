import ExcelJS from "exceljs";
import {
  PanelScoreSummaryRow,
} from "@/types/new/panel-score";
import { deletePanelScoresBulk } from "@/app/api/new/panel/panel-scoring";

const stripHtml = (html: string): string =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

/** Every score row under the given units — for bulk delete. */
export const collectScoreIds = (units: PanelScoreSummaryRow[]): string[] =>
  units.flatMap((u) => u.scores.map((s) => s.id));

/** Admin-only: delete all score rows under the selected units. */
export const deleteUnits = async (units: PanelScoreSummaryRow[]): Promise<{ deleted: number }> => {
  const ids = collectScoreIds(units);
  if (!ids.length) return { deleted: 0 };
  return deletePanelScoresBulk(ids);
};

/** Full export — one sheet of summary units, one sheet of every reviewer score. */
export const exportScoresReport = async (rows: PanelScoreSummaryRow[]): Promise<void> => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BPTAP";
  wb.created = new Date();

  const HEADER_FILL: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF27AAE1" },
  };
  const headerRowStyle = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
      cell.alignment = { vertical: "middle" };
    });
    row.height = 20;
  };

  /* Sheet 1 — Units summary */
  const s1 = wb.addWorksheet("Units");
  s1.columns = [
    { header: "Reference", key: "ref", width: 24 },
    { header: "Type", key: "type", width: 14 },
    { header: "Intervention", key: "name", width: 46 },
    { header: "Service", key: "service", width: 26 },
    { header: "Phase", key: "phase", width: 16 },
    { header: "Package", key: "package", width: 22 },
    { header: "Reviewers Scored", key: "reviewers", width: 18 },
  ];
  headerRowStyle(s1.getRow(1));
  for (const r of rows) {
    s1.addRow({
      ref: r.reference_number || "—",
      type: r.target_type === "intervention" ? "Intervention" : "National Program",
      name: r.intervention || "—",
      service: r.service || "General",
      phase: r.phase || "—",
      package: r.package || "Unassigned",
      reviewers: r.reviewers_scored,
    });
  }
  s1.autoFilter = "A1:G1";
  s1.views = [{ state: "frozen", ySplit: 1 }];

  /* Sheet 2 — All reviewer scores */
  const s2 = wb.addWorksheet("Scores");
  s2.columns = [
    { header: "Reference", key: "ref", width: 24 },
    { header: "Intervention", key: "name", width: 40 },
    { header: "Service", key: "service", width: 24 },
    { header: "Phase", key: "phase", width: 16 },
    { header: "Reviewer", key: "reviewer", width: 22 },
    { header: "Criterion", key: "criterion", width: 30 },
    { header: "Selected Option", key: "option", width: 60 },
    { header: "Score", key: "score", width: 10 },
    { header: "Notes", key: "notes", width: 40 },
    { header: "Scored At", key: "at", width: 22 },
  ];
  headerRowStyle(s2.getRow(1));
  for (const r of rows) {
    for (const sc of r.scores) {
      s2.addRow({
        ref: r.reference_number || "—",
        name: r.intervention || "—",
        service: r.service || "General",
        phase: r.phase || "—",
        reviewer: sc.reviewer_name,
        criterion: sc.criteria_name,
        option: stripHtml(sc.scoring_approach),
        score: sc.score ?? "",
        notes: sc.comment || "",
        at: sc.created_at ? new Date(sc.created_at).toLocaleString("en-GB") : "",
      });
    }
  }
  s2.autoFilter = "A1:J1";
  s2.views = [{ state: "frozen", ySplit: 1 }];
  s2.eachRow({ includeEmpty: false }, (row, i) => {
    if (i > 1) row.getCell("option").alignment = { wrapText: true, vertical: "top" };
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `panel-scores-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};