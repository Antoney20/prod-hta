import api from "../auth";
import type {
  FeedbackCategory,
  FeedbackCategoryUpdatePayload,
  FeedbackCategoryListResponse,
  FeedbackCategoryResponse,
  FeedbackEmailLog,
  FeedbackEmailLogListResponse,
  FeedbackEmailLogResponse,
  SendFeedbackEmailPayload,
  SendFeedbackEmailResponse,
  BulkSendPayload,
  BulkSendResponse,
  InterventionFeedbackStatus,
  InterventionFeedbackStatusListResponse,
  FeedbackCategoryCreatePayload,
} from "@/types/new/feedback";

const CATEGORIES = "/v3/feedback-categories";
const LOGS       = "/v3/feedback-email-logs";



export const getAllFeedbackCategories = async (): Promise<FeedbackCategoryListResponse> => {
  const res = await api.get(`${CATEGORIES}/`);
  return res.data;
};

export const getFeedbackCategory = async (id: string): Promise<FeedbackCategoryResponse> => {
  const res = await api.get(`${CATEGORIES}/${id}/`);
  return res.data;
};

export const createFeedbackCategory = async (
  payload: FeedbackCategoryCreatePayload
): Promise<FeedbackCategoryResponse> => {
  const res = await api.post(`${CATEGORIES}/create/`, payload);
  return res.data;
};

export const updateFeedbackCategory = async (
  id: string,
  payload: FeedbackCategoryUpdatePayload
): Promise<FeedbackCategoryResponse> => {
  const res = await api.patch(`${CATEGORIES}/${id}/update/`, payload);
  return res.data;
};

export const deleteFeedbackCategory = async (
  id: string
): Promise<{ success: boolean; message: string; data: null }> => {
  const res = await api.delete(`${CATEGORIES}/${id}/delete/`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
//  FeedbackEmailLog
// ─────────────────────────────────────────────────────────────

export const getAllFeedbackEmailLogs = async (): Promise<FeedbackEmailLogListResponse> => {
  const res = await api.get(`${LOGS}/`);
  return res.data;
};

export const getFeedbackEmailLog = async (id: string): Promise<FeedbackEmailLogResponse> => {
  const res = await api.get(`${LOGS}/${id}/`);
  return res.data;
};

export const getFeedbackLogsByIntervention = async (
  interventionId: string
): Promise<FeedbackEmailLogListResponse> => {
  const res = await api.get(`${LOGS}/by-intervention/`, {
    params: { intervention: interventionId },
  });
  return res.data;
};

export const getFeedbackLogsByCategory = async (
  categoryId: string
): Promise<FeedbackEmailLogListResponse> => {
  const res = await api.get(`${LOGS}/by-category/`, {
    params: { category: categoryId },
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
//  Send
// ─────────────────────────────────────────────────────────────

export const sendFeedbackEmail = async (
  payload: SendFeedbackEmailPayload
): Promise<SendFeedbackEmailResponse> => {
  const res = await api.post(`${LOGS}/send/`, payload);
  return res.data;
};

export const bulkSendFeedbackEmail = async (
  payload: BulkSendPayload
): Promise<BulkSendResponse> => {
  const res = await api.post(`${LOGS}/bulk-send/`, payload);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
//  Intervention statuses (cached 30 min server-side)
// ─────────────────────────────────────────────────────────────

export const getInterventionFeedbackStatuses =
  async (): Promise<InterventionFeedbackStatusListResponse> => {
    const res = await api.get(`${LOGS}/intervention-statuses/`);
    return res.data;
  };