export interface DashboardStats {
  total_proposals: number;
  total_users: number;
  total_announcements: number;
  total_tasks: number;
  total_events: number;
  total_channels: number;
  active_reviewers: number;
  pending_reviews: number;
}

export interface ProposalStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'proposal' | 'task' | 'announcement' | 'event' | 'comment';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: string;
}

export interface ThematicAreaStats {
  id: string;
  name: string;
  proposal_count: number;
  color_code: string;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface ReviewerWorkload {
  id: string;
  reviewer_name: string;
  assigned_proposals: number;
  completed_reviews: number;
  pending_reviews: number;
  average_progress: number;
}

export interface ImplementationProgress {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  proposals_submitted: number;
  proposals_approved: number;
  proposals_rejected: number;
}

export interface DashboardData {
  stats: DashboardStats;
  proposal_status_distribution: ProposalStatusCount[];
  recent_activities: RecentActivity[];
  thematic_areas: ThematicAreaStats[];
  priority_distribution: PriorityDistribution[];
  reviewer_workload: ReviewerWorkload[];
  implementation_progress: ImplementationProgress[];
  monthly_trends: MonthlyTrend[];
}

export interface APIResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface DashboardError {
  error: string;
  message?: string;
}