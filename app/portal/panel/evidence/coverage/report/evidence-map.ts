

import { DATABASE_OPTIONS } from "./helpers";

/* ------------------------------------------------------------------ *
 * Value specs — declarative, JSON-serialisable descriptions of a value.
 * ------------------------------------------------------------------ */

export type ValueSpec =
  | { kind: "field"; path: string }
  | { kind: "ci"; value: string; ci: string }
  | { kind: "note"; paths: string[]; sep?: string }
  | { kind: "icd"; codes: string; name: string }
  | { kind: "const"; text: string }
  | { kind: "computed"; id: ComputationId };

export type ComputationId = "effectSummary" | "limitations" | "studiesMetaN";

export const f = (path: string): ValueSpec => ({ kind: "field", path });
export const ci = (value: string, c: string): ValueSpec => ({ kind: "ci", value, ci: c });
export const note = (paths: string[], sep?: string): ValueSpec => ({ kind: "note", paths, sep });
export const icd = (codes: string, name: string): ValueSpec => ({ kind: "icd", codes, name });
export const konst = (text: string): ValueSpec => ({ kind: "const", text });
export const computed = (id: ComputationId): ValueSpec => ({ kind: "computed", id });

/* ------------------------------------------------------------------ */

export interface RowSpec {
  label: string;
  value: ValueSpec;
}
export interface SubTable {
  caption?: string;
  rows: RowSpec[];
  gated?: boolean;
}
export interface ReportSection {
  id: string;
  title: string;
  tables: SubTable[];
  notes?: string[];
  emptyText?: string;
}

/* ------------------------------------------------------------------ *
 * GROUP ALIASES
 * canonical group slug -> list of criterion-name fragment sets.
 * A live criterion matches if its slug contains ALL fragments in any set.
 * The getter searches EVERY matching group, so a split source (Burden of
 * Disease → Mortality + Morbidity criteria) resolves transparently.
 *
 * EDIT THESE to match the criterion names in your CriteriaAppraisalTool.
 * ------------------------------------------------------------------ */

export const GROUP_ALIASES: Record<string, string[][]> = {
  // "clinical" only — never bare "effectiveness" (would grab Cost-Effectiveness)
  clinical_effectiveness: [["clinical", "effectiveness"], ["clinical"]],
  safety: [["safety"]],
  burden_of_disease: [
    ["burden", "disease"], ["burden", "mortality"], ["burden", "morbidity"],
    ["burden"], ["incidence", "occurrence"], ["incidence"],
  ],
  access_to_healthcare: [["access", "healthcare"], ["access"], ["feasibility"]],
  cost_effectiveness: [["cost", "effectiveness"], ["cost", "utility"]],
  budget_impact: [["budget"], ["budgetary", "affordability"], ["budgetary"]],
  catastrophic_health_expenditure: [["catastrophic", "expenditure"], ["catastrophic"]],
  government_priorities: [["government", "priorities"], ["congruence", "existing"], ["congruence"]],
  equity: [["equity"]],
};

/* ================================================================== *
 * PART 1 — EVIDENCE SYNTHESIS  (the "data part")
 * ================================================================== */

export const SYNTHESIS_SECTIONS: ReportSection[] = [
  {
    id: "c1",
    title: "Criterion 1: Clinical Effectiveness",
    tables: [
      {
        rows: [
          { label: "Survival Rate (95% CI)", value: ci("clinical_effectiveness.survival_rate", "clinical_effectiveness.survival_rate_ci") },
          { label: "Hazard Ratio (95% CI)", value: ci("clinical_effectiveness.hazard_ratio", "clinical_effectiveness.hazard_ratio_ci") },
          { label: "Odds Ratio (95% CI)", value: ci("clinical_effectiveness.odds_ratio", "clinical_effectiveness.odds_ratio_ci") },
          { label: "Hospitalization Rate", value: f("clinical_effectiveness.hospitalization_rate") },
          { label: "Relative Risk (95% CI)", value: ci("clinical_effectiveness.relative_risk", "clinical_effectiveness.relative_risk_ci") },
          { label: "Heterogeneity", value: note(["clinical_effectiveness.heterogeneity", "clinical_effectiveness.heterogeneity_explanation"]) },
          { label: "Outcome", value: f("clinical_effectiveness.outcome") },
          { label: "Study Design", value: f("clinical_effectiveness.study_design") },
          { label: "Systematic Review Conducted", value: f("clinical_effectiveness.conducted_sr") },
          { label: "Search Date", value: f("clinical_effectiveness.search_date") },
          { label: "Databases Searched", value: f("clinical_effectiveness.databases") },
          { label: "Studies Identified", value: f("clinical_effectiveness.studies_identified") },
          { label: "Studies Retained in Systematic Review", value: f("clinical_effectiveness.studies_systematic") },
          { label: "Studies Included (Retained in Meta-Analysis)", value: computed("studiesMetaN") },
          { label: "Clinical Effectiveness Notes", value: f("clinical_effectiveness.notes_clinical_effect_est") },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Criterion 2: Safety",
    emptyText: "No Data",
    tables: [
      {
        gated: true,
        rows: [
          { label: "No. of Studies", value: f("safety.safety_num_studies") },
          { label: "Grade", value: f("safety.safety_grade") },
          { label: "Adverse Events", value: f("safety.safety_adverse_events") },
          { label: "Implemented Locally", value: f("safety.safety_implemented_locally") },
          { label: "Notes", value: f("safety.safety_notes") },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "Criterion 3: Quality (regulatory approval, manufacturing/clinical standards)",
    emptyText: "No Data",
    tables: [{ gated: true, rows: [{ label: "Quality", value: f("quality.notes") }] }],
  },
  {
    id: "c4",
    title: "Criterion 4: Burden of Disease",
    tables: [
      {
        caption: "GBD Estimate",
        rows: [
          { label: "ICD-11 Codes (Disease/Condition Name)", value: icd("burden_of_disease.icd11_codes", "burden_of_disease.disease_condition_name") },
          { label: "Morbidity (Observed cases)", value: f("burden_of_disease.observed_morbidity") },
          { label: "Mortality (Observed cases)", value: f("burden_of_disease.observed_mortality") },
          { label: "GBD Prevalence per 100,000", value: f("burden_of_disease.gbd_prevalence_per_100k") },
          { label: "GBD DALYs per 100,000", value: f("burden_of_disease.gbd_dalys_per_100k") },
          { label: "Morbidity Rank (KHIS Tracker)", value: f("burden_of_disease.morbidity_rank") },
          { label: "Mortality Rank (KHIS Tracker)", value: f("burden_of_disease.mortality_rank") },
          { label: "Regional Localization", value: f("burden_of_disease.disease_distribution") },
          { label: "Burden Notes", value: f("burden_of_disease.notes") },
        ],
      },
      {
        caption: "Bayesian Estimate, National, 95% Credible Interval",
        gated: true,
        rows: [
          { label: "Estimated Morbidity, cases (95% CrI)", value: f("burden_of_disease.morbidity_bayesian_estimates") },
          { label: "Estimated Mortality, deaths (95% CrI)", value: f("burden_of_disease.mortality_bayesian_estimates") },
          { label: "Estimated Prevalence per 100,000 (95% CrI)", value: f("burden_of_disease.prevalence_bayesian_per_100k") },
          { label: "DALYs per 100,000 (95% CrI)", value: f("burden_of_disease.dalys_per_100k") },
        ],
      },
    ],
  },
  {
    id: "c5",
    title: "Criterion 5: Incidence / Prevalence",
    tables: [
      {
        rows: [
          { label: "Estimated Target Population", value: f("burden_of_disease.estimated_target_population") },
          { label: "Regional Localization (Burden of Disease)", value: f("burden_of_disease.disease_distribution") },
          { label: "GBD Prevalence per 100,000", value: f("burden_of_disease.gbd_prevalence_per_100k") },
          { label: "Bayesian Estimated Prevalence per 100,000 (95% CrI)", value: f("burden_of_disease.prevalence_bayesian_per_100k") },
        ],
      },
    ],
  },
  {
    id: "c6",
    title: "Criterion 6: Population Impact",
    tables: [
      {
        rows: [
          { label: "Target Population", value: f("burden_of_disease.target_population") },
          { label: "Estimated Target Population", value: f("burden_of_disease.estimated_target_population") },
        ],
      },
    ],
    notes: [
      "No coverage/effectiveness formula (Coverage x RR x CFR) available to compute a modelled population-impact estimate.",
    ],
  },
  {
    id: "c7",
    title: "Criterion 7: Equity",
    tables: [
      {
        rows: [
          { label: "Socio-Economic Equity (E)", value: f("equity.equity_e") },
          { label: "Regional Localization (R)", value: f("equity.equity_r") },
          { label: "Number Of Patients (N)", value: f("equity.equity_n") },
          { label: "Equity Judgment", value: f("equity.equity_judgment") },
          { label: "Protects from Catastrophic Health Expenditure?", value: note(["equity.equity_che_impact", "equity.equity_che_impact_explain"]) },
          { label: "Equity Notes", value: f("equity.equity_notes") },
        ],
      },
    ],
  },
  {
    id: "c8",
    title: "Criterion 8: Cost-Effectiveness",
    emptyText: "No Data",
    tables: [
      {
        gated: true,
        rows: [
          { label: "Type of Economic Evaluation", value: f("cost_effectiveness.economic_evaluation_type") },
          { label: "Model Type", value: note(["cost_effectiveness.model_type", "cost_effectiveness.model_type_other"]) },
          { label: "Time Horizon", value: note(["cost_effectiveness.time_horizon", "cost_effectiveness.time_horizon_other"]) },
          { label: "Perspective", value: note(["cost_effectiveness.perspective", "cost_effectiveness.perspective_other"]) },
          { label: "Incremental Cost (KES)", value: f("cost_effectiveness.ce_incremental_cost") },
          { label: "Incremental Effect (DALYs/QALYs)", value: f("cost_effectiveness.ce_incremental_effect") },
          { label: "ICER (KES per DALY/QALY)", value: f("cost_effectiveness.ce_icer") },
          { label: "Cost-Effectiveness Threshold", value: f("cost_effectiveness.ce_threshold") },
          { label: "Notes", value: f("cost_effectiveness.ce_notes") },
        ],
      },
    ],
  },
  {
    id: "c9",
    title: "Criterion 9: Budgetary Impact",
    emptyText: "No Data",
    tables: [
      {
        gated: true,
        rows: [
          { label: "Eligible Population", value: f("budget_impact.bi_year1_eligible_population") },
          { label: "Target Coverage (%)", value: f("budget_impact.bi_year1_target_coverage_pct") },
          { label: "Number Treated", value: f("budget_impact.bi_year1_number_treated") },
          { label: "Total Cost (KES)", value: f("budget_impact.bi_year1_total_cost_kes") },
          { label: "Current Cost (KES)", value: f("budget_impact.bi_year1_current_cost_kes") },
          { label: "Incremental Budget (KES)", value: f("budget_impact.bi_year1_incremental_budget_kes") },
          { label: "Affordability Judgment", value: f("budget_impact.affordability_judgment") },
          { label: "Notes", value: f("budget_impact.bi_notes") },
        ],
      },
    ],
  },
  {
    id: "c10",
    title: "Criterion 10: Feasibility",
    tables: [
      {
        caption: "Access to Healthcare (Service Availability & Readiness)",
        rows: [
          { label: "Service Availability (%)", value: f("access_to_healthcare.service_availability_pct") },
          { label: "Geographic Accessibility < 120 Minutes (Availability)", value: f("access_to_healthcare.geo_accessibility_availability") },
          { label: "Readiness to Offer Service (%)", value: f("access_to_healthcare.readiness_pct") },
          { label: "Geographic Accessibility < 120 Minutes (Readiness)", value: f("access_to_healthcare.geo_accessibility_readiness") },
          { label: "Notes", value: f("access_to_healthcare.access_notes") },
        ],
      },
    ],
  },
  {
    id: "c11",
    title: "Criterion 11: Catastrophic Health Expenditure",
    emptyText: "No Data",
    tables: [
      {
        gated: true,
        rows: [
          { label: "Proposed Service", value: f("catastrophic_health_expenditure.che_proposed_service") },
          { label: "CHE %", value: f("catastrophic_health_expenditure.che_pct") },
          { label: "Rationale", value: f("catastrophic_health_expenditure.che_rationale") },
          { label: "Cost Components (where itemized)", value: f("catastrophic_health_expenditure.che_cost_components") },
        ],
      },
    ],
  },
  {
    id: "c12",
    title: "Criterion 12: Government Priorities",
    tables: [
      {
        rows: [
          { label: "Background", value: f("government_priorities.background") },
          { label: "Govt Policies, Laws & National Health Agenda", value: f("government_priorities.govt_policies") },
          { label: "Scoring Criteria", value: f("government_priorities.scoring_criteria") },
          { label: "Source Documents", value: f("government_priorities.source_documents") },
        ],
      },
    ],
  },
];

/* ================================================================== *
 * PART 2 — HTA SUBMISSION REPORT  (the "report part")
 * ================================================================== */

export type MatchSpec =
  | { kind: "affirmative"; path: string }
  | { kind: "equals"; path: string }
  | { kind: "databases"; path: string };

export const affirmative = (path: string): MatchSpec => ({ kind: "affirmative", path });
export const equals = (path: string): MatchSpec => ({ kind: "equals", path });
export const databases = (path: string): MatchSpec => ({ kind: "databases", path });

export interface FormText {
  kind: "text";
  label: string;
  value: ValueSpec;
}
export interface FormOptions {
  kind: "options";
  label: string;
  options: string[];
  match: MatchSpec;
  suffix?: string;
}
export type FormRow = FormText | FormOptions;

export interface FormBlock {
  id: string;
  title: string;
  intro?: string;
  rows: FormRow[];
}

export const SUBMISSION_BLOCKS: FormBlock[] = [
  {
    id: "a1",
    title: "A.1 Systematic Review or Literature Search",
    rows: [
      {
        kind: "options",
        label: "Did you conduct a systematic review?",
        options: ["Yes", "No"],
        match: affirmative("clinical_effectiveness.conducted_sr"),
        suffix: "(explain: _______)",
      },
      { kind: "text", label: "Search date(s)", value: f("clinical_effectiveness.search_date") },
      {
        kind: "options",
        label: "Databases searched (check all)",
        options: DATABASE_OPTIONS,
        match: databases("clinical_effectiveness.databases"),
        suffix: "Other: ______",
      },
      { kind: "text", label: "Number of studies identified", value: f("clinical_effectiveness.studies_identified") },
      { kind: "text", label: "Number of studies included", value: f("clinical_effectiveness.studies_included") },
    ],
  },
  {
    id: "b1",
    title: "B.1 / B.2 Economic Evaluation Setup",
    rows: [
      { kind: "text", label: "Type of economic evaluation", value: f("cost_effectiveness.economic_evaluation_type") },
      { kind: "text", label: "Model type", value: note(["cost_effectiveness.model_type", "cost_effectiveness.model_type_other"]) },
      { kind: "text", label: "Time horizon", value: note(["cost_effectiveness.time_horizon", "cost_effectiveness.time_horizon_other"]) },
      { kind: "text", label: "Currency", value: f("cost_effectiveness.currency") },
      { kind: "text", label: "Perspective", value: note(["cost_effectiveness.perspective", "cost_effectiveness.perspective_other"]) },
    ],
  },
  {
    id: "b5",
    title: "B.5 Cost-Effectiveness Results (Base case)",
    rows: [
      { kind: "text", label: "Incremental cost (KES)", value: f("cost_effectiveness.ce_incremental_cost") },
      { kind: "text", label: "Incremental effect (DALYs/QALYs)", value: f("cost_effectiveness.ce_incremental_effect") },
      { kind: "text", label: "ICER (KES per DALY/QALY)", value: f("cost_effectiveness.ce_icer") },
      { kind: "text", label: "Cost-effectiveness threshold", value: f("cost_effectiveness.ce_threshold") },
    ],
  },
  {
    id: "b6",
    title: "B.6 Budget Impact Analysis (Year 1)",
    rows: [
      { kind: "text", label: "Eligible population", value: f("budget_impact.bi_year1_eligible_population") },
      { kind: "text", label: "Target coverage (%)", value: f("budget_impact.bi_year1_target_coverage_pct") },
      { kind: "text", label: "Number treated", value: f("budget_impact.bi_year1_number_treated") },
      { kind: "text", label: "Total cost (KES)", value: f("budget_impact.bi_year1_total_cost_kes") },
      { kind: "text", label: "Current cost (KES)", value: f("budget_impact.bi_year1_current_cost_kes") },
      { kind: "text", label: "Incremental budget (KES)", value: f("budget_impact.bi_year1_incremental_budget_kes") },
    ],
  },
  {
    id: "c1eq",
    title: "C.1 Equity Impact Assessment",
    intro: "The Kenya HTA process explicitly recognizes equity as a priority-setting criterion.",
    rows: [
      { kind: "text", label: "Regional localization (R)", value: f("equity.equity_r") },
      { kind: "text", label: "Number of patients (N)", value: f("equity.equity_n") },
      { kind: "text", label: "Socio-economic equity (E)", value: f("equity.equity_e") },
      {
        kind: "options",
        label: "Protects from catastrophic health expenditure?",
        options: ["Yes", "No", "Uncertain"],
        match: equals("equity.equity_che_impact"),
        suffix: "(explain: _______)",
      },
      { kind: "text", label: "Equity judgment", value: f("equity.equity_judgment") },
      { kind: "text", label: "Notes", value: f("equity.equity_notes") },
    ],
  },
  {
    id: "c2feas",
    title: "C.2 Feasibility Assessment",
    rows: [
      { kind: "text", label: "Service availability (%)", value: f("access_to_healthcare.service_availability_pct") },
      { kind: "text", label: "Readiness to offer service (%)", value: f("access_to_healthcare.readiness_pct") },
      { kind: "text", label: "Geographic accessibility < 120 min (availability)", value: f("access_to_healthcare.geo_accessibility_availability") },
      { kind: "text", label: "Geographic accessibility < 120 min (readiness)", value: f("access_to_healthcare.geo_accessibility_readiness") },
      { kind: "text", label: "Comments", value: f("access_to_healthcare.access_notes") },
    ],
  },
];