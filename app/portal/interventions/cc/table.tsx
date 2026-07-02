"use client";


import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { htmlToText } from "@/components/shared/text";

interface InterventionsTableProps {
  proposals: SubmittedProposal[];
  page: number;
  pageSize: number;
}


function EmptyState() {
  return (
    <tr>
      <td colSpan={8} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <FileText className="h-10 w-10 opacity-20" />
          <div>
            <p className="text-sm font-medium text-slate-500">No interventions found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filters or clearing the search term.
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function CountyBadge({ county }: { county?: string }) {
  if (!county) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
      {county}
    </span>
  );
}

function TypeChip({ type }: { type?: string | null }) {
  if (!type) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600 whitespace-nowrap">
      {type}
    </span>
  );
}

function DocumentLinks({ documents }: { documents?: SubmittedProposal["documents"] }) {
  if (!documents || documents.length === 0) {
    return <span className="text-slate-300 text-xs">No documents</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#27aae1] hover:underline"
        >
          <FileText className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-40">{doc.original_name}</span>
          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
        </a>
      ))}
    </div>
  );
}

const TH = "px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-2 py-2 align-top";



export function InterventionsTable({
  proposals,
  page,
  pageSize,
}: InterventionsTableProps) {
  const router = useRouter();

  
  return (
    <div className="overflow-x-auto  border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className={`${TH} w-10 text-center`}>Count</th>
             <th className={`${TH} w-48`}>Package</th>
            <th className={`${TH} w-32`}>Ref No.</th>
            <th className={`${TH} min-w-60`}>Intervention Name</th>
            <th className={`${TH} w-28`}>Date Submitted</th>
            <th className={`${TH} w-32`}>Type</th>
            <th className={`${TH} min-w-45`}>Proposed Beneficiary</th>
            <th className={`${TH} w-48`}>Documents</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proposals.length === 0 ? (
            <EmptyState />
          ) : (
            proposals.map((p, idx) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>
                  {(page - 1) * pageSize + idx + 1}
                </td>

                <td className={TD}>
                  <p className="text-xs text-slate-700 line-clamp-2 max-w-90">
                   {p.package_name ?? "—"}
                  </p>
                </td>

                <td className={TD}>
                  <button
                    onClick={() =>
                      router.push(`/portal/interventions/${p.id}`)
                    }
                    className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                  >
                    {p.reference_number ?? "—"}
                  </button>
                </td>

                <td className={TD}>
                 <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 max-w-xl lg:max-w-xl">
                    {p.intervention_name ?? (
                      <span className="text-slate-300 italic">Untitled</span>
                    )}
                  </p>
                </td>

                {/* Date */}
                <td className={`${TD} text-xs text-slate-600 whitespace-nowrap`}>
                  {p.date ? new Date(p.date).toLocaleDateString("en-GB") : "—"}
                </td>                

                {/* Type */}
                <td className={TD}>
                  <TypeChip type={p.intervention_type} />
                </td>


                <td className={TD}>
                  <p className="text-xs text-slate-700 line-clamp-2 max-w-90">
                   {htmlToText(p.beneficiary) ?? "—"}
                  </p>
                </td>

                <td className={TD}>
                  <DocumentLinks documents={p.documents} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}