
export interface CriteriaScore {
  criteria_name: string;
  score_value: number;          // 0 if this reviewer hasn't scored this criteria yet
}

// ── Per-reviewer status within an intervention ────────────────────────────────

export interface ReviewerStatus {
  user_id: number;
  full_name: string;
  email: string;
  scored: boolean;              // true if they've scored at least one criteria
  score_count: number;          // number of criteria scored
  total_score: number;          // sum of their score_values for this intervention
  criteria_scores: CriteriaScore[];  // one entry per unique criteria (0 if unscored)
}

// ── Per-intervention report ───────────────────────────────────────────────────

export interface InterventionReport {
  intervention_id: string;
  reference_number: string;
  intervention_name: string;
  intervention_type: string | null;
  system_categories: string[];
  total_score: number;          // sum of ALL score_values from ALL reviewers
  criteria_scored: number;      // unique criteria scored by any reviewer
  criteria_total: number;       // total unique criteria available (from SelectionTool)
  reviewers: ReviewerStatus[];
  unscored_reviewers: ReviewerStatus[];  // reviewers who haven't scored this intervention
}

// ── Category grouping ─────────────────────────────────────────────────────────

export interface CategoryGroup {
  category: string;             // "Uncategorized" for interventions with no category
  interventions: InterventionReport[];
}

// ── Top-level report ──────────────────────────────────────────────────────────

export interface ScoringReport {
  success: boolean;
  message: string;
  total_interventions: number;
  not_scored: number;           // interventions with zero scores from any reviewer
  total_reviewers: number;
  by_category: CategoryGroup[];
  error?: string | null;
}

export interface ScoringReportResult {
  success: boolean;
  message: string;
  total_interventions: number;
  not_scored: number;           // interventions with zero scores from any reviewer
  total_reviewers: number;
  by_category: CategoryGroup[];
  error?: string | null;
}