import { Suspense } from "react";
import InterventionsPageWithData from "./client";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <p className="text-gray-500">Loading interventions...</p>
    </div>
  );
}

export default function InterventionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InterventionsPageWithData />
    </Suspense>
  );
}