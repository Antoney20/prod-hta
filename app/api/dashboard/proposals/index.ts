
import { APIResponse, ProposalTracker, ThematicArea, UserType, ReviewerAssignment, AssignmentsAPIResponse } from "@/types/dashboard/intervention";
import api from "../../auth";

/**
 * Get all proposal trackers (no filtering - handle on client)
 */
export const getProposalTrackers = async (): Promise<APIResponse<ProposalTracker>> => {
  try {
    const response = await api.get('/v2/proj/proposal-trackers/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch proposal trackers');
  }
};

/**
 * Get all thematic areas
 */
export const getThematicAreas = async (): Promise<ThematicArea[]> => {
  try {
    const response = await api.get('/v2/proj/thematic-areas/');
    // Handle both paginated and non-paginated responses
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching thematic areas:', error);
    throw new Error('Failed to fetch thematic areas');
  }
};

/**
 * Get all users (for reviewer selection)
 */
export const getUsers = async (): Promise<APIResponse<UserType>> => {
  try {
    const response = await api.get('/v2/proj/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

/**
 * Create new thematic area
 */
export const createThematicArea = async (data: Omit<ThematicArea, 'id' | 'created_at'>): Promise<ThematicArea> => {
  try {
    const response = await api.post('/v2/proj/thematic-areas/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating thematic area:', error);
    throw new Error('Failed to create thematic area');
  }
};

/**
 * Assign thematic area to multiple trackers
 */
export const assignThematicArea = async (data: {
  tracker_ids: string[];
  thematic_area_id: number;
}): Promise<void> => {
  try {
    const response = await api.patch('/v2/proj/thematic-area/assign/', data);
    return response.data;
  } catch (error) {
    console.error('Error assigning thematic area:', error);
    throw new Error('Failed to assign thematic area');
  }
};

/**
 * Assign reviewers to a tracker
 */
export const assignReviewers = async (data: {
  tracker_id: string;
  reviewer_ids: number[];
  notes?: string;
}): Promise<void> => {
  try {
    const response = await api.post('/v2/proj/reviewer-assignments/bulk_assign/', data);
    return response.data;
  } catch (error) {
    console.error('Error assigning reviewers:', error);
    throw new Error('Failed to assign reviewers');
  }
};

/**
 * Update tracker review stage
 */
export const updateTrackerStage = async (id: string, review_stage: string): Promise<ProposalTracker> => {
  try {
    const response = await api.patch(`/v2/proj/proposal-trackers/${id}/update_stage/`, { review_stage });
    return response.data;
  } catch (error) {
    console.error('Error updating tracker stage:', error);
    throw new Error('Failed to update tracker stage');
  }
};

/**
 * Update tracker progress
 */
export const updateTrackerProgress = async (id: string, progress: number): Promise<ProposalTracker> => {
  try {
    const response = await api.patch(`/v2/proj/proposal-trackers/update_progress/`, { progress });
    return response.data;
  } catch (error) {
    console.error('Error updating tracker progress:', error);
    throw new Error('Failed to update tracker progress');
  }
};

// /**
//  * Get interventions assigned to the current user
//  * Uses auth token to automatically filter by logged-in user
//  */
// export const getMyAssignments = async (): Promise<AssignmentsAPIResponse> => {
//   try {
//     const response = await api.get('/v2/proj/proposal-trackers/my_assignments/');
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to fetch my assignments');
//   }
// };


/**
 * Get interventions assigned to the current user
 * Uses auth token to automatically filter by logged-in user
 * Returns full ProposalTracker objects, not ReviewerAssignment objects
 */
export const getMyAssignments = async (): Promise<APIResponse<ProposalTracker>> => {
  try {
    const response = await api.get('/v2/proj/proposal-trackers/my_assignments/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch my assignments');
  }
};

/**
 * Add a review comment
 */
export const addReviewComment = async (data: {
  tracker_id: string;
  content: string;
  comment_type: string;
  is_resolved?: boolean;
}): Promise<void> => {
  try {
    const response = await api.post('/v2/proj/review-comments/', {
      tracker_id: data.tracker_id,
      content: data.content,
      comment_type: data.comment_type,
      is_resolved: data.is_resolved || false
    });
    return response.data;
  } catch (error) {

    throw new Error('Failed to add review comment');
  }
};


/**
 * Update tracker progress - FIXED VERSION
 * This should update the tracker progress directly, not through reviewer assignment
 */
export const updateReviewerProgress = async (trackerId: string, progress: number): Promise<void> => {
  try {
    // Fix: Use the tracker ID directly with the correct endpoint
    const response = await api.patch(`/v2/proj/proposal-trackers/${trackerId}/update_progress/`, {
      progress
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update tracker progress');
  }
};

/**
 * Update single proposal tracker
 */
export const updateProposalTracker = async (
  id: string, 
  data: Partial<{
    thematic_area_id: number;
    priority_level: string;
    implementation_status: string;
    start_date: string;
    completion_date: string;
    progress: number;
    notes: string;
  }>
): Promise<ProposalTracker> => {
  try {
    const response = await api.patch(`/v2/proj/proposal-trackers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update proposal tracker');
  }
};


