import ExcelJS from "exceljs";
import {
  WeightingReportSuccess,
  AggregateRankingEntry,
} from "@/types/new/weighting";

const BRAND = "FF27AAE1";

function collectAggregateCriteria(report: WeightingReportSuccess): string[] {
  const names = new Set<string>();
  for (const s of report.average_scores) {
    for (const k of Object.keys(s.averaged_criteria)) names.add(k);
  }
  return Array.from(names).sort();
}

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  row.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  row.height = 28;
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });
}

function autoWidth(ws: ExcelJS.Worksheet, min = 10, max = 48) {
  ws.columns.forEach((col) => {
    let longest = 0;
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > longest) longest = len;
    });
    col.width = Math.min(Math.max(longest + 2, min), max);
  });
}

/**
 * Aggregate ranking → XLSX.
 * Fixed columns: Rank, Ref No., Phase, Package, Intervention, Reviewers, Avg Score.
 * Then one column per criteria (averaged weighted score).
 */
export async function exportAggregateXLSX(
  report: WeightingReportSuccess,
  ranking: AggregateRankingEntry[],
  filenamePrefix = "weighting-aggregate"
): Promise<void> {
  if (!ranking.length) return;

  const criteriaNames = collectAggregateCriteria(report);
  const detailMap = Object.fromEntries(
    report.average_scores.map((s) => [s.intervention_id, s])
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "BPTAP";
  wb.created = new Date();
  const ws = wb.addWorksheet("Aggregate Ranking", {
    views: [{ state: "frozen", xSplit: 5, ySplit: 1 }],
  });

  const headers = [
    "Rank",
    "Ref No.",
    "Phase",
    "Package",
    "Intervention",
    "Reviewers",
    "Average Score",
    ...criteriaNames,
  ];
  const headerRow = ws.addRow(headers);
  styleHeader(headerRow);

  for (const row of ranking) {
    const detail = detailMap[row.intervention_id];
    const criteria = detail?.averaged_criteria ?? {};
    const dataRow = ws.addRow([
      row.rank,
      row.intervention_reference ?? "—",
      detail?.phase ?? "—",
      detail?.package ?? "—",
      row.intervention_name,
      row.reviewer_count,
      Number(row.value.toFixed(4)),
      ...criteriaNames.map((c) => {
        const v = criteria[c];
        return v != null && v > 0 ? Number(v.toFixed(4)) : "";
      }),
    ]);
    dataRow.alignment = { vertical: "middle" };
    dataRow.getCell(2).font = { name: "Consolas", size: 10 }; // ref no. mono
  }

  autoWidth(ws);
  await downloadWorkbook(
    wb,
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

/**
 * Individual reviewer scores → XLSX.
 * Fixed columns: Reviewer Email, Reviewer Username, Rank, Ref No., Intervention, Total Score.
 * Then one column per criteria (weighted score).
 */
export async function exportIndividualXLSX(
  report: WeightingReportSuccess,
  filenamePrefix = "weighting-individual"
): Promise<void> {
  if (!report.reviewer_scores.length) return;

  const criteriaSet = new Set<string>();
  for (const row of report.reviewer_scores) {
    for (const k of Object.keys(row.weighted_criteria)) criteriaSet.add(k);
  }
  const criteriaNames = Array.from(criteriaSet).sort();

  const rankMap: Record<string, number> = {};
  for (const rr of report.reviewer_rankings) {
    for (const entry of rr.ranked_interventions) {
      rankMap[`${rr.reviewer_id}::${entry.intervention_id}`] = entry.rank;
    }
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "BPTAP";
  wb.created = new Date();
  const ws = wb.addWorksheet("Individual Scores", {
    views: [{ state: "frozen", xSplit: 5, ySplit: 1 }],
  });

  const headers = [
    "Reviewer Email",
    "Reviewer Username",
    "Rank",
    "Ref No.",
    "Intervention",
    "Total Score",
    ...criteriaNames,
  ];
  const headerRow = ws.addRow(headers);
  styleHeader(headerRow);

  for (const row of report.reviewer_scores) {
    const rank = rankMap[`${row.reviewer_id}::${row.intervention_id}`] ?? "";
    const dataRow = ws.addRow([
      row.reviewer_email ?? "",
      row.reviewer_username ?? "",
      rank,
      row.intervention_reference ?? "—",
      row.intervention_name,
      Number(row.total_score.toFixed(4)),
      ...criteriaNames.map((c) => {
        const v = row.weighted_criteria[c];
        return v != null ? Number(v.toFixed(4)) : "";
      }),
    ]);
    dataRow.alignment = { vertical: "middle" };
    dataRow.getCell(4).font = { name: "Consolas", size: 10 };
  }

  autoWidth(ws);
  await downloadWorkbook(
    wb,
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}