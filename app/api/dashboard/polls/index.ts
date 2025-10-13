import { APIResponse, CommentData, CreatePollData, Poll, PollComment, PollResults, VoteAnalytics, VoteData } from "@/types/dashboard/polls";
import api from "../../auth";

/**
 * Get all polls user has access to
 */
export const getPolls = async (params?: {
  channel?: string;
  is_active?: boolean;
}): Promise<APIResponse<Poll>> => {
  try {
    const response = await api.get('/v2/proj/polls/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch polls');
  }
};

/**
 * Get a specific poll by ID
 */
export const getPoll = async (id: string): Promise<Poll> => {
  try {
    const response = await api.get(`/v2/proj/polls/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch poll');
  }
};

/**
 * Create a new poll
 */
export const createPoll = async (data: CreatePollData): Promise<Poll> => {
  try {
    const response = await api.post('/v2/proj/polls/', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create poll');
  }
};

/**
 * Update an existing poll
 */
export const updatePoll = async (
  id: string,
  data: Partial<CreatePollData>
): Promise<Poll> => {
  try {
    const response = await api.patch(`/v2/proj/polls/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update poll');
  }
};

/**
 * Delete a poll
 */
export const deletePoll = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/polls/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete poll');
  }
};

/**
 * Vote on a poll option
 */
export const votePoll = async (
  id: string,
  data: VoteData
): Promise<{ detail: string }> => {
  try {
    const response = await api.post(`/v2/proj/polls/${id}/vote/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to vote on poll');
  }
};

/**
 * Get poll results
 */
export const getPollResults = async (id: string): Promise<PollResults> => {
  try {
    const response = await api.get(`/v2/proj/polls/${id}/results/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch poll results');
  }
};

/**
 * Get poll analytics (owner only)
 */
export const getPollAnalytics = async (id: string): Promise<VoteAnalytics> => {
  try {
    const response = await api.get(`/v2/proj/polls/${id}/analytics/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch poll analytics');
  }
};

/**
 * Get poll comments
 */
export const getPollComments = async (id: string): Promise<PollComment[]> => {
  try {
    const response = await api.get(`/v2/proj/polls/${id}/comments/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch poll comments');
  }
};

/**
 * Add a comment to a poll
 */
export const addPollComment = async (
  id: string,
  data: CommentData
): Promise<PollComment> => {
  try {
    const response = await api.post(`/v2/proj/polls/${id}/comments/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add comment');
  }
};

/**
 * Toggle comments on/off (owner only)
 */
export const togglePollComments = async (
  id: string
): Promise<{ detail: string; allow_comments: boolean }> => {
  try {
    const response = await api.patch(`/v2/proj/polls/${id}/toggle-comments/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to toggle comments');
  }
};