// @/app/portal/panel/scores/_lib/handler.ts
// Export committee weighting scores to an .xlsx workbook (ExcelJS only).

import ExcelJS from "exceljs";

import { CRITERIA, type WeightingScores } from "@/types/panel/survey";
import { criterionLabel, killerLabel, scenarioLabel } from "./labels";

const BLUE = "FF27AAE1";

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
    cell.alignment = { vertical: "middle" };
  });
}

export async function exportScoresToExcel(scores: WeightingScores): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BPTAP";
  wb.created = new Date();

  // Summary
  const summary = wb.addWorksheet("Summary");
  summary.columns = [
    { header: "Metric", key: "m", width: 28 },
    { header: "Value", key: "v", width: 20 },
  ];
  styleHeader(summary.getRow(1));
  summary.addRow({ m: "Survey ID", v: scores.survey_id });
  summary.addRow({ m: "Respondents", v: scores.respondent_count });

  // Criteria weights
  const crit = wb.addWorksheet("Criteria Weights");
  crit.columns = [
    { header: "Rank", key: "rank", width: 8 },
    { header: "Criterion", key: "criterion", width: 40 },
    { header: "Total Points", key: "total", width: 14 },
  ];
  styleHeader(crit.getRow(1));
  scores.criteria.forEach((c, i) => {
    crit.addRow({
      rank: i + 1,
      criterion: criterionLabel(c.criterion),
      total: c.total_points,
    });
  });

  // Per-response scores (respondent + points per criterion)
  const resp = wb.addWorksheet("Responses");
  resp.columns = [
    { header: "Respondent", key: "respondent", width: 30 },
    ...CRITERIA.map((c) => ({ header: c.name, key: c.slug, width: 16 })),
  ];
  styleHeader(resp.getRow(1));
  scores.responses.forEach((r) => {
    const row: Record<string, string | number> = { respondent: r.respondent_name || "Unknown" };
    CRITERIA.forEach((c) => {
      row[c.slug] = r.points[c.slug] ?? 0;
    });
    resp.addRow(row);
  });

  // Killer criteria
  const killer = wb.addWorksheet("Killer Criteria");
  killer.columns = [
    { header: "Criterion", key: "criterion", width: 30 },
    { header: "Killer Votes", key: "votes", width: 14 },
    { header: "Rank Score", key: "rank", width: 14 },
  ];
  styleHeader(killer.getRow(1));
  Object.entries(scores.killer_criteria)
    .sort((a, b) => b[1].rank_score - a[1].rank_score)
    .forEach(([slug, v]) =>
      killer.addRow({ criterion: killerLabel(slug), votes: v.votes, rank: v.rank_score }),
    );

  // Evidence sensitivity
  const sens = wb.addWorksheet("Evidence Sensitivity");
  sens.columns = [
    { header: "Criterion", key: "criterion", width: 40 },
    { header: "Votes", key: "votes", width: 12 },
  ];
  styleHeader(sens.getRow(1));
  Object.entries(scores.sensitivity)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug, count]) => sens.addRow({ criterion: criterionLabel(slug), votes: count }));

  // Trade-offs
  const trade = wb.addWorksheet("Trade-Offs");
  trade.columns = [
    { header: "Scenario", key: "scenario", width: 14 },
    { header: "Option", key: "option", width: 52 },
    { header: "Votes", key: "votes", width: 12 },
  ];
  styleHeader(trade.getRow(1));
  Object.entries(scores.scenario_1).forEach(([slug, count]) =>
    trade.addRow({ scenario: "Scenario 1", option: scenarioLabel(slug), votes: count }),
  );
  Object.entries(scores.scenario_2).forEach(([slug, count]) =>
    trade.addRow({ scenario: "Scenario 2", option: scenarioLabel(slug), votes: count }),
  );

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weighting-scores-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}