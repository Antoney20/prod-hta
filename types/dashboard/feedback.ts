export interface FeedbackSubmission {
  subject?: string;
  message: string;
}

export interface Feedback {
  id: string;
  subject: string | null;
  type: string;
  message: string;
  status: 'new' | 'reviewing' | 'resolved' | 'closed';
  admin_response: string | null;
  responded_at: string | null;
  responded_by: number | null;
  ip_address: string | null;
  reference_number: string | null;
  user_agent: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  created_at: string;

  updated_at: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id?: string;
  feedback?: Feedback;
}
