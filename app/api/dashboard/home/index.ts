import { DashboardError, DashboardResponse } from "@/types/dashboard/home"


const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

/**
 * Fetch complete dashboard data
 * Returns aggregated stats for tasks, proposals, scoring, decisions, and system categories
 * Includes user statistics if the current user is admin
 */
export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/dashboard/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData: DashboardError = await response.json()
      throw new Error(
        errorData.message || `Dashboard API error: ${response.statusText}`
      )
    }

    const data: DashboardResponse = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    throw error
  }
}

/**
 * Refresh dashboard data (for manual refresh button)
 * Returns updated statistics
 */
export const refreshDashboard = async (): Promise<DashboardResponse> => {
  return getDashboardData()
}

/**
 * Get only task statistics
 * Used for task-specific views
 */
export const getTaskStats = async () => {
  try {
    const data = await getDashboardData()
    return data.tasks
  } catch (error) {
    console.error('Failed to fetch task stats:', error)
    throw error
  }
}

/**
 * Get only proposal statistics
 * Includes monthly trends and system category breakdown
 */
export const getProposalStats = async () => {
  try {
    const data = await getDashboardData()
    return data.proposals
  } catch (error) {
    console.error('Failed to fetch proposal stats:', error)
    throw error
  }
}

/**
 * Get only scoring statistics
 * Role-aware: returns different data based on user role
 */
export const getScoringStats = async () => {
  try {
    const data = await getDashboardData()
    return data.scoring
  } catch (error) {
    console.error('Failed to fetch scoring stats:', error)
    throw error
  }
}

/**
 * Get decision/intervention status updates
 */
export const getDecisionStats = async () => {
  try {
    const data = await getDashboardData()
    return data.decisions
  } catch (error) {
    console.error('Failed to fetch decision stats:', error)
    throw error
  }
}

/**
 * Get system category statistics
 */
export const getSystemCategoryStats = async () => {
  try {
    const data = await getDashboardData()
    return data.system_categories
  } catch (error) {
    console.error('Failed to fetch system category stats:', error)
    throw error
  }
}

/**
 * Get user statistics (admin only)
 * Returns null for non-admin users
 */
export const getUserStats = async () => {
  try {
    const data = await getDashboardData()
    return data.users || null
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    throw error
  }
}