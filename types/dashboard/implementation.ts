export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface ImplementationTracking {
  id: string; // UUID
  decision_rationale: number;
  
  // Timeline
  implementation_start_date: string | null;
  expected_completion_date: string | null;
  actual_completion_date: string | null;
  
  // Progress
  progress_percentage: number;
  current_status: string;
  key_activities_completed: string;
  implementation_notes: string;
  
  // Completion
  is_completed: boolean;
  completion_remarks: string;
  
  // Tracking
  created_at: string;
  updated_at: string;
  created_by: number;
  last_updated_by: number | null;
  created_by_details: User;
  last_updated_by_details: User | null;
  
  // Related data
  proposal_reference: string;
  intervention_name: string | null;
  county: string;
  
  // Computed
  is_overdue: boolean;
  days_remaining: number | null;
}

export interface CreateImplementationData {
  decision_rationale_id: number;
  implementation_start_date?: string | null;
  expected_completion_date?: string | null;
  progress_percentage?: number;
  current_status?: string;
  key_activities_completed?: string;
  implementation_notes?: string;
}

export interface UpdateImplementationData {
  implementation_start_date?: string | null;
  expected_completion_date?: string | null;
  actual_completion_date?: string | null;
  progress_percentage?: number;
  current_status?: string;
  key_activities_completed?: string;
  implementation_notes?: string;
  is_completed?: boolean;
  completion_remarks?: string;
}

export interface ImplementationFilters {
  decision_rationale_id?: number;
  is_completed?: boolean;
  county?: string;
  min_progress?: number;
  max_progress?: number;
  overdue?: boolean;
}

export interface ImplementationStatistics {
  total: number;
  completed: number;
  in_progress: number;
  overdue: number;
  average_progress: number;
  completion_rate: number;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

