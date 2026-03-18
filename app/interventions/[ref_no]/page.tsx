"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicProposal } from "@/types/new/public";
import { getPublicProposals } from "@/app/api/public";
import Navbar from "@/app/components/layouts/navbar";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}


// function DetailRow({
//   label,
//   value,
//   wide = false,
// }: {
//   label: string;
//   value: React.ReactNode;
//   wide?: boolean;
// }) {
//   return (
//     <div
//       className={`py-4 border-b border-gray-200 ${
//         wide ? "sm:col-span-2" : ""
//       } sm:grid sm:grid-cols-3 sm:gap-4`}
//     >
//       <dt className="text-sm font-bold text-gray-700 mb-1 sm:mb-0">{label}</dt>
//       <dd className="text-sm text-gray-900 sm:col-span-2">{value ?? "—"}</dd>
//     </div>
//   );
// }


function DetailRow({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  return (
    <div
      className={`py-4 border-b border-gray-200 ${
        wide ? "sm:col-span-2" : ""
      } sm:grid sm:grid-cols-3 sm:gap-4`}
    >
      <dt className="text-sm font-bold text-gray-700 mb-1 sm:mb-0">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 sm:col-span-2">
        {value}
      </dd>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-block bg-blue-50 text-[#1d70b8] text-xs font-semibold px-2.5 py-1 border border-blue-200">
      {type}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse max-w-3xl">
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-4 border-b border-gray-200 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 sm:mb-0" />
          <div className="h-4 bg-gray-100 rounded w-2/3 sm:col-span-2" />
        </div>
      ))}
    </div>
  );
}

function NotFound({ refNo }: { refNo: string }) {
  return (
    <div className="py-16 text-center max-w-lg mx-auto">
      <div className="text-5xl font-black text-gray-200 mb-4">404</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Intervention not found</h2>
      <p className="text-sm text-gray-500 mb-6">
        No intervention with reference number{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-800">
          {refNo}
        </code>{" "}
        could be found.
      </p>
      <Link
        href="/interventions"
        className="inline-block bg-[#1d70b8] text-white text-sm font-semibold px-5 py-2 hover:bg-[#003078] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:ring-offset-2"
      >
        ← Back to all interventions
      </Link>
    </div>
  );
}


export default function InterventionDetailPage() {
  const params = useParams();
  const refNo = decodeURIComponent((params?.ref_no as string) ?? "");

  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!refNo) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    getPublicProposals()
      .then((results) => {
        if (cancelled) return;
        const match = results.find(
          (p) => p.reference_number.toLowerCase() === refNo.toLowerCase()
        );
        if (match) {
          setProposal(match);
        } else {
          setNotFound(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refNo]);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-white mt-8">
      <div className="border-b border-gray-200 bg-white py-6">
        <div className="container mx-auto px-4 sm:px-6 py-2">
          <nav className="flex items-center gap-1 text-sm flex-wrap" aria-label="Breadcrumb">
            <a href="/" className="text-[#1d70b8] underline hover:text-[#003078]">Home</a>
            <span className="text-gray-400 mx-1">›</span>
            <a href="/interventions" className="text-[#1d70b8] underline hover:text-[#003078]">All Proposals</a>
            <span className="text-gray-400 mx-1">›</span>
            <Link href="/interventions" className="text-[#1d70b8] underline hover:text-[#003078]">
              Submitted
            </Link>
            <span className="text-gray-400 mx-1">›</span>
            <span className="text-gray-700 truncate max-w-xs">{refNo}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4 max-w-xl">
            <p className="text-red-800 font-bold text-sm">Failed to load intervention</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {notFound && <NotFound refNo={refNo} />}

        {!isLoading && !error && proposal && (
          <div className="max-w-7xl">

            <Link
              href="/interventions"
              className="inline-flex items-center gap-1.5 text-sm text-[#1d70b8] underline hover:text-[#003078] mb-6 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all interventions
            </Link>

            {/* Title block */}
            <div className="border-b-2 border-gray-900 pb-6 mb-0">
              <div className="flex items-start gap-3 flex-wrap mb-2">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 border border-gray-300">
                  {proposal.reference_number}
                </span>
                {proposal.intervention_type && (
                  <TypeBadge type={proposal.intervention_type} />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mt-3">
                {proposal.intervention_name ?? "Unnamed Intervention"}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Submitted {formatDate(proposal.date)}
              </p>
            </div>

            {/* Detail fields */}
            <dl className="divide-y divide-gray-200">
              <DetailRow label="Reference number" value={
                <code className="font-mono text-sm">{proposal.reference_number}</code>
              } />

              <DetailRow label="Type" value={
                proposal.intervention_type
                  ? <TypeBadge type={proposal.intervention_type} />
                  : null
              } />

              <DetailRow label="Date submitted" value={formatDate(proposal.date)} />

              <DetailRow
                label="Beneficiary"
                value={proposal.beneficiary}
                wide
              />

              <DetailRow
                label="Justification"
                value={
                  proposal.justification ? (
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {proposal.justification}
                    </p>
                  ) : null
                }
                wide
              />

              <DetailRow
                label="Expected impact"
                value={
                  proposal.expected_impact ? (
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {proposal.expected_impact}
                    </p>
                  ) : null
                }
                wide
              />
            </dl>

            {/* Footer actions */}
            <div className="mt-10 pt-6 border-t-2 border-gray-900 flex flex-wrap gap-3">
              <Link
                href="/interventions"
                className="inline-block border-2 border-gray-900 text-gray-900 text-sm font-semibold px-5 py-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              >
                ← All interventions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}