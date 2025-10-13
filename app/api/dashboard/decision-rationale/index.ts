import { 
  APIResponse, 
  DecisionRationale, 
  CreateDecisionRationaleData, 
  UpdateDecisionRationaleData,
  DecisionRationaleFilters,
  DecisionStatistics
} from "@/types/dashboard/decision";
import api from "../../auth";

/**
 * Get all decision rationales with optional filters
 */
export const getDecisionRationales = async (
  params?: DecisionRationaleFilters
): Promise<APIResponse<DecisionRationale>> => {
  try {
    const response = await api.get('/v2/proj/decision-rationales/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision rationales');
  }
};

/**
 * Get a single decision rationale by ID
 */
export const getDecisionRationale = async (
  id: number
): Promise<DecisionRationale> => {
  try {
    const response = await api.get(`/v2/proj/decision-rationales/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision rationale');
  }
};

/**
 * Create a new decision rationale
 */
export const createDecisionRationale = async (
  data: CreateDecisionRationaleData
): Promise<DecisionRationale> => {
  try {
    const response = await api.post('/v2/proj/decision-rationales/', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        'Failed to create decision rationale';
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing decision rationale
 */
export const updateDecisionRationale = async (
  id: number,
  data: UpdateDecisionRationaleData
): Promise<DecisionRationale> => {
  try {
    const response = await api.patch(`/v2/proj/decision-rationales/${id}/`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        'Failed to update decision rationale';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a decision rationale
 */
export const deleteDecisionRationale = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v2/proj/decision-rationales/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete decision rationale');
  }
};

/**
 * Get decision statistics
 */
export const getDecisionStatistics = async (): Promise<DecisionStatistics> => {
  try {
    const response = await api.get('/v2/proj/decision-rationales/statistics/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision statistics');
  }
};

/**
 * Add a comment to a decision
 */
export const addDecisionComment = async (
  id: number,
  content: string
): Promise<any> => {
  try {
    const response = await api.post(`/v2/proj/decision-rationales/${id}/add_comment/`, {
      content
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 
                        'Failed to add comment';
    throw new Error(errorMessage);
  }
};

/**
 * Get decision rationales by tracker ID
 */
export const getDecisionRationalesByTracker = async (
  trackerId: number
): Promise<APIResponse<DecisionRationale>> => {
  try {
    const response = await api.get('/v2/proj/decision-rationales/', {
      params: { tracker_id: trackerId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision rationales for tracker');
  }
};

/**
 * Get decision rationales by decision type
 */
export const getDecisionRationalesByType = async (
  decisionType: 'approved' | 'rejected' | 'not_sure'
): Promise<APIResponse<DecisionRationale>> => {
  try {
    const response = await api.get('/v2/proj/decision-rationales/', {
      params: { decision: decisionType }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision rationales by type');
  }
};

/**
 * Get decision rationales by user
 */
export const getDecisionRationalesByUser = async (
  userId: number
): Promise<APIResponse<DecisionRationale>> => {
  try {
    const response = await api.get('/v2/proj/decision-rationales/', {
      params: { decided_by: userId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch decision rationales by user');
  }
};