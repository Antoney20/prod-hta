import { Suspense } from 'react';
import ApprovePageClient from './client';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 text-center max-w-sm md:max-w-md w-full">
        <div className="space-y-4">
          <div className="w-12 h-12 text-blue-600 animate-spin mx-auto">⏳</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Loading</h2>
            <p className="text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApprovePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ApprovePageClient />
    </Suspense>
  );
}