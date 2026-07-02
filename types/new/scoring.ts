
export interface CriteriaScore {
  criteria_name: string;
  score_value: number;        
  notes?: string | null;
}

export interface ReviewerStatus {
  user_id: number;
  full_name: string;
  email: string;
  scored: boolean;          
  score_count: number;         
  total_score: number;   
  criteria_scores: CriteriaScore[]; 
}

export interface InterventionReport {
  intervention_id: string;
  reference_number: string;
  intervention_name: string;
  intervention_type: string | null;
  scored_at: string | null;
  system_categories: string[];
  package: string | null;
  phase: string | null;
  total_score: number;        
  criteria_scored: number;      
  criteria_total: number;       
  reviewers: ReviewerStatus[];
  unscored_reviewers: ReviewerStatus[];  
}

export interface CategoryGroup {
  category: string;             // "Uncategorized" for interventions with no category
  interventions: InterventionReport[];
}

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