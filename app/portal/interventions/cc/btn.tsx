"use client";


import { useState, useRef, useEffect } from "react";
import { FileDown, ChevronDown, ShieldCheck, Globe } from "lucide-react";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { exportInterventionsToCSV } from "../utils/exportToCsv";
import RoleGuard from "@/app/context/role";


function ExportDropdown({ proposals }: { proposals: SubmittedProposal[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={proposals.length === 0}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#27aae1] hover:text-[#27aae1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        <FileDown className="h-4 w-4" />
        Download data
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Export format
            </p>
          </div>

          <button
            type="button"
            onClick={() => { exportInterventionsToCSV(proposals, "public"); setOpen(false); }}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <Globe className="h-4 w-4 text-[#27aae1] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Public CSV</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Reference, date, intervention name, type, county, beneficiary,
                documents. No personal data.
              </p>
            </div>
          </button>

          {/* Full CSV — includes personal data */}
          <button
            type="button"
            onClick={() => { exportInterventionsToCSV(proposals, "full"); setOpen(false); }}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
          >
            <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Full CSV</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                All columns including name, email, phone, organisation,
                justification and signature.
              </p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1 uppercase tracking-wide">
                Contains personal data
              </p>
            </div>
          </button>

          {/* Record count */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              {proposals.length.toLocaleString()} record
              {proposals.length !== 1 ? "s" : ""} will be exported
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


export function ExportButton({ proposals }: { proposals: SubmittedProposal[] }) {
  return (
    <RoleGuard minimumRole="admin" silent>
      <ExportDropdown proposals={proposals} />
    </RoleGuard>
  );
}