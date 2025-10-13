import { 
  DashboardData, 
  DashboardStats,
  ProposalStatusCount,
  RecentActivity,
  ThematicAreaStats,
  PriorityDistribution,
  ReviewerWorkload,
  ImplementationProgress,
  MonthlyTrend
} from "@/types/dashboard/home";
import api from "../../auth";

/**
 * Get complete dashboard data with all stats and reports
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get('/v1/dashboard/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

/**
 * Get dashboard statistics only
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/v1/dashboard/stats/');
    return response.data;
  } catch (error: any) {

    throw new Error(error?.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

/**
 * Get proposal status distribution
 */
export const getProposalStatusDistribution = async (): Promise<ProposalStatusCount[]> => {
  try {
    const response = await api.get('/v1/dashboard/proposal-status/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch proposal status distribution');
  }
};

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const response = await api.get('/v1/dashboard/activities/', {
      params: { limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch recent activities');
  }
};

/**
 * Get thematic area statistics
 */
export const getThematicAreaStats = async (): Promise<ThematicAreaStats[]> => {
  try {
    const response = await api.get('/v1/dashboard/thematic-areas/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch thematic area stats');
  }
};

/**
 * Get priority distribution
 */
export const getPriorityDistribution = async (): Promise<PriorityDistribution[]> => {
  try {
    const response = await api.get('/v1/dashboard/priority-distribution/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch priority distribution');
  }
};

/**
 * Get reviewer workload
 */
export const getReviewerWorkload = async (): Promise<ReviewerWorkload[]> => {
  try {
    const response = await api.get('/v1/dashboard/reviewer-workload/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch reviewer workload');
  }
};

/**
 * Get implementation progress
 */
export const getImplementationProgress = async (): Promise<ImplementationProgress[]> => {
  try {
    const response = await api.get('/v1/dashboard/implementation-progress/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch implementation progress');
  }
};

/**
 * Get monthly trends
 */
export const getMonthlyTrends = async (months: number = 6): Promise<MonthlyTrend[]> => {
  try {
    const response = await api.get('/v1/dashboard/trends/', {
      params: { months }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch monthly trends');
  }
};

/**
 * Refresh dashboard data - forces a fresh fetch
 */
export const refreshDashboard = async (): Promise<DashboardData> => {
  try {
    const response = await api.get('/v1/dashboard/', {
      params: { refresh: true, timestamp: Date.now() }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to refresh dashboard');
  }
};