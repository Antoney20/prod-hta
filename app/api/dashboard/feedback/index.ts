
import { Feedback, FeedbackResponse, FeedbackSubmission } from "@/types/dashboard/feedback";
import api from "../../auth";

export const submitFeedback = async (data: FeedbackSubmission): Promise<FeedbackResponse> => {
  try {
    const response = await api.post('/v2/proj/feedback/', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to submit feedback');
  }
};

/**
 * Get all feedback (admin only)
 */
export const getAllFeedback = async (params?: { 
  status?: string; 
  search?: string;
}): Promise<Feedback[]> => {
  try {
    const response = await api.get('/v2/proj/feedback/', { params });
    return response.data.results || response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch feedback');
  }
};

/**
 * Get specific feedback by ID (admin only)
 */
export const getFeedback = async (id: string): Promise<Feedback> => {
  try {
    const response = await api.get(`/v2/proj/feedback/${id}/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch feedback');
  }
};

/**
 * Admin: Respond to feedback
 */
export const respondToFeedback = async (
  id: string, 
  adminResponse: string
): Promise<FeedbackResponse> => {
  try {
    const response = await api.post(`/v2/proj/feedback/${id}/respond/`, {
      admin_response: adminResponse
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to respond to feedback');
  }
};

/**
 * Admin: Update feedback status
 */
export const updateFeedbackStatus = async (
  id: string, 
  status: 'new' | 'reviewing' | 'resolved' | 'closed'
): Promise<FeedbackResponse> => {
  try {
    const response = await api.patch(`/v2/proj/feedback/${id}/update_status/`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update status');
  }
};