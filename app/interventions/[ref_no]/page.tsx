"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicProposal } from "@/types/new/public";
import { getPublicProposals } from "@/app/api/public";
import Navbar from "@/app/components/layouts/navbar";
import { htmlToText, RichText } from "@/components/shared/text";


const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

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
      className={`py-4 border-b border-gray-200 ${wide ? "sm:col-span-2" : ""} sm:grid sm:grid-cols-3 sm:gap-4`}
    >
      <dt className="text-sm font-bold text-gray-700 mb-1 sm:mb-0">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2">{value}</dd>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-block border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1d70b8]">
      {type}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="mb-4 h-8 w-2/3 bg-gray-200" />
      <div className="mb-8 h-4 w-1/3 bg-gray-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="mb-2 h-4 w-1/3 bg-gray-200 sm:mb-0" />
          <div className="h-4 w-2/3 bg-gray-100 sm:col-span-2" />
        </div>
      ))}
    </div>
  );
}

function NotFound({ refNo }: { refNo: string }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mb-4 text-5xl font-black text-gray-200">404</div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Intervention not found</h2>
      <p className="mb-6 text-sm text-gray-500">
        No intervention with reference number{" "}
        <code className="border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800">
          {refNo}
        </code>{" "}
        could be found.
      </p>
      <Link
        href="/interventions"
        className="inline-block bg-[#1d70b8] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003078] focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:ring-offset-2"
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
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className={`${CONTAINER} py-3`}>
            <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Breadcrumb">
              <Link href="/" className="text-[#1d70b8] underline hover:text-[#003078]">Home</Link>
              <span className="mx-1 text-gray-400">›</span>
              <Link href="/interventions" className="text-[#1d70b8] underline hover:text-[#003078]">All Proposals</Link>
              <span className="mx-1 text-gray-400">›</span>
              <span className="max-w-xs truncate text-gray-700">{refNo}</span>
            </nav>
          </div>
        </div>

        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="max-w-xl border-l-4 border-red-600 bg-red-50 px-6 py-4">
              <p className="text-sm font-bold text-red-800">Failed to load intervention</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {notFound && <NotFound refNo={refNo} />}

          {!isLoading && !error && proposal && (
            <div>
              <Link
                href="/interventions"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all interventions
              </Link>

              {/* Title block */}
              <div className="border-b-2 border-gray-900 pb-6">
                <div className="mb-2 flex flex-wrap items-start gap-3">
                  <span className="border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-sm text-gray-500">
                    {proposal.reference_number}
                  </span>
                  {proposal.intervention_type && <TypeBadge type={proposal.intervention_type} />}
                </div>
                <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-3xl">
                  {proposal.intervention_name ?? "Unnamed Intervention"}
                </h1>
                <p className="mt-2 text-sm text-gray-500">Submitted {formatDate(proposal.date)}</p>
              </div>

              {/* Detail fields */}
              <dl className="divide-y divide-gray-200">
                <DetailRow
                  label="Reference number"
                  value={<code className="font-mono text-sm">{proposal.reference_number}</code>}
                />

                <DetailRow
                  label="Type"
                  value={proposal.intervention_type ? <TypeBadge type={proposal.intervention_type} /> : null}
                />

                <DetailRow label="Date submitted" value={formatDate(proposal.date)} />
                <DetailRow label="Beneficiary" value= {<RichText html={proposal.beneficiary} />}/>

                <DetailRow
                  label="Justification"
                  value={<RichText html={proposal.justification} className="text-gray-900" />}
                  wide
                />

                <DetailRow
                  label="Expected impact"
                  value={
                    htmlToText(proposal.expected_impact).length > 0 ? (
                      <RichText html={proposal.expected_impact} className="text-gray-900" />
                    ) : null
                  }
                  wide
                />
              </dl>

              {/* Footer actions */}
              <div className="mt-10 flex flex-wrap gap-3 border-t-2 border-gray-900 pt-6">
                <Link
                  href="/interventions"
                  className="inline-block border-2 border-gray-900 px-5 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
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