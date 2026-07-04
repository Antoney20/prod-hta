import api from "../../auth";
import { DashboardResponse } from "@/types/dashboard/home";

/**
 * Fetch complete dashboard data
 * Returns aggregated stats for tasks, proposals, scoring, decisions, and system categories
 * Includes user statistics if the current user is admin
 */
export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response = await api.get('/v1/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

/**
 * Refresh dashboard data (for manual refresh button)
 */
export const refreshDashboard = async (): Promise<DashboardResponse> => {
  return getDashboardData();
};

