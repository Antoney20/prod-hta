import axios from 'axios';
import type { FormData } from '@/types/form';

const API_BASE_URL = 'http://127.0.0.1:8000/v1';

export interface ApiResponse {
  success: boolean;
  message: string;
  submission_id?: string;
  status?: string;
  error?: string;
}

export interface SubmissionStatus {
  submission_id: string;
  status: string;
  attempts: number;
  submitted_at: string;
  completed_at: string | null;
  proposal_id: number | null;
}

export const submitProposal = async (formData: FormData): Promise<ApiResponse> => {
  try {
    const submitData = new FormData();
    
    submitData.append('name', formData.name);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    submitData.append('profession', formData.profession);
    submitData.append('organization', formData.organization);
    submitData.append('county', formData.county);
    submitData.append('interventionName', formData.interventionName);
    submitData.append('interventionType', formData.interventionType);
    submitData.append('beneficiary', formData.beneficiary);
    submitData.append('justification', formData.justification);
    submitData.append('expectedImpact', formData.expectedImpact);
    submitData.append('additionalInfo', formData.additionalInfo || '');
    submitData.append('signature', formData.signature);
    submitData.append('date', formData.date);

    if (formData.uploadedDocument) {
      submitData.append('uploadedDocument', formData.uploadedDocument);
    }

    const response = await axios.post(
      `${API_BASE_URL}/intervention-proposal/`,
      submitData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error submitting proposal:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data?.message || 'Server error occurred',
          error: error.response.data?.error || error.message
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          error: 'Network error'
        };
      }
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const checkSubmissionStatus = async (submissionId: string): Promise<SubmissionStatus | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/intervention-proposal/`,
      {
        params: { submission_id: submissionId },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error checking submission status:', error);
    return null;
  }
};

export const checkMultipleSubmissions = async (submissionIds: string[]): Promise<SubmissionStatus[]> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/check-multiple-submissions/`,
      { submission_ids: submissionIds },
      {
        timeout: 10000,
      }
    );

    return response.data.submissions || [];
  } catch (error) {
    console.error('Error checking multiple submissions:', error);
    return [];
  }
};