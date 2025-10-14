import type {
  ContactSubmission,
  ContactSubmissionCreate,
  ContactSubmissionResponse,
  NewsletterSubscription,
  NewsletterSubscriptionCreate,
  NewsletterUnsubscribe,
  NewsletterResponse,
  APIResponse,
} from "@/types/contact";
import api from "../../auth";

/**
 * Get all contact submissions (requires authentication)
 */
export const getContactSubmissions = async (): Promise<APIResponse<ContactSubmission>> => {
  try {
    const response = await api.get('/v1/contact/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch contact submissions');
  }
};

/**
 * Get a specific contact submission by ID (requires authentication)
 */
export const getContactSubmission = async (id: number): Promise<ContactSubmission> => {
  try {
    const response = await api.get(`/v1/contact/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch contact submission');
  }
};

/**
 * Create a new contact submission (public endpoint)
 */
export const createContactSubmission = async (
  data: ContactSubmissionCreate
): Promise<ContactSubmissionResponse> => {
  try {
    const response = await api.post('/v1/contact/', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('Failed to submit contact form');
  }
};

/**
 * Delete a contact submission (requires authentication)
 */
export const deleteContactSubmission = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/contact/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete contact submission');
  }
};

// Newsletter Subscription APIs

/**
 * Get all newsletter subscriptions (requires authentication)
 */
export const getNewsletterSubscriptions = async (): Promise<APIResponse<NewsletterSubscription>> => {
  try {
    const response = await api.get('/v1/newsletter/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch newsletter subscriptions');
  }
};

/**
 * Get a specific newsletter subscription by ID (requires authentication)
 */
export const getNewsletterSubscription = async (id: string): Promise<NewsletterSubscription> => {
  try {
    const response = await api.get(`/v1/newsletter/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch newsletter subscription');
  }
};

/**
 * Subscribe to newsletter (public endpoint)
 */
export const subscribeToNewsletter = async (
  data: NewsletterSubscriptionCreate
): Promise<NewsletterResponse> => {
  try {
    const response = await api.post('/v1/newsletter/', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('Failed to subscribe to newsletter');
  }
};

/**
 * Unsubscribe from newsletter (public endpoint)
 */
export const unsubscribeFromNewsletter = async (
  data: NewsletterUnsubscribe
): Promise<NewsletterResponse> => {
  try {
    const response = await api.post('/v1/newsletter/unsubscribe/', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('Failed to unsubscribe from newsletter');
  }
};

/**
 * Delete a newsletter subscription (requires authentication)
 */
export const deleteNewsletterSubscription = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/newsletter/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete newsletter subscription');
  }
};