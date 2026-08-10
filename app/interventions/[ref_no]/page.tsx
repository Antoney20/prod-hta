"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicProposal } from "@/types/new/public";
import { NationalProgram, ProgramProposal, ProgramField } from "@/types/new/program";
import {
  getPublicProposals,
  getPublicProgramProposals,
  getPublicProgram,
} from "@/app/api/public";
import Navbar from "@/app/components/layouts/navbar";
import { htmlToText, RichText } from "@/components/shared/text";


const CONTAINER = "mx-auto container w-full px-4 sm:px-6 lg:px-8";
const PROSE_TYPES = new Set(["richtext", "textarea"]);

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

function hasValue(v: unknown): boolean {
  return !(v == null || v === "" || (Array.isArray(v) && v.length === 0));
}

function resolveFields(program: NationalProgram | null, data: Record<string, any>): ProgramField[] {
  if (program?.field_schema?.length) return program.field_schema;
  return Object.keys(data ?? {}).map((k) => ({ key: k, label: k, type: "text" }));
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

function ScalarValue({ field, value }: { field: ProgramField; value: any }) {
  if (field.type === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (Array.isArray(value)) return <>{value.join(", ")}</>;
  if (field.type === "date") return <>{formatDate(String(value))}</>;
  if (field.type === "url")
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1d70b8] underline hover:text-[#003078]"
      >
        {String(value)}
      </a>
    );
  if (field.type === "email")
    return (
      <a href={`mailto:${value}`} className="text-[#1d70b8] underline hover:text-[#003078]">
        {String(value)}
      </a>
    );
  return <>{htmlToText(String(value))}</>;
}

function BackLink() {
  return (
    <Link
      href="/interventions"
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to all proposals
    </Link>
  );
}

function FooterActions() {
  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t-2 border-gray-900 pt-6">
      <Link
        href="/interventions"
        className="inline-block border-2 border-gray-900 px-5 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
      >
        ← All proposals
      </Link>
    </div>
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
      <h2 className="mb-2 text-xl font-bold text-gray-900">Proposal not found</h2>
      <p className="mb-6 text-sm text-gray-500">
        No proposal with reference number{" "}
        <code className="border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800">
          {refNo}
        </code>{" "}
        could be found.
      </p>
      <Link
        href="/interventions"
        className="inline-block bg-[#1d70b8] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003078] focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:ring-offset-2"
      >
        ← Back to all proposals
      </Link>
    </div>
  );
}

export default function InterventionDetailPage() {
  const params = useParams();
  const refNo = decodeURIComponent((params?.ref_no as string) ?? "");

  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [programProposal, setProgramProposal] = useState<ProgramProposal | null>(null);
  const [program, setProgram] = useState<NationalProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!refNo) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      // 1) interventions
      try {
        const results = await getPublicProposals();
        if (cancelled) return;
        const match = results.find(
          (p) => p.reference_number.toLowerCase() === refNo.toLowerCase()
        );
        if (match) {
          setProposal(match);
          setIsLoading(false);
          return;
        }
      } catch {
        // failure here shouldn't block the national-program fallback
      }

      // 2) fallback: national program proposals
      try {
        const progProposals = await getPublicProgramProposals();
        if (cancelled) return;
        const pMatch = progProposals.find(
          (p) => p.reference_number?.toLowerCase() === refNo.toLowerCase()
        );
        if (pMatch) {
          setProgramProposal(pMatch);
          const prog = await getPublicProgram(String(pMatch.program));
          if (!cancelled) {
            setProgram(prog);
            setIsLoading(false);
          }
          return;
        }
        if (!cancelled) {
          setNotFound(true);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refNo]);

  /* national-programme derived values */
  const data = (programProposal?.data as Record<string, any>) ?? {};
  const fields = programProposal ? resolveFields(program, data) : [];
  const proseFields = fields.filter((f) => PROSE_TYPES.has(f.type) && hasValue(data[f.key]));
  const scalarFields = fields.filter((f) => !PROSE_TYPES.has(f.type) && hasValue(data[f.key]));
  const programName = program?.name ?? programProposal?.program_name ?? "National Programme";
  const programCode = program?.code ?? programProposal?.program_code;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-20">
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

        <div className={`${CONTAINER}  py-6`}>
          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="max-w-xl border-l-4 border-red-600 bg-red-50 px-6 py-4">
              <p className="text-sm font-bold text-red-800">Failed to load proposal</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {notFound && <NotFound refNo={refNo} />}

          {!isLoading && !error && proposal && (
            <div>
              <BackLink />

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

                {/* <DetailRow label="Date submitted" value={formatDate(proposal.date)} /> */}
                <DetailRow label="Beneficiary" value={<RichText html={proposal.beneficiary} />} />

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

              <FooterActions />
            </div>
          )}

          {/* ------------------------- NATIONAL PROGRAMME PROPOSAL ------------------------- */}
          {!isLoading && !error && !proposal && programProposal && (
            <div>
              <BackLink />

              {/* Title block */}
              <div className="border-b-2 border-gray-900 pb-6">
                <div className="mb-2 flex flex-wrap items-start gap-3">
                  <span className="border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-sm text-gray-500">
                    {programProposal.reference_number}
                  </span>
                  <TypeBadge type={programName} />
                  {programCode && (
                    <span className="inline-block border border-gray-300 bg-gray-50 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {programCode}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-3xl">
                  {programProposal.title || "Untitled Proposal"}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Submitted {formatDate(programProposal.submitted_date)}
                </p>
              </div>

              {/* Detail fields */}
              <dl className="divide-y divide-gray-200">
                {/* <DetailRow
                  label="Reference number"
                  value={<code className="font-mono text-sm">{programProposal.reference_number}</code>}
                /> */}

                <DetailRow label="National programme" value={programName} />
                {/* <DetailRow label="Date submitted" value={formatDate(programProposal.submitted_date)} /> */}

                {programProposal.justification &&
                  htmlToText(programProposal.justification).length > 0 && (
                    <DetailRow
                      label="Justification"
                      value={<RichText html={programProposal.justification} className="text-gray-900" />}
                      wide
                    />
                  )}

                {scalarFields.map((f) => (
                  <DetailRow
                    key={f.key}
                    label={f.label}
                    value={<ScalarValue field={f} value={data[f.key]} />}
                  />
                ))}

                {proseFields.map((f) => (
                  <DetailRow
                    key={f.key}
                    label={f.label}
                    value={
                      f.type === "richtext" ? (
                        <RichText html={String(data[f.key] ?? "")} className="text-gray-900" />
                      ) : (
                        <span className="whitespace-pre-line">{String(data[f.key])}</span>
                      )
                    }
                    wide
                  />
                ))}
              </dl>

              {scalarFields.length === 0 && proseFields.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No additional fields recorded for this proposal.
                </p>
              )}

              <FooterActions />
            </div>
          )}
        </div>
      </div>
    </>
  );
}