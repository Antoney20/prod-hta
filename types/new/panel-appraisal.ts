import { SystemCategory } from "./client";

export interface PanelIntervention {
  id: string | null;
  intervention_id: string;
  intervention_name: string;
  reference_number?: string;
  intervention_description: string | null;
  is_scored: boolean;
  move_to_panel: boolean;
  system_categories: string[];
  decision: {
    id: string;
    name: string;
    description?: string;
  } | null;
  decision_date: string | null;
  feedback: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PanelInterventionResponse {
  status: string;
  count: number;
  generated_at: string;
  results: PanelIntervention[];
}


export interface EnrichedPanelIntervention {
  panelRecord: PanelIntervention;
  scoredCriteriaIds: Set<string>;
  scoredCount: number;
  totalCriteria: number;
}

export interface PanelCategoryGroup {
  category: SystemCategory;
  interventions: EnrichedPanelIntervention[];
}

export interface CriteriaAppraisalTool {
  id: string;
  criteria: string;
  description: string;
  scoring_approach: string;
  score: number | null;
}

export interface CriteriaAppraisalScore {
  id: string;
  reviewer: string;
  reviewer_name: string;
  reviewer_email: string;
  intervention: string;
  intervention_name: string;
  criteria: string;
  criteria_name: string;
  score: Record<string, unknown>;
  comment: string;
  is_rescored: boolean;
  rescored_by: string | null;
  created_at: string;
  updated_at: string;
}


export interface ScorePayload {
  criteria_id: string;
  score: Record<string, unknown>;
  comment?: string;
}

export interface BulkScorePayload {
  intervention_id: string;
  scores: ScorePayload[];
}

export interface RescorePayload {
  score_id: string;
  score: Record<string, unknown>;
  comment?: string;
}

export interface BulkRescorePayload {
  items: RescorePayload[];
}

export interface PanelStats {
  totalInterventions: number;
  totalAtPanel: number;
  totalScoredByMe: number;
  totalFullyScoredByMe: number;
}