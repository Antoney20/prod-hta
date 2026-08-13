"use client";
import React, { useState, useMemo } from "react";
import { CriteriaInformation } from "@/types/new/criteria-info";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { exportCriteriaExcel } from "./handler";

interface TableProps {
  data: CriteriaInformation[];
  loading: boolean;
  onEdit: (row: CriteriaInformation) => void;
  onDelete: (row: CriteriaInformation) => Promise<void>;
}

const RESULTS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Resolve target-agnostic display fields
function targetOf(row: CriteriaInformation) {
  const isNational = row.target_type === "national_proposal";
  return {
    isNational,
    id: (isNational ? row.national_proposal : row.intervention) ?? "",
    name: (isNational ? row.national_proposal_name : row.intervention_name) ?? "—",
    ref: (isNational ? row.national_proposal_reference_number : row.intervention_reference_number) ?? "—",
    route: isNational
      ? `/portal/interventions/${row.national_proposal}`
      : `/portal/interventions/${row.intervention}`,
    typeLabel: isNational ? "National" : "Intervention",
  };
}

export function CriteriaTable({ data, loading, onEdit, onDelete }: TableProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [confirmRow, setConfirmRow] = useState<CriteriaInformation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim() && !fromDate && !toDate) return data;
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        const t = targetOf(r);
        return t.name.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q);
      });
    }

    if (fromDate || toDate) {
      result = result.filter((r) => {
        const itemDate = new Date(r.created_at);
        if (fromDate && itemDate < new Date(fromDate)) return false;
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59);
          if (itemDate > to) return false;
        }
        return true;
      });
    }
    return result;
  }, [data, search, fromDate, toDate]);

  const totalPages = Math.ceil(filtered.length / resultsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  React.useEffect(() => { setCurrentPage(1); }, [search, fromDate, toDate, resultsPerPage]);

  const handleConfirmDelete = async () => {
    if (!confirmRow) return;
    setDeleting(true);
    await onDelete(confirmRow);
    setDeleting(false);
    setConfirmRow(null);
  };

  const handleExport = async () => {
    if (!filtered.length || exporting) return;
    setExporting(true);
    try {
      await exportCriteriaExcel(filtered);
    } finally {
      setExporting(false);
    }
  };

  const cols = ["Ref No.", "Proposal", "Package", "Created At", "Actions"];

  return (
    <>
      {/* Filters */}
      <div className="bg-white border-b border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Keyword or reference #"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">×</button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">Results per page</label>
            <div className="flex gap-2">
              {RESULTS_PER_PAGE_OPTIONS.map((option) => (
                <button key={option} onClick={() => { setResultsPerPage(option); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${resultsPerPage === option ? "bg-gray-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#27aae1] border border-[#27aae1] transition-all hover:bg-[#1d8fc3] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Exporting…
              </>
            ) : (
              <>⬇ Export Excel</>
            )}
          </button>
        </div>

        <div className="pt-2">
          <p className="text-sm text-slate-600"><strong className="text-slate-900">{filtered.length}</strong> results</p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {cols.map((c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-gray-600 rounded-full animate-spin" />
                      <span className="text-slate-500">Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    {search || fromDate || toDate ? "No results found." : "No criteria information found."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => {
                  const t = targetOf(row);
                  return (
                    <tr key={row.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => router.push(t.route)}
                          className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap">
                          {t.ref}
                        </button>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{t.name}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wide border border-slate-200">
                          {t.typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        {row.package_name ? (
                          <span className="inline-block px-3 py-1 bg-[#27aae1] text-white rounded-full text-xs font-semibold border border-[#27aae1] truncate max-w-50" title={row.package_name}>
                            {row.package_name}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                        {new Date(row.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => onEdit(row)} className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-[#27aae1] hover:border-[#27aae1] transition-colors">Edit</button>
                          <button onClick={() => setConfirmRow(row)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 pb-6">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page <= 3 || page > totalPages - 3 || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage} className="cursor-pointer">{page}</PaginationLink>
                    </PaginationItem>
                  );
                }
                if (page === 4 || page === totalPages - 3) return <PaginationEllipsis key={`ellipsis-${page}`} />;
                return null;
              })}
              <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!confirmRow} onOpenChange={(open) => { if (!open) setConfirmRow(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Criteria Information?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the criteria record for{" "}
              <strong>{confirmRow ? targetOf(confirmRow).name : "this proposal"}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}