"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  Hash,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";

const BLUE = "#27aae1";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fixUrl(url: string) {
  return url.includes("localhost")
    ? url.replace(/http:\/\/localhost\/media/, "https://bptap.health.go.ke/media")
    : url;
}

function DefinitionRow({
  label,
  children,
  span = false,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800 mb-1">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 leading-relaxed">{children}</dd>
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-800 pb-3 border-b border-slate-200 mb-5">
      {children}
    </h2>
  );
}


function ProseSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  if (!content) return null;
  return (
    <section className="bg-white border border-slate-200 p-6">
      <SectionTitle>{title}</SectionTitle>
      <p className="text-sm text-gray-800 leading-[1.85] whitespace-pre-wrap">
        {content}
      </p>
    </section>
  );
}

function Pulse({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${h} ${w}`} />;
}

function LoadingState() {
  return (
    <div className="space-y-0 divide-y divide-slate-200">
      {/* nav */}
      <div className="px-6 py-4 flex items-center gap-3">
        <Pulse h="h-8" w="w-8" />
        <Pulse h="h-4" w="w-48" />
      </div>
      {/* header band */}
      <div className="px-6 py-8 space-y-3">
        <Pulse h="h-3" w="w-24" />
        <Pulse h="h-7" w="w-2/3" />
        <div className="flex gap-6 pt-2">
          <Pulse h="h-3" w="w-28" />
          <Pulse h="h-3" w="w-28" />
          <Pulse h="h-3" w="w-28" />
        </div>
      </div>
      {/* body */}
      <div className="px-6 py-8 grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <Pulse h="h-40" />
          <Pulse h="h-28" />
          <Pulse h="h-52" />
        </div>
        <div className="space-y-4">
          <Pulse h="h-24" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-xs space-y-4">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
        <div>
          <p className="font-semibold text-slate-800 text-sm">Could not load intervention</p>
          <p className="text-xs text-slate-500 mt-1">{message}</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-slate-900 border border-slate-200 px-4 py-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </button>
      </div>
    </div>
  );
}

export default function TrackerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const trackerId = params?.id as string;

  const [tracker, setTracker] = useState<SubmittedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trackerId) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getSubmittedProposals();
        const found = res.results.find(
          (p: SubmittedProposal) => String(p.id) === trackerId
        );
        if (!found) throw new Error("Intervention not found");
        setTracker(found);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [trackerId]);

  if (loading) return <LoadingState />;
  if (error || !tracker)
    return (
      <ErrorState
        message={error || "Intervention not found"}
        onBack={() => router.back()}
      />
    );

  const hasDocuments = tracker.documents && tracker.documents.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="container mx-auto">

        <nav className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-white">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center h-8 w-8 border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-800">
            <button
              onClick={() => router.push("/portal/interventions")}
              className="hover:text-[#27aae1] transition-colors font-medium"
            >
              All Interventions
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono text-gray-900 font-semibold">
              {tracker.reference_number}
            </span>
          </div>

          <div className="ml-auto">
            <button
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-900 border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-400 hover:text-slate-900 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </nav>

        <header className="bg-white border-b border-slate-200 px-6 py-7">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="block h-px w-6"
              style={{ background: BLUE }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: BLUE }}
            >
              Intervention Proposal
            </span>
          </div>

          {/* Title + type pill */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 leading-snug max-w-2xl tracking-tight">
              {tracker.intervention_name ?? "Untitled Intervention"}
            </h1>

            {tracker.intervention_type && (
              <span className="shrink-0 self-start text-xs font-semibold px-2.5 py-1 border border-slate-300 text-gray-900 bg-slate-50 uppercase tracking-wide">
                {tracker.intervention_type}
              </span>
            )}
          </div>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-1.5 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Hash className="h-3 w-3 text-gray-800" />
              <span className="font-mono font-semibold text-slate-700">{tracker.reference_number}</span>
            </span>
            {tracker.county && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3 w-3 text-gray-800" />
               ----
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3 w-3 text-gray-800" />
              Submitted {formatDate(tracker.date)}
            </span>
          </div>
        </header>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 border-b border-slate-200">


          <div className="lg:col-span-2 bg-[#f8f9fb] space-y-px">

            <ProseSection title="Justification" content={tracker.justification} />
          
            <ProseSection title="Expected Impact" content={tracker.expected_impact} />
            <ProseSection title="Additional Information" content={tracker.additional_info} />

            {/* Proposal Details */}
            <section className="bg-white border-0 p-6">
              <SectionTitle>Proposal Details</SectionTitle>
              <dl className="grid grid-cols-2 gap-x-10 gap-y-6">
                <DefinitionRow label="Intervention Type">
                  {tracker.intervention_type ?? (
                    <span className="text-slate-300 italic">Not specified</span>
                  )}
                </DefinitionRow>

         

                <DefinitionRow label="Proposed Beneficiary" span>
                  {tracker.beneficiary ?? (
                    <span className="text-slate-300 italic">Not specified</span>
                  )}
                </DefinitionRow>

              </dl>
            </section>

            {/* Documents */}
            {hasDocuments && (
              <section className="bg-white p-6">
                <SectionTitle>
                  Attached Documents
                  <span className="ml-2 font-normal normal-case tracking-normal text-gray-800">
                    ({tracker.documents!.length})
                  </span>
                </SectionTitle>
                <div className="divide-y divide-slate-100">
                  {tracker.documents!.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        window.open(
                          fixUrl(doc.document ?? doc.document_url ?? ""),
                          "_blank"
                        )
                      }
                      className="group w-full flex items-center gap-4 py-3 text-left hover:bg-slate-50 -mx-6 px-6 transition-colors"
                    >
                      {/* File icon column */}
                      <div className="shrink-0 flex items-center justify-center h-9 w-9 border border-slate-200 bg-slate-50 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors">
                        <FileText className="h-4 w-4 text-gray-800 group-hover:text-[#27aae1] transition-colors" />
                      </div>

                      {/* Name */}
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate group-hover:text-[#27aae1] transition-colors">
                        {doc.original_name}
                      </span>

                      {/* Open link */}
                      <span className="shrink-0 flex items-center gap-1 text-xs text-gray-800 group-hover:text-[#27aae1] transition-colors">
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Timeline — full width at the bottom */}
            <section className="bg-white p-6">
              <SectionTitle>Timeline</SectionTitle>
              <div className="flex items-center gap-3">
                {/* dot + line */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="h-2.5 w-2.5 rounded-full border-2 border-white ring-2"
                    style={{  background: BLUE }}
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">
                    Submitted
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {formatDate(tracker.date)}
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Right — empty sidebar reserved for future widgets (scores, status, etc.) */}
          <div className="bg-[#f8f9fb] hidden lg:block" />

        </div>
      </div>
    </div>
  );
}