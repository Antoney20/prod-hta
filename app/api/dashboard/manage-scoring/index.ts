
import api from '../../auth';
import {

  ScoringWindowFilters,
  ScoringWindowListResponse,
  ScoringWindowResponse,
  CreateScoringWindowData,
  UpdateScoringWindowData,
 ScoringWindow } from '@/types/new/manage-scoring';

const BASE = '/v1/scoring-windows/';


function unwrap<T>(res: { data: { success: boolean; message: string; data: T | null } }): T {
  const { success, message, data } = res.data;
  if (!success || data === null) {
    throw new Error(message || 'Request failed');
  }
  return data;
}


export const getScoringWindows = async (
  filters?: ScoringWindowFilters
): Promise<ScoringWindow[]> => {
  try {
    const res = await api.get<ScoringWindowListResponse>(BASE, { params: filters });
    return unwrap(res);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch scoring windows');
  }
};

/**
 * Fetch a single scoring window by id.
 */
export const getScoringWindow = async (id: string): Promise<ScoringWindow> => {
  try {
    const res = await api.get<ScoringWindowResponse>(`${BASE}${id}/`);
    return unwrap(res);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch scoring window');
  }
};

/**
 * Create a new scoring window. Admin only.
 */
export const createScoringWindow = async (
  payload: CreateScoringWindowData
): Promise<ScoringWindow> => {
  try {
    const res = await api.post<ScoringWindowResponse>(BASE, payload);
    return unwrap(res);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create scoring window');
  }
};

/**
 * Update an existing scoring window (PATCH). Admin only.
 */
export const updateScoringWindow = async (
  id: string,
  payload: UpdateScoringWindowData
): Promise<ScoringWindow> => {
  try {
    const res = await api.patch<ScoringWindowResponse>(`${BASE}${id}/`, payload);
    return unwrap(res);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update scoring window');
  }
};

/**
 * Delete a scoring window. Admin only.
 */
export const deleteScoringWindow = async (id: string): Promise<void> => {
  try {
    await api.delete(`${BASE}${id}/`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to delete scoring window');
  }
};

/**
 * Convenience: get the window for a specific intervention + level (or null if none).
 */
export const getWindowForIntervention = async (
  interventionId: string,
  level: 'panel' | 'appraisal'
): Promise<ScoringWindow | null> => {
  const windows = await getScoringWindows({ intervention: interventionId, level: level as any });
  return windows[0] ?? null;
};