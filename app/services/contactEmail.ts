export interface ContactFormData {
  fullName: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}

export interface ContactEmailConfig {
  recipient?: string;
  adminEmail?: string;
  subject?: string;
}

export interface ContactEmailResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

export const sendContactEmail = async (
  formData: ContactFormData,
  config: ContactEmailConfig = {}
): Promise<ContactEmailResponse> => {
  try {

    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      return {
        success: false,
        message: 'All required fields must be filled out',
        error: 'Missing required fields'
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
        error: 'Invalid email format'
      };
    }

    const emailFormData = new globalThis.FormData();
    

    emailFormData.append('fullName', formData.fullName);
    emailFormData.append('email', formData.email);
    emailFormData.append('organization', formData.organization || '');
    emailFormData.append('subject', formData.subject);
    emailFormData.append('message', formData.message);
    
    const response = await fetch('/api/contact-email', {
      method: 'POST',
      body: emailFormData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon as possible.',
      timestamp: result.timestamp
    };
    
  } catch (error) {

    
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const validateContactForm = (formData: ContactFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!formData.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!formData.email?.trim()) {
    errors.push('Email address is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  if (!formData.subject?.trim()) {
    errors.push('Subject is required');
  }
  
  if (!formData.message?.trim()) {
    errors.push('Message is required');
  }
  
  if (formData.fullName && formData.fullName.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }
  
  if (formData.subject && formData.subject.length < 2) {
    errors.push('Subject must be at least 5 characters long');
  }
  
  if (formData.message && formData.message.length < 5) {
    errors.push('Message must be at least 10 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};