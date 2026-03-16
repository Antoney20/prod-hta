// utils/export.ts

import { InterventionReport, ScoringReport } from "@/types/new/scoring";

function csvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${str}"`;
}

// Criteria info fields that map to CriteriaInformation model
const CRITERIA_INFO_HEADERS = [
  "Clinical effectiveness safety and quality of the intervention",
  "Burden of disease",
  "Population",
  "Equity",
  "Cost effectiveness",
  "Budgetary impact affordability of the intervention",
  "Feasibility of implementation of the intervention",
  "Catastrophic health expenditure",
  "Access to healthcare",
  "Congruence with existing priorities in the health sector UHC Kenya Health Policy",
];

/**
 * Exports one row per reviewer per intervention.
 * Columns: Ref, Name, Category, Reviewer, Email, <one col per criteria>, Total Score
 */
export function exportScoringReportCSV(
  report: ScoringReport,
  filenamePrefix = "scoring-report"
): void {
  // Flatten all interventions from all categories (deduplicated by intervention_id)
  const seen = new Set<string>();
  const interventions: InterventionReport[] = [];
  for (const group of report.by_category) {
    for (const iv of group.interventions) {
      if (!seen.has(iv.intervention_id)) {
        seen.add(iv.intervention_id);
        interventions.push(iv);
      }
    }
  }

  if (!interventions.length) return;

  // Collect all unique criteria names across the dataset
  const criteriaSet = new Set<string>();
  for (const iv of interventions) {
    for (const r of iv.reviewers) {
      for (const cs of r.criteria_scores) {
        criteriaSet.add(cs.criteria_name);
      }
    }
  }
  // Prefer the canonical order from CRITERIA_INFO_HEADERS, append any extras
  const allCriteria = [
    ...CRITERIA_INFO_HEADERS.filter((h) => criteriaSet.has(h)),
    ...[...criteriaSet].filter((c) => !CRITERIA_INFO_HEADERS.includes(c)).sort(),
  ];

  const headers = [
    "Reference Number",
    "Intervention Name",
    "Intervention Type",
    "System Category",
    "Reviewer Name",
    "Reviewer Email",
    "Scored",
    ...allCriteria,
    "Reviewer Total Score",
    "Intervention Total Score",
  ];

  const rows: string[] = [];

  for (const iv of interventions) {
    const category = iv.system_categories.join(" | ") || "Uncategorized";

    for (const reviewer of iv.reviewers) {
      const criteriaMap = Object.fromEntries(
        reviewer.criteria_scores.map((cs) => [cs.criteria_name, cs.score_value])
      );

      const criteriaValues = allCriteria.map((name) =>
        csvCell(criteriaMap[name] ?? 0)
      );

      rows.push(
        [
          csvCell(iv.reference_number),
          csvCell(iv.intervention_name),
          csvCell(iv.intervention_type),
          csvCell(category),
          csvCell(reviewer.full_name),
          csvCell(reviewer.email),
          csvCell(reviewer.scored ? "Yes" : "No"),
          ...criteriaValues,
          csvCell(reviewer.total_score),
          csvCell(iv.total_score),
        ].join(",")
      );
    }
  }

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}