import ExcelJS from "exceljs";
import { PanelScoreSummaryRow } from "@/types/new/panel-score";
import { deletePanelScoresBulk } from "@/app/api/new/panel/panel-scoring";
import {
  criteriaColumns, rowDate, scoreForColumn, reviewersOf, scoreForReviewerColumn,
} from "./report";


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

/** Full export — both sheets are criteria-as-columns pivots.
 *  Sheet 1 "Scores": one row per UNIT (score averaged across reviewers).
 *  Sheet 2 "All scores": one row per REVIEWER per unit (each reviewer's own
 *  scorecard, no averaging). */
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
      cell.alignment = { vertical: "middle", wrapText: true };
    });
    row.height = 26;
  };

  const columns = criteriaColumns(rows);

  /* Sheet 1 — Pivot: one row per unit, one column per criterion */
  const s1 = wb.addWorksheet("Scores");
  s1.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Reference", key: "ref", width: 24 },
    { header: "Type", key: "type", width: 14 },
    { header: "Intervention", key: "name", width: 44 },
    { header: "Service", key: "service", width: 26 },
    { header: "Batch", key: "batch", width: 16 },
    { header: "Reviewers", key: "reviewers", width: 12 },
    ...columns.map((c) => ({ header: c.name, key: `c_${c.key}`, width: 18 })),
  ];
  headerRowStyle(s1.getRow(1));
  for (const r of rows) {
    const rec: Record<string, unknown> = {
      date: rowDate(r).label,
      ref: r.reference_number || "—",
      type: r.target_type === "intervention" ? "Intervention" : "National Program",
      name: r.intervention || "—",
      service: r.service || "General",
      batch: r.phase || "—",
      reviewers: r.reviewers_scored,
    };
    for (const c of columns) {
      const v = scoreForColumn(r, c);
      rec[`c_${c.key}`] = v == null ? "" : v;
    }
    s1.addRow(rec);
  }
  s1.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s1.columnCount } };
  s1.views = [{ state: "frozen", xSplit: 4, ySplit: 1 }];

  /* Sheet 2 — Per reviewer: one row per reviewer per unit, criteria as columns */
  const s2 = wb.addWorksheet("All scores");
  s2.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Reference", key: "ref", width: 24 },
    { header: "Type", key: "type", width: 14 },
    { header: "Intervention", key: "name", width: 44 },
    { header: "Service", key: "service", width: 26 },
    { header: "Batch", key: "batch", width: 16 },
    { header: "Reviewer", key: "reviewer", width: 22 },
    ...columns.map((c) => ({ header: c.name, key: `c_${c.key}`, width: 18 })),
  ];
  headerRowStyle(s2.getRow(1));
  for (const r of rows) {
    for (const rv of reviewersOf(r)) {
      const rec: Record<string, unknown> = {
        date: rowDate(r).label,
        ref: r.reference_number || "—",
        type: r.target_type === "intervention" ? "Intervention" : "National Program",
        name: r.intervention || "—",
        service: r.service || "General",
        batch: r.phase || "—",
        reviewer: rv.reviewer_name || `#${rv.reviewer_id}`,
      };
      for (const c of columns) {
        const v = scoreForReviewerColumn(r, rv.reviewer_id, c);
        rec[`c_${c.key}`] = v == null ? "" : v;
      }
      s2.addRow(rec);
    }
  }
  s2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s2.columnCount } };
  s2.views = [{ state: "frozen", xSplit: 4, ySplit: 1 }];

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