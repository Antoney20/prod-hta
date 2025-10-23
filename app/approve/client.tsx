'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, AlertCircle, User, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/auth';


type VerificationStatus = 'idle' | 'loading' | 'success' | 'error' | 'validating';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  user?: UserData;
}

export default function ApprovePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get('user_id');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('validating');
  const [message, setMessage] = useState<string>('Validating token...');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate token and fetch user data on mount (GET request to check validity without action)
  const validateToken = async () => {
    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid or missing verification link.');
      setError('The verification link is incomplete. Please check the URL.');
      return;
    }

    try {
      setMessage('Validating token...');
      const response = await api.get(`/v1/verify/${userId}/${token}/`);

      if (response.data.success) {
        setUserData(response.data.user);
        setStatus('idle');
        setMessage('Please review this registration request.');
      } else {
        throw new Error(response.data.message || 'Token validation failed.');
      }
    } catch (err: any) {
      console.error('Validation error:', err);  // Log for debugging
      const errorMsg = err.response?.data?.message || err.message || 'Invalid or expired token. Please request a new verification link.';
      setStatus('error');
      setMessage('Token validation failed.');
      setError(errorMsg);
    }
  };

  // Handle approve action (PATCH request)
  const handleApprove = async () => {
    if (!userId || !token || isProcessing) return;

    setIsProcessing(true);
    setStatus('loading');
    setMessage('Approving user account...');

    try {
      const response = await api.patch(
        `/v1/verify/${userId}/${token}/`,
        { action: 'approve' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'User account approved successfully!');
        setTimeout(() => {
          router.push('/portal');
        }, 3000);  // Reduced timeout for better UX
      } else {
        throw new Error(response.data.message || 'Approval failed.');
      }
    } catch (err: any) {
      console.error('Approve error:', err);  // Log for debugging
      const errorMsg = err.response?.data?.message || err.message || 'Failed to approve user account. Please try again.';
      setStatus('error');
      setMessage(errorMsg);
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  // Handle reject action (PATCH request)
  const handleReject = async () => {
    if (!userId || !token || isProcessing) return;

    setIsProcessing(true);
    setStatus('loading');
    setMessage('Rejecting user account...');

    try {
      const response = await api.patch(
        `/v1/verify/${userId}/${token}/`,
        { action: 'reject' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'User account rejected successfully.');
        setTimeout(() => {
          router.push('/portal');
        }, 3000);  // Reduced timeout for better UX
      } else {
        throw new Error(response.data.message || 'Rejection failed.');
      }
    } catch (err: any) {
      console.error('Reject error:', err);  // Log for debugging
      const errorMsg = err.response?.data?.message || err.message || 'Failed to reject user account. Please try again.';
      setStatus('error');
      setMessage(errorMsg);
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  // Retry validation
  const handleRetry = () => {
    setStatus('validating');
    setError(null);
    setIsProcessing(false);
    setMessage('Validating token...');
    validateToken();
  };

  // Initial validation on mount
  useEffect(() => {
    validateToken();
  }, [userId, token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 text-center max-w-sm md:max-w-md w-full">
        {/* Validating State */}
        {status === 'validating' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Validating Token</h2>
              <p className="text-gray-500 mt-1">{message}</p>
            </div>
          </div>
        )}

        {/* Idle State - Review and Decide */}
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Review</h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* User Info Card */}
            {userData && (
              <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide ">User Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                      <p className="font-medium text-gray-900 truncate">
                        {userData.first_name} {userData.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="font-medium text-gray-900 truncate">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 text-gray-500 flex-shrink-0">📅</span>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide">Registered</p>
                      <p className="font-medium text-gray-900">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Approve Registration
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                Reject Registration
              </button>
            </div>

            <p className="text-xs text-gray-500">
              This action cannot be undone. Ensure the details are correct.
            </p>
          </div>
        )}

        {/* Loading State (for approve/reject) */}
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Processing Request</h2>
              <p className="text-gray-500 mt-1">{message}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-green-600">Success!</h2>
              <p className="text-gray-700 mt-2">{message}</p>
              <p className="text-gray-500 text-sm">Redirecting to dashboard in 3 seconds...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-red-600">Error</h2>
              <p className="text-gray-700 mt-2">{message}</p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/portal')}
              className="w-full px-4 py-2 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}