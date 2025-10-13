import { APIResponse, CustomUser, InterventionProposal, ProposalTracker, ReviewComment, ReviewerAssignment, ThematicArea } from "@/types/interventions";
import api from "../auth";


/**
 * Get all intervention proposals (no filtering - handle on client)
 */
// export const getInterventions = async (): Promise<APIResponse<InterventionProposal>> => {
//   try {
//     const response = await api.get('/v1/proposals/');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching interventions:', error);
//     throw new Error('Failed to fetch interventions');
//   }
// };

/**
 * Get single intervention proposal
 */
export const getIntervention = async (id: number): Promise<InterventionProposal> => {
  try {
    const response = await api.get(`/v2/proj/interventions/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching intervention ${id}:`, error);
    throw new Error(`Failed to fetch intervention ${id}`);
  }
};

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
 * Get single proposal tracker
 */
export const getProposalTracker = async (id: string): Promise<ProposalTracker> => {
  try {
    const response = await api.get(`/v2/proj/proposal-trackers/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposal tracker ${id}:`, error);
    throw new Error(`Failed to fetch proposal tracker ${id}`);
  }
};

/**
 * Create new proposal tracker
 */
export const createProposalTracker = async (data: Partial<ProposalTracker>): Promise<ProposalTracker> => {
  try {
    const response = await api.post('/v2/proj/proposal-trackers/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating proposal tracker:', error);
    throw new Error('Failed to create proposal tracker');
  }
};




/**
 * Update proposal tracker(s)
 * Single: {"id": "uuid", "thematic_area_id": 5}
 * Multiple: {"ids": ["uuid1", "uuid2"], "thematic_area_id": 5}
 */
export const updateProposalTrackers = async (
  data: { id: string; thematic_area_id: number } | 
        { ids: string[]; thematic_area_id: number }
): Promise<ProposalTracker | ProposalTracker[]> => {
  try {
    const response = await api.patch('/v2/proj/proposal-trackers/', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to update proposal tracker(s)';
    console.error('Error updating proposal tracker(s):', error);
    throw new Error(message);
  }
};


/**
 * Get comments for a specific tracker
 */
export const getTrackerComments = async (trackerId: string): Promise<ReviewComment[]> => {
  try {
    const response = await api.get(`/v2/proj/proposal-trackers/${trackerId}/comments/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for tracker ${trackerId}:`, error);
    throw new Error(`Failed to fetch comments for tracker ${trackerId}`);
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
 * Get all reviewer assignments
 */
export const getReviewerAssignments = async (): Promise<APIResponse<ReviewerAssignment>> => {
  try {
    const response = await api.get('/v2/proj/reviewer-assignments/');
    return response.data;
  } catch (error) {
    console.error('Error fetching reviewer assignments:', error);
    throw new Error('Failed to fetch reviewer assignments');
  }
};

/**
 * Create new reviewer assignment
 */
export const createReviewerAssignment = async (data: {
  tracker_id: string;
  reviewer_id: number;
  notes?: string;
}): Promise<ReviewerAssignment> => {
  try {
    const response = await api.post('/v2/proj/reviewer-assignments/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating reviewer assignment:', error);
    throw new Error('Failed to create reviewer assignment');
  }
};

/**
 * Create new review comment
 */
export const createReviewComment = async (data: {
  tracker_id: string;
  comment_type: ReviewComment['comment_type'];
  content: string;
}): Promise<ReviewComment> => {
  try {
    const response = await api.post('/v2/proj/review-comments/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating review comment:', error);
    throw new Error('Failed to create review comment');
  }
};

/**
 * Update review comment (e.g., mark as resolved)
 */
export const updateReviewComment = async (id: string, data: { is_resolved?: boolean }): Promise<ReviewComment> => {
  try {
    const response = await api.patch(`/v2/proj/review-comments/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating review comment ${id}:`, error);
    throw new Error(`Failed to update review comment ${id}`);
  }
};

/**
 * Get all users (for reviewer assignments)
 */
export const getUsers = async (): Promise<CustomUser[]> => {
  try {
    const response = await api.get('/v2/proj/users/');
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

// Utility functions
export const getStatusBadgeVariant = (status: string) => {
  const variants = {
    initial: 'secondary',
    under_review: 'default',
    needs_revision: 'destructive',
    approved: 'success',
    rejected: 'destructive',
    withdrawn: 'outline',
    not_started: 'secondary',
    planning: 'default',
    in_progress: 'default',
    on_hold: 'destructive',
    completed: 'success',
    cancelled: 'destructive',
    low: 'outline',
    medium: 'default',
    high: 'destructive',
    urgent: 'destructive',
  };
  return variants[status as keyof typeof variants] || 'default';
};

