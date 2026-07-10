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
  InterventionStatusFilters,
  FeedbackLogFilters,
} from "@/types/new/feedback";

const CAT = "/v3/feedback-categories";
const LOGS       = "/v3/feedback-email-logs";



 
export const getAllFeedbackCategories =
  async (): Promise<FeedbackCategoryListResponse> =>
    (await api.get(`${CAT}/`)).data;
 
export const getFeedbackCategory =
  async (id: string): Promise<FeedbackCategoryResponse> =>
    (await api.get(`${CAT}/${id}/`)).data;
 
export const createFeedbackCategory =
  async (payload: FeedbackCategoryCreatePayload): Promise<FeedbackCategoryResponse> =>
    (await api.post(`${CAT}/create/`, payload)).data;
 
export const updateFeedbackCategory =
  async (id: string, payload: FeedbackCategoryUpdatePayload): Promise<FeedbackCategoryResponse> =>
    (await api.patch(`${CAT}/${id}/update/`, payload)).data;
 
export const deleteFeedbackCategory =
  async (id: string): Promise<{ success: boolean; message: string; data: null }> =>
    (await api.delete(`${CAT}/${id}/delete/`)).data;
 

export const getAllFeedbackEmailLogs =
  async (filters?: FeedbackLogFilters): Promise<FeedbackEmailLogListResponse> =>
    (await api.get(`${LOGS}/`, { params: filters })).data;
 
export const getFeedbackEmailLog =
  async (id: string): Promise<FeedbackEmailLogResponse> =>
    (await api.get(`${LOGS}/${id}/`)).data;
 
export const getFeedbackLogsByIntervention =
  async (interventionId: string): Promise<FeedbackEmailLogListResponse> =>
    (await api.get(`${LOGS}/by-intervention/`, { params: { intervention: interventionId } })).data;
 
export const getFeedbackLogsByCategory =
  async (categoryId: string): Promise<FeedbackEmailLogListResponse> =>
    (await api.get(`${LOGS}/by-category/`, { params: { category: categoryId } })).data;
 
export const deleteFeedbackEmailLog =
  async (id: string): Promise<{ success: boolean; message: string; data: null }> =>
    (await api.delete(`${LOGS}/${id}/delete/`)).data;
 

export const sendFeedbackEmail =
  async (payload: SendFeedbackEmailPayload): Promise<SendFeedbackEmailResponse> =>
    (await api.post(`${LOGS}/send/`, payload)).data;
 
export const resendFeedbackEmail =
  async (logId: string): Promise<SendFeedbackEmailResponse> =>
    (await api.post(`${LOGS}/${logId}/resend/`)).data;
 
export const bulkSendFeedbackEmail =
  async (payload: BulkSendPayload): Promise<BulkSendResponse> =>
    (await api.post(`${LOGS}/bulk-send/`, payload)).data;
 

 
export const getInterventionFeedbackStatuses =
  async (filters?: InterventionStatusFilters): Promise<InterventionFeedbackStatusListResponse> =>
    (await api.get(`${LOGS}/intervention-statuses/`, { params: filters })).data;
 