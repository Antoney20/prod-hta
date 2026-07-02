"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Layers } from "lucide-react";
import { toast } from "react-toastify";

import { useGlobalUser } from "@/app/context/guard";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { FilterState, PageSize } from "./utils/types";
import { ExportButton } from "./cc/btn";
import { InterventionFilterBar } from "./cc/filters";
import { InterventionsTable } from "./cc/table";
import { InterventionPagination } from "./cc/pagesize";

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 bg-slate-100 rounded animate-pulse"
            style={{ width: `${60 + (i % 3) * 20}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {["#", "Ref No.", "Date", "Intervention Name", "Type", "County", "Beneficiary", "Documents"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}


function unique<T>(arr: (T | undefined | null)[]): T[] {
  return [...new Set(arr.filter(Boolean) as T[])].sort() as T[];
}

export default function AllInterventionsPage() {
  const router = useRouter();
  const { user, isLoaded } = useGlobalUser();

  const [allProposals, setAllProposals] = useState<SubmittedProposal[]>([]);
  const [loading, setLoading] = useState(true);

const [filters, setFilters] = useState<FilterState>({
    search: "",
    county: "all",
    interventionType: "all",
    package_name: "all",
    phase_name: "all",
    fromDate: "",
    toDate: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSubmittedProposals();
      setAllProposals(response.results ?? []);
    } catch {
      toast.error("Failed to load interventions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    } else if (isLoaded && !user) {
      toast.error("Please log in to view interventions");
      router.push("/auth/login");
    }
  }, [isLoaded, user, fetchData, router]);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);


  const counties = useMemo(
    () => unique(allProposals.map((p) => p.county)),
    [allProposals]
  );

  const interventionTypes = useMemo(
    () => unique(allProposals.map((p) => p.intervention_type)),
    [allProposals]
  );
  const packages = useMemo(
    () => unique(allProposals.map((p) => p.package_name)),
    [allProposals]
  );

  const phases = useMemo(
    () => unique(allProposals.map((p) => p.phase_name)),
    [allProposals]
  );

  const filteredProposals = useMemo(() => {
    let result = allProposals;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.intervention_name?.toLowerCase().includes(q) ||
          p.reference_number?.toLowerCase().includes(q) ||
          p.beneficiary?.toLowerCase().includes(q) ||
          p.intervention_type?.toLowerCase().includes(q)
      );
    }

    if (filters.county !== "all") {
      result = result.filter((p) => p.county === filters.county);
    }

    if (filters.interventionType !== "all") {
      result = result.filter((p) => p.intervention_type === filters.interventionType);
    }

    if (filters.fromDate) {
      result = result.filter(
        (p) => new Date(p.date) >= new Date(filters.fromDate)
      );
    }
    if (filters.package_name !== "all") {
      result = result.filter((p) =>
        filters.package_name === "__none__" ? !p.package_name : p.package_name === filters.package_name
      );
    }

    if (filters.phase_name !== "all") {
      result = result.filter((p) =>
        filters.phase_name === "__none__" ? !p.phase_name : p.phase_name === filters.phase_name
      );
    }

    if (filters.toDate) {
      result = result.filter(
        (p) => new Date(p.date) <= new Date(filters.toDate)
      );
    }

    return result;
  }, [allProposals, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProposals.length / pageSize));
  const paginatedProposals = filteredProposals.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="space-y-6 p-2 w-full">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: "#27aae118", border: "1px solid #27aae130" }}
          >
            <Layers className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              All Interventions
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse and filter all submitted intervention proposals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <ExportButton proposals={filteredProposals} />

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#27aae1] hover:text-[#27aae1] transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

<InterventionFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        interventionTypes={interventionTypes}
        packages={packages}
        phases={phases}
        totalResults={filteredProposals.length}
        totalAll={allProposals.length}
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <InterventionsTable
          proposals={paginatedProposals}
          page={page}
          pageSize={pageSize}
        />
      )}

      {!loading && (
        <InterventionPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredProposals.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}