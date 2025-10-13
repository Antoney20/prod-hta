
import type {
  ImplementationTracking,
  CreateImplementationData,
  UpdateImplementationData,
  ImplementationFilters,
  ImplementationStatistics,
  APIResponse
} from '@/types/dashboard/implementation';
import api from '../../auth';

const BASE_URL = '/v2/proj/implementations';

/**
 * Get all implementations with optional filters
 */
export const getImplementations = async (
  params?: ImplementationFilters
): Promise<APIResponse<ImplementationTracking>> => {
  try {
    const response = await api.get(`${BASE_URL}/`, { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch implementations');
  }
};

/**
 * Get a single implementation by ID
 */
export const getImplementation = async (
  id: string
): Promise<ImplementationTracking> => {
  try {
    const response = await api.get(`${BASE_URL}/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch implementation');
  }
};

/**
 * Create a new implementation
 */
export const createImplementation = async (
  data: CreateImplementationData
): Promise<ImplementationTracking> => {
  try {
    const response = await api.post(`${BASE_URL}/`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        'Failed to create implementation';
    throw new Error(errorMessage);
  }
};

/**
 * Update an implementation
 */
export const updateImplementation = async (
  id: string,
  data: UpdateImplementationData
): Promise<ImplementationTracking> => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        'Failed to update implementation';
    throw new Error(errorMessage);
  }
};

/**
 * Delete an implementation
 */
export const deleteImplementation = async (id: string): Promise<void> => {
  try {
    await api.delete(`${BASE_URL}/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete implementation');
  }
};

/**
 * Get implementation statistics
 */
export const getImplementationStatistics = async (): Promise<ImplementationStatistics> => {
  try {
    const response = await api.get(`${BASE_URL}/statistics/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch statistics');
  }
};

/**
 * Mark implementation as complete
 */
export const markImplementationComplete = async (
  id: string,
  data: { completion_remarks: string; actual_completion_date?: string }
): Promise<ImplementationTracking> => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/mark_complete/`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        'Failed to mark as complete';
    throw new Error(errorMessage);
  }
};