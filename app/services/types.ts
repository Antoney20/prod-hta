export interface FormData {
  name: string;
  phone: string;
  email: string;
  profession: string;
  organization: string;
  county: string;
  interventionName: string;
  interventionType: string;
  beneficiary: string;
  justification: string;
  expectedImpact: string;
  signature: string;
  date: string;
  additionalInfo: string;
  uploadedDocument: File | null; 
}

export interface FormErrors {
  [key: string]: string;
}

export interface EmailConfig {
  recipient: string;
  subject: string;
  body: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}