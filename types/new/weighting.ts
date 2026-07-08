export interface CriteriaAnchor {
  criteria_name: string;
  worst_value: number;
  best_value: number;
}

export interface NormalisedScore {
  criteria_name: string;
  normalised_value: number | null;
}

export interface InterventionNormalised {
  intervention_id: string;
  intervention_reference: string | null;
  intervention_name: string;
  normalised: NormalisedScore[];
}

export interface CriteriaStdDev {
  criteria_name: string;
  std_dev: number;
}

export interface PearsonCell {
  criteria_name: string;
  coefficient: number;
}

export interface PearsonRow {
  criteria_name: string;
  correlations: PearsonCell[];
}

export interface ConflictCell {
  criteria_name: string;
  conflict_value: number;
}

export interface ConflictRow {
  criteria_name: string;
  conflicts: ConflictCell[];
  sum_of_conflict: number;
}

export interface CriteriaWeighting {
  criteria_name: string;
  std_dev: number;
  sum_of_conflict: number;
  product: number;
  sum_of_products: number;
  weight: number;
  weight_percentage: number;
}

export interface ReviewerWeightingResult {
  reviewer_id: string;
  reviewer_email: string | null;
  reviewer_username: string | null;
  anchors: CriteriaAnchor[];
  normalisation_report: InterventionNormalised[];
  standard_deviations: CriteriaStdDev[];
  pearson_matrix: PearsonRow[];
  conflict_matrix: ConflictRow[];
  weightings: CriteriaWeighting[];
}

export interface ReviewerInterventionScore {
  reviewer_id: string;
  reviewer_email: string | null;
  reviewer_username: string | null;
  intervention_id: string;
  intervention_reference: string | null;
  intervention_name: string;
  weighted_criteria: Record<string, number>;
  total_score: number;
}

export interface ReviewerInterventionRank {
  rank: number;
  intervention_id: string;
  intervention_reference: string | null;
  intervention_name: string;
  total_score: number;
}

export interface ReviewerRanking {
  reviewer_id: string;
  reviewer_email: string | null;
  reviewer_username: string | null;
  ranked_interventions: ReviewerInterventionRank[];
}

export interface InterventionAggregateScore {
  intervention_id: string;
  intervention_reference: string | null;
  intervention_name: string;
  reviewer_count: number;
  package?: string | null;
  phase?: string | null;
  averaged_criteria: Record<string, number>;
  average_value_score: number;
  target_type: "intervention" | "national_proposal"
}

export interface AggregateRankingEntry {
  rank: number;
  intervention_id: string;
  intervention_reference: string | null;
  intervention_name: string;
  reviewer_count: number;
  value: number;
}

export interface WeightingReportSuccess {
  success: true;
  message: string;
  reviewer_results: ReviewerWeightingResult[];
  reviewer_scores: ReviewerInterventionScore[];
  reviewer_rankings: ReviewerRanking[];
  average_scores: InterventionAggregateScore[];
  average_ranking: AggregateRankingEntry[];
}

export interface WeightingReportFailure {
  success: false;
  message: string;
  error?: string;
}

export type WeightingReport = WeightingReportSuccess | WeightingReportFailure;