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