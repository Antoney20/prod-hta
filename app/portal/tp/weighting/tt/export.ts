import {
  WeightingReportSuccess,
  AggregateRankingEntry,
  InterventionAggregateScore,
} from "@/types/new/weighting";

function csvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, '""');
  return `"${str}"`;
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function collectCriteriaNames(report: WeightingReportSuccess): string[] {
  const names = new Set<string>();
  for (const s of report.average_scores) {
    for (const k of Object.keys(s.averaged_criteria)) names.add(k);
  }
  return Array.from(names).sort();
}

/**
 * Export aggregate ranking table as CSV.
 * Columns: Rank, Intervention, Reviewers, Avg Score, <criteria...>
 */
export function exportAggregateCSV(
  report: WeightingReportSuccess,
  ranking: AggregateRankingEntry[],
  filenamePrefix = "weighting-aggregate"
): void {
  if (!ranking.length) return;

  const criteriaNames = collectCriteriaNames(report);

  // Build a lookup: intervention_id → averaged_criteria
  const detailMap = Object.fromEntries(
    report.average_scores.map((s) => [s.intervention_id, s.averaged_criteria])
  );

  const headers = [
    "Rank",
    "Intervention",
    "Reviewers",
    "Average Score",
    ...criteriaNames,
  ];

  const rows = ranking.map((row) => {
    const criteria = detailMap[row.intervention_id] ?? {};
    return [
      csvCell(row.rank),
      csvCell(row.intervention_name),
      csvCell(row.reviewer_count),
      csvCell(row.value),
      ...criteriaNames.map((c) => csvCell(criteria[c] ?? "")),
    ].join(",");
  });

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  triggerDownload(csv, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export individual ranking for all reviewers as CSV.
 * Columns: Reviewer, Rank, Intervention, Total Score, <criteria...>
 */
export function exportIndividualCSV(
  report: WeightingReportSuccess,
  filenamePrefix = "weighting-individual"
): void {
  if (!report.reviewer_scores.length) return;

  const criteriaNames = new Set<string>();
  for (const row of report.reviewer_scores) {
    for (const k of Object.keys(row.weighted_criteria)) criteriaNames.add(k);
  }
  const sortedCriteria = Array.from(criteriaNames).sort();

  // Build rank lookup: reviewer_id + intervention_id → rank
  const rankMap: Record<string, number> = {};
  for (const rr of report.reviewer_rankings) {
    for (const entry of rr.ranked_interventions) {
      rankMap[`${rr.reviewer_id}::${entry.intervention_id}`] = entry.rank;
    }
  }

  const headers = [
    "Reviewer Email",
    "Reviewer Username",
    "Rank",
    "Intervention",
    "Total Score",
    ...sortedCriteria,
  ];

  const rows = report.reviewer_scores.map((row) => {
    const rank = rankMap[`${row.reviewer_id}::${row.intervention_id}`] ?? "";
    return [
      csvCell(row.reviewer_email),
      csvCell(row.reviewer_username),
      csvCell(rank),
      csvCell(row.intervention_name),
      csvCell(row.total_score),
      ...sortedCriteria.map((c) => csvCell(row.weighted_criteria[c] ?? "")),
    ].join(",");
  });

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  triggerDownload(csv, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
}