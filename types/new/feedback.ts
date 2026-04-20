
import { ISODateString, UUID } from "./shared";


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


export interface FeedbackCategory {
  id: UUID;
  name: string;
  description: string;
  subject: string;
  template: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface FeedbackCategoryCreatePayload {
  name: string;
  description?: string;
  subject: string;
  template: string;
  is_active?: boolean;
}

export type FeedbackCategoryUpdatePayload = Partial<FeedbackCategoryCreatePayload>;


export type FeedbackEmailStatus = "initial" | "sending" | "sent" | "failed";

export interface FeedbackEmailLog {
  id: UUID;
  // intervention
  intervention_id: UUID;
  intervention_name: string | null;
  reference_number: string | null;
  // category
  category: UUID;
  category_name: string;

  is_discussed: boolean;
  decision: string | null;
  decision_date: string | null;
  // email snapshot
  subject_sent: string;
  message_sent: string;
  recipient: string;
  sender: string;
  // tracking
  status: FeedbackEmailStatus;
  error_message: string | null;
  retry_count: number;
  last_attempt: ISODateString | null;
  sent_by: UUID | null;
  sent_by_name: string | null;
  created_at: ISODateString;
  sent_at: ISODateString | null;
}


export interface InterventionFeedbackStatus {
  intervention_id: UUID;
  intervention_name: string;
  reference_number: string;
  email: string;
  is_scored: boolean;
  total_score: number;
  is_discussed: boolean;
  decision: string | null;
  decision_date: string | null;
  feedback: string | null;
  latest_status_update_id: UUID | null;
}


export interface SendFeedbackEmailPayload {
  intervention: UUID;
  category: UUID;
  /** Enriches {{ decision_type }}, {{ decision_date }}, {{ feedback }} */
  status_update?: UUID;
}

export interface BulkSendPayload {
  category: UUID;
  /** Max 100 */
  intervention_ids: UUID[];
}

export interface BulkSendResult {
  total: number;
  sent_count: number;
  failed_count: number;
  sent: UUID[];
  failed: UUID[];
  errors: Record<UUID, string>;
}


export type FeedbackCategoryResponse              = ApiResponse<FeedbackCategory>;
export type FeedbackCategoryListResponse          = ApiResponse<FeedbackCategory[]>;
export type FeedbackEmailLogResponse              = ApiResponse<FeedbackEmailLog>;
export type FeedbackEmailLogListResponse          = ApiResponse<FeedbackEmailLog[]>;
export type SendFeedbackEmailResponse             = ApiResponse<FeedbackEmailLog | null>;
export type BulkSendResponse                      = ApiResponse<BulkSendResult>;
export type InterventionFeedbackStatusListResponse = ApiResponse<InterventionFeedbackStatus[]>;