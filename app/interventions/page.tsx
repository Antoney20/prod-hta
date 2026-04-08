import { Suspense } from "react";
import type { Metadata } from "next";
import InterventionsPageWithData from "./client";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <p className="text-gray-500">Loading interventions...</p>
    </div>
  );
}


export const metadata: Metadata = {
  title: "Interventions Proposal | BPTAP Kenya",
  description:
    "Submit and track health intervention proposals for Kenya’s Health Benefits Package through the Benefits Package and Tariffs Advisory Panel (BPTAP).",

  keywords: [
    "BPTAP",
    "Health Benefits Package",
    "Kenya health policy",
    "HTA Kenya",
    "CEMA",
    "Ministry of Health Kenya",
    "University of Nairobi",
    "health interventions",
    "UHC Kenya",
  ],

  metadataBase: new URL("https://bptap.health.go.ke"),

  openGraph: {
    title: "Interventions Proposal | BPTAP Kenya",
    description:
      "A transparent platform supporting evidence-informed healthcare decision-making in Kenya.",
    url: "https://bptap.health.go.ke/interventions",
    siteName: "BPTAP",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "/interventions",
  },

  authors: [
    { name: "Benefits Package and Tariffs Advisory Panel (BPTAP)" },
    { name: "Ministry of Health Kenya (MoH)" },
    { name: "University of Nairobi (UoN)" },
    { name: "Centre for Epidemiological Modelling and Analysis (CEMA)" },
  ],
};

export default function InterventionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InterventionsPageWithData />
    </Suspense>
  );
}