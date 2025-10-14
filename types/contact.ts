export interface ContactFormData {
  fullName: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ContactValidationResult {
  isValid: boolean;
  errors: string[];
}



export interface ContactSubmission {
  id: number;
  full_name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  ip_address?: string;
  created_at: string;
}

export interface ContactSubmissionCreate {
  full_name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}


export interface NewsletterSubscription {
  id: string;
  email: string;
  is_active: boolean;
  ip_address?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface NewsletterSubscriptionCreate {
  email: string;
}

export interface NewsletterUnsubscribe {
  email: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}