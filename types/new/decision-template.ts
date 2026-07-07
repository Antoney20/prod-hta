export interface DecisionBand {
  field?: string;
  op?: string;
  value?: number | string | (number | string)[];
  combo?: string[];
  label?: string;
  score: number;
}

export interface DecisionCriterion {
  id: string;
  template: string;
  criterion: string;
  criterion_name: string;
  rule: string | null;
  kind: string;                       // descriptive | quantitative
  target_fields: string[];            // decision features
  selected_bands: DecisionBand[];     // may be multiple
  score: number | null;
  created_at: string;
}

export interface DecisionTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  kind: "intervention" | "national_proposal";
  target_id: string | null;
  reference_number: string | null;
  target_name: string | null;
  package_name: string | null;
  phase_name: string | null;
  generated_by: string | null;
  generated_by_name: string | null;
  active: boolean;
  criteria: DecisionCriterion[];
  created_at: string;
  updated_at: string;
}

/** Optional scope/overwrite for generation. */
export type GenerateInput = {
  interventions?: string[];
  national_proposals?: string[];
  overwrite?: boolean;
};

export type GenerateResult = { generated: number; skipped: number };

export type Write<T> = { ok: boolean; data?: T; error?: string };