
import { CRITERIA } from "@/types/panel/survey";

function prettify(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function criterionLabel(slug: string): string {
  return CRITERIA.find((c) => c.slug === slug)?.name ?? prettify(slug);
}

const KILLER_LABELS: Record<string, string> = {
  clinical_effectiveness: "Clinical Effectiveness",
  safety: "Safety",
  cost_effectiveness: "Cost-Effectiveness",
  budget_impact: "Budget Impact",
  feasibility: "Feasibility",
  other: "Other",
};
export function killerLabel(slug: string): string {
  return KILLER_LABELS[slug] ?? prettify(slug);
}

const SCENARIO_LABELS: Record<string, string> = {
  tech_a: "Technology A: high effectiveness, high budget impact",
  tech_b: "Technology B: moderate effectiveness, low budget impact",
  tech_c: "Technology C: rare group, large benefit",
  tech_d: "Technology D: general population, small benefit",
};
export function scenarioLabel(slug: string): string {
  return SCENARIO_LABELS[slug] ?? prettify(slug);
}