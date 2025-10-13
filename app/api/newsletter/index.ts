import axios from 'axios';
import type { NewsletterSubscriptionData, NewsletterResponse } from '@/types/newsletter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Subscribe to newsletter
 */
export const subscribeToNewsletter = async (data: NewsletterSubscriptionData): Promise<NewsletterResponse> => {
  try {
    const response = await axios.post<NewsletterResponse>(
      `${API_BASE_URL}/v1/newsletter/`,
      {
        email: data.email.trim().toLowerCase()
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data;
        
        return {
          success: false,
          message: errorData.message || 'Failed to subscribe. Please try again.'
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out. Please try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribeFromNewsletter = async (data: NewsletterSubscriptionData): Promise<NewsletterResponse> => {
  try {
    const response = await axios.post<NewsletterResponse>(
      `${API_BASE_URL}/newsletter/unsubscribe/`,
      {
        email: data.email.trim().toLowerCase()
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data;
        
        return {
          success: false,
          message: errorData.message || 'Failed to unsubscribe. Please try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
    
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};