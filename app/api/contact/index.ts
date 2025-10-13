import axios from 'axios';
import type { ContactFormData, ContactSubmissionResponse, ContactValidationResult } from '@/types/contact';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Validate contact form data
 */
export const validateContactForm = (data: ContactFormData): ContactValidationResult => {
  const errors: string[] = [];

  // Validate full name
  if (!data.fullName.trim()) {
    errors.push('Full name is required');
  } else if (data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  // Validate subject
  if (!data.subject.trim()) {
    errors.push('Subject is required');
  } else if (data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters');
  }

  // Validate message
  if (!data.message.trim()) {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


export const submitContactForm = async (data: ContactFormData): Promise<ContactSubmissionResponse> => {
  try {
    const response = await axios.post<ContactSubmissionResponse>(
      `${API_BASE_URL}/v1/contact/`,
      {
        full_name: data.fullName,
        email: data.email,
        organization: data.organization || '',
        subject: data.subject,
        message: data.message
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle API error responses
      if (error.response) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (error.response.status === 400 && errorData.errors) {
          return {
            success: false,
            message: errorData.message || 'Please check your form data.',
            errors: errorData.errors
          };
        }
        
        // Handle rate limiting
        if (error.response.status === 429) {
          return {
            success: false,
            message: errorData.message || 'Maximum submission limit reached. Please contact us directly.'
          };
        }
        
        // Handle other API errors
        return {
          success: false,
          message: errorData.message || 'Failed to send message. Please try again.'
        };
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};