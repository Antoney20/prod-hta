export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  upcoming: number;
  by_status: Record<string, number>;
}


export interface ProposalStats {
  total: number;
  monthly_trend: Array<{
    month: string;
    count: number;
  }>;
  by_system_category: Array<{
    name: string;
    count: number;
  }>;
}

/**
 * Scoring statistics (role-aware)
 */
export interface ScoringStats {
  total_scored_interventions: number;
  by_reviewer: Array<{
    reviewer_username: string;
    count: number;
  }>;
}

/**
 * Decision/intervention status updates
 */
export interface DecisionStats {
  total_updates: number;
  by_decision: Array<{
    decision_name: string;
    count: number;
  }>;
}

/**
 * System category with intervention count
 */
export interface SystemCategoryStats {
  name: string;
  intervention_count: number;
}

/**
 * User breakdown (admin only)
 */
export interface UserStats {
  total_active: number;
  by_role: Array<{
    role: string;
    count: number;
  }>;
}

/**
 * Complete dashboard response from backend
 */
export interface DashboardResponse {
  tasks: TaskStats;
  proposals: ProposalStats;
  scoring: ScoringStats;
  decisions: DecisionStats;
  system_categories: SystemCategoryStats[];
  users?: UserStats; // Only present for admin users
}

/**
 * Transformed dashboard data for UI rendering
 */
export interface DashboardUIData {
  tasks: TaskStats;
  proposals: ProposalStats;
  scoring: ScoringStats;
  decisions: DecisionStats;
  systemCategories: SystemCategoryStats[];
  users?: UserStats;
  
  // Computed values for display
  proposalCompletionRate: number;
  taskCompletionRate: number;
  topCategory: SystemCategoryStats | null;
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'task' | 'proposal' | 'decision' | 'score';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: string;
}

/**
 * Error response
 */
export interface DashboardError {
  error: string;
  message?: string;
  status?: number;
}