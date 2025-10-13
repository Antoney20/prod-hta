export interface DecisionRationale {
  id: number;
  tracker: number;
  decision: 'approved' | 'rejected' | 'not_sure';
  detailed_rationale: string;
  decided_by: number;
  decided_by_username?: string;
  approval_conditions: string | null;
  decided_at: string;
  proposal_reference?: string;
  intervention_name?: string;
}

export interface CreateDecisionRationaleData {
  tracker_id: string;
  decision: 'approved' | 'rejected' | 'not_sure';
  detailed_rationale: string;
  approval_conditions?: string | null;
  comment_content?: string | null;
}

export interface UpdateDecisionRationaleData {
  decision?: 'approved' | 'rejected' | 'not_sure';
  detailed_rationale?: string;
  approval_conditions?: string | null;
}

export interface DecisionRationaleFilters {
  tracker_id?: number;
  decision?: 'approved' | 'rejected' | 'not_sure';
  decided_by?: number;
}

export interface DecisionStatistics {
  total: number;
  approved: number;
  rejected: number;
  not_sure: number;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SingleAPIResponse<T> {
  data: T;
  message?: string;
}