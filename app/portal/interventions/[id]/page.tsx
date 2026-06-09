// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import {
//   ArrowLeft,
//   Calendar,
//   FileText,
//   Download,
//   ExternalLink,
//   AlertCircle,
//   Hash,
//   MapPin,
//   ChevronRight,
// } from "lucide-react";
// import type { SubmittedProposal } from "@/types/dashboard/submittedProposals";
// import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
// import RichText, { htmlToText } from "@/components/shared/text";
// import { useAuth } from "@/app/api/auth";


// const BLUE = "#27aae1";

// function formatDate(s: string) {
//   return new Date(s).toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// }

// function fixUrl(url: string) {
//   return url.includes("localhost")
//     ? url.replace(/http:\/\/localhost\/media/, "https://bptap.health.go.ke/media")
//     : url;
// }

// function DefinitionRow({
//   label,
//   children,
//   span = false,
// }: {
//   label: string;
//   children: React.ReactNode;
//   span?: boolean;
// }) {
//   return (
//     <div className={span ? "col-span-2" : ""}>
//       <dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">
//         {label}
//       </dt>
//       <dd className="text-sm leading-relaxed text-slate-800">{children}</dd>
//     </div>
//   );
// }

// function SectionTitle({ children }: { children: React.ReactNode }) {
//   return (
//     <h2 className="mb-5 border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-800">
//       {children}
//     </h2>
//   );
// }

// function ProseSection({
//   title,
//   content,
// }: {
//   title: string;
//   content?: string | null;
// }) {
//   // content is rich HTML now — treat empty markup ("<p><br></p>") as empty
//   if (!content || htmlToText(content).length === 0) return null;
//   return (
//     <section className="bg-white p-5 sm:p-6">
//       <SectionTitle>{title}</SectionTitle>
//       <RichText html={content} className="leading-[1.85] text-gray-800" />
//     </section>
//   );
// }

// function Pulse({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
//   return <div className={`animate-pulse rounded bg-slate-100 ${h} ${w}`} />;
// }

// function LoadingState() {
//   return (
//     <div className="divide-y divide-slate-200">
//       <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
//         <Pulse h="h-8" w="w-8" />
//         <Pulse h="h-4" w="w-48" />
//       </div>
//       <div className="space-y-3 px-4 py-8 sm:px-6">
//         <Pulse h="h-3" w="w-24" />
//         <Pulse h="h-7" w="w-2/3" />
//         <div className="flex gap-6 pt-2">
//           <Pulse h="h-3" w="w-28" />
//           <Pulse h="h-3" w="w-28" />
//           <Pulse h="h-3" w="w-28" />
//         </div>
//       </div>
//       <div className="space-y-6 px-4 py-8 sm:px-6">
//         <Pulse h="h-40" />
//         <Pulse h="h-28" />
//         <Pulse h="h-52" />
//       </div>
//     </div>
//   );
// }

// function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
//   return (
//     <div className="flex min-h-[60vh] items-center justify-center p-8">
//       <div className="max-w-xs space-y-4 text-center">
//         <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
//         <div>
//           <p className="text-sm font-semibold text-slate-800">Could not load intervention</p>
//           <p className="mt-1 text-xs text-slate-500">{message}</p>
//         </div>
//         <button
//           onClick={onBack}
//           className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-slate-900"
//         >
//           <ArrowLeft className="h-3.5 w-3.5" />
//           Go back
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function TrackerDetailPage() {
//   const { user } = useAuth();
//   const canViewDocuments = user?.role === "admin" || user?.role === "secretariat";
//   const router = useRouter();
//   const params = useParams();
//   const trackerId = params?.id as string;

//   const [tracker, setTracker] = useState<SubmittedProposal | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!trackerId) return;
//     (async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const res = await getSubmittedProposals();
//         const found = res.results.find(
//           (p: SubmittedProposal) => String(p.id) === trackerId
//         );
//         if (!found) throw new Error("Intervention not found");
//         setTracker(found);
//       } catch (err: any) {
//         setError(err.message ?? "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [trackerId]);

//   if (loading) return <LoadingState />;
//   if (error || !tracker)
//     return (
//       <ErrorState
//         message={error || "Intervention not found"}
//         onBack={() => router.back()}
//       />
//     );

//   const hasDocuments = tracker.documents && tracker.documents.length > 0;

//   return (
//     <div className="min-h-screen bg-[#f8f9fb]">
//       <div className="container mx-auto">
//         {/* Breadcrumb / actions */}
//         <nav className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
//           <button
//             onClick={() => router.back()}
//             className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800"
//             aria-label="Go back"
//           >
//             <ArrowLeft className="h-3.5 w-3.5" />
//           </button>
//           <div className="flex items-center gap-1.5 text-xs text-gray-800">
//             <button
//               onClick={() => router.push("/portal/interventions")}
//               className="font-medium transition-colors hover:text-[#27aae1]"
//             >
//               All Interventions
//             </button>
//             <ChevronRight className="h-3 w-3" />
//             <span className="font-mono font-semibold text-gray-900">{tracker.reference_number}</span>
//           </div>

//           <div className="ml-auto">
//             <button className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:border-slate-400 hover:text-slate-900">
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//           </div>
//         </nav>

//         {/* Header */}
//         <header className="border-b border-slate-200 bg-white px-4 py-7 sm:px-6">
//           <div className="mb-3 flex items-center gap-2">
//             <span className="block h-px w-6" style={{ background: BLUE }} />
//             <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: BLUE }}>
//               Intervention Proposal
//             </span>
//           </div>

//           <div className="flex flex-wrap items-start justify-between gap-6">
//             <h1 className="max-w-2xl text-xl font-bold leading-snug tracking-tight text-slate-900">
//               {tracker.intervention_name ?? "Untitled Intervention"}
//             </h1>

//             {tracker.intervention_type && (
//               <span className="shrink-0 self-start border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
//                 {tracker.intervention_type}
//               </span>
//             )}
//           </div>

//           <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-1.5">
//             <span className="flex items-center gap-1.5 text-xs text-slate-500">
//               <Hash className="h-3 w-3 text-gray-800" />
//               <span className="font-mono font-semibold text-slate-700">{tracker.reference_number}</span>
//             </span>
//             {tracker.county && (
//               <span className="flex items-center gap-1.5 text-xs text-slate-500">
//                 <MapPin className="h-3 w-3 text-gray-800" />
//                 {tracker.county}
//               </span>
//             )}
//             <span className="flex items-center gap-1.5 text-xs text-slate-500">
//               <Calendar className="h-3 w-3 text-gray-800" />
//               Submitted {formatDate(tracker.date)}
//             </span>
//           </div>
//         </header>

//         {/* Body — white sections separated by 1px slate gaps */}
//         <div className="border-b border-slate-200 bg-slate-200">
//           <div className="space-y-px">
//             <ProseSection title="Justification" content={tracker.justification} />
//             <ProseSection title="Expected Impact" content={tracker.expected_impact} />
//             <ProseSection title="Proposed Beneficiary" content={tracker.beneficiary} />
//             <ProseSection title="Additional Information" content={tracker.additional_info} />

//             {/* Proposal Details */}
//             <section className="bg-white p-5 sm:p-6">
//               <SectionTitle>Proposal Details</SectionTitle>
//               <dl className="grid grid-cols-2 gap-x-10 gap-y-6">
//                 <DefinitionRow label="Intervention Type">
//                   {tracker.intervention_type ?? (
//                     <span className="italic text-slate-400">Not specified</span>
//                   )}
//                 </DefinitionRow>

//                 {tracker.county && (
//                   <DefinitionRow label="County">{tracker.county}</DefinitionRow>
//                 )}

            
//                 {/* <DefinitionRow label="Proposed Beneficiary" span>
//                   {beneficiaryText || <span className="italic text-slate-400">Not specified</span>}
//                 </DefinitionRow> */}
//               </dl>
//             </section>




//             {hasDocuments && canViewDocuments && (
//               <section className="bg-white p-5 sm:p-6">
//                 <SectionTitle>
//                   Attached Documents
//                   <span className="ml-2 font-normal normal-case tracking-normal text-gray-800">
//                     ({tracker.documents!.length})
//                   </span>
//                 </SectionTitle>
//                 <div className="divide-y divide-slate-100">
//                   {tracker.documents!.map((doc, i) => (
//                     <button
//                       key={i}
//                       onClick={() =>
//                         window.open(fixUrl(doc.document ?? doc.document_url ?? ""), "_blank")
//                       }
//                       className="group -mx-5 flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50 sm:-mx-6 sm:px-6"
//                     >
//                       <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 transition-colors group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5">
//                         <FileText className="h-4 w-4 text-gray-800 transition-colors group-hover:text-[#27aae1]" />
//                       </div>
//                       <span className="flex-1 truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-[#27aae1]">
//                         {doc.original_name}
//                       </span>
//                       <span className="flex shrink-0 items-center gap-1 text-xs text-gray-800 transition-colors group-hover:text-[#27aae1]">
//                         Open
//                         <ExternalLink className="h-3 w-3" />
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* Timeline */}
//             <section className="bg-white p-5 sm:p-6">
//               <SectionTitle>Timeline</SectionTitle>
//               <div className="flex items-center gap-3">
//                 <span
//                   className="h-2.5 w-2.5 rounded-full border-2 border-white ring-2 ring-[#27aae1]/30"
//                   style={{ background: BLUE }}
//                 />
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">
//                     Submitted
//                   </p>
//                   <p className="mt-0.5 text-sm font-semibold text-slate-800">
//                     {formatDate(tracker.date)}
//                   </p>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Calendar, FileText, Download, ExternalLink, AlertCircle,
  Hash, MapPin, ChevronRight, Layers,
} from "lucide-react";
import type { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import { getProgram, getProposal } from "@/app/api/new/programs";
import { NationalProgram, ProgramProposal, ProgramField } from "@/types/new/program";
import RichText, { htmlToText } from "@/components/shared/text";
import { useAuth } from "@/app/api/auth";

const BLUE = "#27aae1";
const PROSE_TYPES = new Set(["richtext", "textarea"]);

function formatDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function fixUrl(url: string) {
  return url.includes("localhost")
    ? url.replace(/http:\/\/localhost\/media/, "https://bptap.health.go.ke/media")
    : url;
}

function hasValue(v: unknown): boolean {
  return !(v == null || v === "" || (Array.isArray(v) && v.length === 0));
}

function resolveFields(program: NationalProgram | null, data: Record<string, any>): ProgramField[] {
  if (program?.field_schema?.length) return program.field_schema;
  return Object.keys(data ?? {}).map((k) => ({ key: k, label: k, type: "text" }));
}

function ScalarValue({ field, value }: { field: ProgramField; value: any }) {
  if (!hasValue(value)) return <span className="italic text-slate-400">Not specified</span>;
  if (field.type === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (Array.isArray(value)) return <>{value.join(", ")}</>;
  if (field.type === "date") return <>{formatDate(String(value))}</>;
  if (field.type === "url")
    return <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-[#27aae1] underline">{String(value)}</a>;
  if (field.type === "email")
    return <a href={`mailto:${value}`} className="text-[#27aae1] underline">{String(value)}</a>;
  return <>{htmlToText(String(value))}</>;
}

function DefinitionRow({ label, children, span = false }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">{label}</dt>
      <dd className="text-sm leading-relaxed text-slate-800">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-800">
      {children}
    </h2>
  );
}

function ProseSection({ title, content }: { title: string; content?: string | null }) {
  if (!content || htmlToText(content).length === 0) return null;
  return (
    <section className="bg-white p-5 sm:p-6">
      <SectionTitle>{title}</SectionTitle>
      <RichText html={content} className="leading-[1.85] text-gray-800" />
    </section>
  );
}

function Pulse({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${h} ${w}`} />;
}

function LoadingState() {
  return (
    <div className="divide-y divide-slate-200">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <Pulse h="h-8" w="w-8" /><Pulse h="h-4" w="w-48" />
      </div>
      <div className="space-y-3 px-4 py-8 sm:px-6">
        <Pulse h="h-3" w="w-24" /><Pulse h="h-7" w="w-2/3" />
        <div className="flex gap-6 pt-2"><Pulse h="h-3" w="w-28" /><Pulse h="h-3" w="w-28" /><Pulse h="h-3" w="w-28" /></div>
      </div>
      <div className="space-y-6 px-4 py-8 sm:px-6"><Pulse h="h-40" /><Pulse h="h-28" /><Pulse h="h-52" /></div>
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-xs space-y-4 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Could not load proposal</p>
          <p className="mt-1 text-xs text-slate-500">{message}</p>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Go back
        </button>
      </div>
    </div>
  );
}

export default function TrackerDetailPage() {
  const { user } = useAuth();
  const canViewDocuments = user?.role === "admin" || user?.role === "secretariat";
  const router = useRouter();
  const params = useParams();
  const trackerId = params?.id as string;

  const [tracker, setTracker] = useState<SubmittedProposal | null>(null);
  const [programProposal, setProgramProposal] = useState<ProgramProposal | null>(null);
  const [program, setProgram] = useState<NationalProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trackerId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      // 1) interventions (unchanged source of truth)
      try {
        const res = await getSubmittedProposals();
        const found = res.results.find((p: SubmittedProposal) => String(p.id) === trackerId);
        if (found) {
          if (!cancelled) { setTracker(found); setLoading(false); }
          return;
        }
      } catch {
        // network/API failure here shouldn't block the national-program fallback
      }

      // 2) fallback: national program proposal
      try {
        const p = await getProposal(trackerId);
        if (p) {
          if (cancelled) return;
          setProgramProposal(p);
          const prog = await getProgram(p.program);
          if (!cancelled) { setProgram(prog); setLoading(false); }
          return;
        }
      } catch {
        // ignore — fall through to not-found
      }

      if (!cancelled) { setError("Proposal not found"); setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [trackerId]);

  if (loading) return <LoadingState />;

  /* ----------------------------- INTERVENTION (as is) ----------------------------- */
  if (tracker) {
    const hasDocuments = tracker.documents && tracker.documents.length > 0;
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="container mx-auto">
          <nav className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800" aria-label="Go back">
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-800">
              <button onClick={() => router.push("/portal/interventions")} className="font-medium transition-colors hover:text-[#27aae1]">All Interventions</button>
              <ChevronRight className="h-3 w-3" />
              <span className="font-mono font-semibold text-gray-900">{tracker.reference_number}</span>
            </div>
            <div className="ml-auto">
              <button className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:border-slate-400 hover:text-slate-900">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </nav>

          <header className="border-b border-slate-200 bg-white px-4 py-7 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="block h-px w-6" style={{ background: BLUE }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: BLUE }}>Intervention Proposal</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <h1 className="max-w-2xl text-xl font-bold leading-snug tracking-tight text-slate-900">
                {tracker.intervention_name ?? "Untitled Intervention"}
              </h1>
              {tracker.intervention_type && (
                <span className="shrink-0 self-start border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
                  {tracker.intervention_type}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Hash className="h-3 w-3 text-gray-800" />
                <span className="font-mono font-semibold text-slate-700">{tracker.reference_number}</span>
              </span>
              {tracker.county && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-gray-800" />{tracker.county}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3 w-3 text-gray-800" />Submitted {formatDate(tracker.date)}
              </span>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-slate-200">
            <div className="space-y-px">
              <ProseSection title="Justification" content={tracker.justification} />
              <ProseSection title="Expected Impact" content={tracker.expected_impact} />
              <ProseSection title="Proposed Beneficiary" content={tracker.beneficiary} />
              <ProseSection title="Additional Information" content={tracker.additional_info} />

              <section className="bg-white p-5 sm:p-6">
                <SectionTitle>Proposal Details</SectionTitle>
                <dl className="grid grid-cols-2 gap-x-10 gap-y-6">
                  <DefinitionRow label="Intervention Type">
                    {tracker.intervention_type ?? <span className="italic text-slate-400">Not specified</span>}
                  </DefinitionRow>
                  {tracker.county && <DefinitionRow label="County">{tracker.county}</DefinitionRow>}
                </dl>
              </section>

              {hasDocuments && canViewDocuments && (
                <section className="bg-white p-5 sm:p-6">
                  <SectionTitle>
                    Attached Documents
                    <span className="ml-2 font-normal normal-case tracking-normal text-gray-800">({tracker.documents!.length})</span>
                  </SectionTitle>
                  <div className="divide-y divide-slate-100">
                    {tracker.documents!.map((doc, i) => (
                      <button
                        key={i}
                        onClick={() => window.open(fixUrl(doc.document ?? doc.document_url ?? ""), "_blank")}
                        className="group -mx-5 flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50 sm:-mx-6 sm:px-6"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 transition-colors group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5">
                          <FileText className="h-4 w-4 text-gray-800 transition-colors group-hover:text-[#27aae1]" />
                        </div>
                        <span className="flex-1 truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-[#27aae1]">{doc.original_name}</span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-800 transition-colors group-hover:text-[#27aae1]">
                          Open <ExternalLink className="h-3 w-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="bg-white p-5 sm:p-6">
                <SectionTitle>Timeline</SectionTitle>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-white ring-2 ring-[#27aae1]/30" style={{ background: BLUE }} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">Submitted</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatDate(tracker.date)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- NATIONAL PROGRAM PROPOSAL (fallback) ------------------------- */
  if (programProposal) {
    const data = (programProposal.data as Record<string, any>) ?? {};
    const fields = resolveFields(program, data);
    const proseFields = fields.filter((f) => PROSE_TYPES.has(f.type) && hasValue(data[f.key]));
    const detailFields = fields.filter((f) => !PROSE_TYPES.has(f.type) && hasValue(data[f.key]));
    const programName = program?.name ?? programProposal.program_name ?? "National Program";
    const programCode = program?.code ?? programProposal.program_code;

    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="container mx-auto">
          <nav className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800" aria-label="Go back">
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-800">
              <button onClick={() => router.push("/portal/national-programs")} className="font-medium transition-colors hover:text-[#27aae1]">Programs</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => router.push(`/portal/national-programs/${programProposal.program}`)} className="font-medium transition-colors hover:text-[#27aae1]">
                {programCode ?? programName}
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="font-mono font-semibold text-gray-900">{programProposal.reference_number}</span>
            </div>
          </nav>

          <header className="border-b border-slate-200 bg-white px-4 py-7 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="block h-px w-6" style={{ background: BLUE }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: BLUE }}>{programName}</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <h1 className="max-w-2xl text-xl font-bold leading-snug tracking-tight text-slate-900">
                {programProposal.title || "Untitled"}
              </h1>
              {programCode && (
                <span className="shrink-0 self-start border border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-gray-900">
                  {programCode}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Hash className="h-3 w-3 text-gray-800" />
                <span className="font-mono font-semibold text-slate-700">{programProposal.reference_number}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Layers className="h-3 w-3 text-gray-800" />{programName}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3 w-3 text-gray-800" />Submitted {formatDate(programProposal.submitted_date)}
              </span>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-slate-200">
            <div className="space-y-px">
              {proseFields.map((f) => (
                <section key={f.key} className="bg-white p-5 sm:p-6">
                  <SectionTitle>{f.label}</SectionTitle>
                  {f.type === "richtext" ? (
                    <RichText html={String(data[f.key] ?? "")} className="leading-[1.85] text-gray-800" />
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">{String(data[f.key])}</p>
                  )}
                </section>
              ))}

              {detailFields.length > 0 && (
                <section className="bg-white p-5 sm:p-6">
                  <SectionTitle>Details</SectionTitle>
                  <dl className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                    {detailFields.map((f) => (
                      <DefinitionRow key={f.key} label={f.label}>
                        <ScalarValue field={f} value={data[f.key]} />
                      </DefinitionRow>
                    ))}
                  </dl>
                </section>
              )}

              {proseFields.length === 0 && detailFields.length === 0 && (
                <section className="bg-white p-8 text-center text-sm text-slate-400">
                  No additional fields recorded for this proposal.
                </section>
              )}

              <section className="bg-white p-5 sm:p-6">
                <SectionTitle>Timeline</SectionTitle>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-white ring-2 ring-[#27aae1]/30" style={{ background: BLUE }} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-800">Submitted</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatDate(programProposal.submitted_date)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------- NOT FOUND ----------------------------- */
  return <ErrorState message={error || "Proposal not found"} onBack={() => router.back()} />;
}