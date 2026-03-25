// utils/export.ts

import { InterventionReport, ScoringReport } from "@/types/new/scoring";

function csvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${str}"`;
}

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

function flattenInterventions(report: ScoringReport): InterventionReport[] {
  const seen = new Set<string>();
  const out: InterventionReport[] = [];
  for (const group of report.by_category) {
    for (const iv of group.interventions) {
      if (!seen.has(iv.intervention_id)) {
        seen.add(iv.intervention_id);
        out.push(iv);
      }
    }
  }
  return out;
}

function collectCriteria(interventions: InterventionReport[]): string[] {
  const criteriaSet = new Set<string>();
  for (const iv of interventions)
    for (const r of iv.reviewers)
      for (const cs of r.criteria_scores)
        criteriaSet.add(cs.criteria_name);

  return [
    ...CRITERIA_INFO_HEADERS.filter((h) => criteriaSet.has(h)),
    ...[...criteriaSet].filter((c) => !CRITERIA_INFO_HEADERS.includes(c)).sort(),
  ];
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

/**
 * Export all data — one row per reviewer per intervention.
 * Columns: Ref, Category, Reviewer, Email, Scored, <criteria...>
 */
export function exportAllDataCSV(
  report: ScoringReport,
  filenamePrefix = "scoring-report-all"
): void {
  const interventions = flattenInterventions(report);
  if (!interventions.length) return;

  const allCriteria = collectCriteria(interventions);

  const headers = [
    "Reference Number",
    "System Category",
    "Reviewer Name",
    "Reviewer Email",
    "Scored",
    ...allCriteria,
  ];

  const rows: string[] = [];

  for (const iv of interventions) {
    const category = iv.system_categories.join(" | ") || "Uncategorized";

    for (const reviewer of iv.reviewers) {
      const criteriaMap = Object.fromEntries(
        reviewer.criteria_scores.map((cs) => [cs.criteria_name, cs.score_value])
      );

      rows.push([
        csvCell(iv.reference_number),
        csvCell(category),
        csvCell(reviewer.full_name),
        csvCell(reviewer.email),
        csvCell(reviewer.scored ? "Yes" : "No"),
        ...allCriteria.map((name) => csvCell(criteriaMap[name] ?? 0)),
      ].join(","));
    }
  }

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  triggerDownload(csv, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export average data — one row per intervention.
 * Columns: Ref, System Category, <avg per criteria...>
 */
export function exportAverageDataCSV(
  report: ScoringReport,
  filenamePrefix = "scoring-report-avg"
): void {
  const interventions = flattenInterventions(report);
  if (!interventions.length) return;

  const allCriteria = collectCriteria(interventions);

  const headers = [
    "Reference Number",
    "System Category",
    ...allCriteria.map((c) => `${c}`),
  ];

  const rows: string[] = [];

  for (const iv of interventions) {
    const category = iv.system_categories.join(" | ") || "Uncategorized";

    const avgValues = allCriteria.map((name) => {
      const scores = iv.reviewers
        .map((r) => r.criteria_scores.find((cs) => cs.criteria_name === name)?.score_value ?? 0)
        .filter((v) => v > 0);
      if (!scores.length) return csvCell(0);
      const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
      return csvCell(avg);
    });

    rows.push([
      csvCell(iv.reference_number),
      csvCell(category),
      ...avgValues,
    ].join(","));
  }

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  triggerDownload(csv, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
}