import api from '../auth';

interface VerificationResponse {
  success: boolean;
  message: string;
  user?: any;
}

/**
 * Verify user email with approve or reject action
 * @param userId - The user ID
 * @param token - The verification token
 * @param action - 'approve' or 'reject'
 */
export const verifyUserEmail = async (
  userId: number,
  token: string,
  action: 'approve' | 'reject'
): Promise<VerificationResponse> => {
  try {
    const response = await api.patch(
      `/v1/verify/${userId}/${token}/`,
      { action },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Verification failed. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Approve user registration
 */
export const approveUserRegistration = async (
  userId: number,
  token: string
): Promise<VerificationResponse> => {
  return verifyUserEmail(userId, token, 'approve');
};

/**
 * Reject user registration
 */
export const rejectUserRegistration = async (
  userId: number,
  token: string
): Promise<VerificationResponse> => {
  return verifyUserEmail(userId, token, 'reject');
};