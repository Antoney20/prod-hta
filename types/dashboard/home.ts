// ─────────────────────────────────────────────────────────────
// Task
// ─────────────────────────────────────────────────────────────
export interface TaskStats {
  total: number;
  completed: number;
  not_completed: number;
  overdue: number;
  upcoming_7d: number;
  by_status: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// Proposals / Interventions
// ─────────────────────────────────────────────────────────────
export interface DailyTrendPoint {
  date: string;   // ISO "YYYY-MM-DD"
  count: number;
}

export interface MonthlyTrendPoint {
  month: string;  // "Jan 2025"
  count: number;
}

export interface ProposalStats {
  total: number;
  daily_trend: DailyTrendPoint[];
  monthly_trend: MonthlyTrendPoint[];
}

// ─────────────────────────────────────────────────────────────
// Topic Prioritization
// ─────────────────────────────────────────────────────────────
export interface SystemCategoryStats {
  name: string;
  intervention_count: number;
}

export interface TopicPrioritizationStats {
  total_system_categories: number;
  by_system_category: SystemCategoryStats[];
  uncategorised_interventions: number;
}

// ─────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────
export interface ReviewerScore {
  reviewer_username: string;
  scored_count: number;
}

export interface ScoringStats {
  total_interventions: number;
  scored_interventions: number;
  unscored_interventions: number;
  progress_pct: number;
  by_reviewer: ReviewerScore[];
}

// ─────────────────────────────────────────────────────────────
// Decisions
// ─────────────────────────────────────────────────────────────
export interface DecisionBreakdown {
  decision_name: string;
  count: number;
}

export interface DecisionStats {
  total_status_updates: number;
  moved_to_panel: number;
  by_decision: DecisionBreakdown[];
}

// ─────────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────────
export interface PanelMember {
  username: string;
  email: string;
  avatar: string | null;
}

export interface PanelStats {
  total_scored_interventions: number;
  in_panel_count: number;
  panel_members: PanelMember[];
  note: string;
}

// ─────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────
export interface RoleCount {
  role: string;
  count: number;
}

export type UserStats =
  | { scope: 'all'; total_active: number; by_role: RoleCount[] }
  | { scope: 'self'; username: string; email: string; role: string | null; is_active: boolean; avatar: string | null };

// ─────────────────────────────────────────────────────────────
// Feedback (admin only)
// ─────────────────────────────────────────────────────────────
export interface FeedbackCategoryBreakdown {
  category_name: string;
  total: number;
  sent_count: number;
  failed_count: number;
}

export interface FailedEmail {
  id: string;
  recipient: string;
  error_message: string | null;
  retry_count: number;
  last_attempt: string | null;
  category_name: string;
}

export interface FeedbackStats {
  total_sent: number;
  total_failed: number;
  by_category: FeedbackCategoryBreakdown[];
  recent_failed: FailedEmail[];
}

// ─────────────────────────────────────────────────────────────
// Full API response
// ─────────────────────────────────────────────────────────────
export interface DashboardResponse {
  users: UserStats;
  tasks: TaskStats;
  proposals: ProposalStats;
  topic_prioritization: TopicPrioritizationStats;
  scoring?: ScoringStats;
  decisions?: DecisionStats;
  panel?: PanelStats;
  feedback?: FeedbackStats;
}

// ─────────────────────────────────────────────────────────────
// UI-ready data (post transform)
// ─────────────────────────────────────────────────────────────
export interface DashboardUIData extends DashboardResponse {
  taskCompletionRate: number;
  proposalScoringRate: number;
  topCategory: SystemCategoryStats | null;
}


export type TrendRange = '7d' | '30d' | '90d' | 'all';