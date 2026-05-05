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

/**
 * Get only task statistics
 */
export const getTaskStats = async () => {
  const data = await getDashboardData();
  return data.tasks;
};

/**
 * Get only proposal statistics
 */
export const getProposalStats = async () => {
  const data = await getDashboardData();
  return data.proposals;
};

/**
 * Get only scoring statistics
 */
export const getScoringStats = async () => {
  const data = await getDashboardData();
  return data.scoring;
};

/**
 * Get decision/intervention status updates
 */
export const getDecisionStats = async () => {
  const data = await getDashboardData();
  return data.decisions;
};



/**
 * Get user statistics (admin only)
 */
export const getUserStats = async () => {
  const data = await getDashboardData();
  return data.users ?? null;
};