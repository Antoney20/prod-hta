"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PublicProposal } from "@/types/new/public";
import { Pagination } from "./pagination";
import { FilterState } from "./filters";

interface InterventionsTableProps {
  proposals: PublicProposal[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

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

function getYear(dateStr: string): string {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return "Unknown";
  }
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 py-4 px-4 flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-28 h-4 bg-gray-200 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center border border-dashed border-gray-300">
      <p className="text-gray-600 font-semibold">No interventions match your filters.</p>
      <p className="text-sm text-gray-400 mt-1">
        Try adjusting or clearing your search criteria.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4">
      <p className="text-red-800 font-bold text-sm">Failed to load data</p>
      <p className="text-red-700 text-sm mt-1">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none"
      >
        Try again
      </button>
    </div>
  );
}

function InterventionRow({ proposal: p }: { proposal: PublicProposal }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-[#f8f8f8] transition-colors group">
      <td className="py-4 px-4 align-top">
        <Link
          href={`/interventions/${p.reference_number}`}
          className="text-[#1d70b8] underline hover:text-[#003078] font-medium text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-[#1d70b8] line-clamp-3"
        >
          {p.intervention_name ?? "—"}
        </Link>
        <div className="mt-1 space-y-0.5 md:hidden">
          <span className="block text-xs text-gray-500 font-mono">
            {p.reference_number}
          </span>
          {p.intervention_type && (
            <span className="inline-block bg-blue-50 text-[#1d70b8] text-xs px-2 py-0.5 border border-blue-200">
              {p.intervention_type}
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-4 align-top hidden md:table-cell">
        <span className="text-sm text-gray-700 font-mono tracking-tight">
          {p.reference_number}
        </span>
      </td>

      <td className="py-4 px-4 align-top hidden xl:table-cell">
        <span className="text-sm text-gray-600 line-clamp-2 max-w-xs">
          {p.beneficiary ?? "—"}
        </span>
      </td>

      <td className="py-4 px-4 align-top whitespace-nowrap">
        <span className="text-sm text-gray-700">{formatDate(p.date)}</span>
      </td>
    </tr>
  );
}

export function InterventionsTable({
  proposals,
  filters,
  isLoading,
  error,
  refetch,
  currentPage,
  onPageChange,
}: InterventionsTableProps) {
  const filtered = useMemo(() => {
    let data = [...proposals];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (p) =>
          p.intervention_name?.toLowerCase().includes(q) ||
          p.reference_number?.toLowerCase().includes(q) ||
          p.beneficiary?.toLowerCase().includes(q) ||
          p.intervention_type?.toLowerCase().includes(q)
      );
    }

    if (filters.fromDate) {
      data = data.filter((p) => p.date >= filters.fromDate);
    }
    if (filters.toDate) {
      data = data.filter((p) => p.date <= filters.toDate);
    }
    if (filters.interventionTypes.length > 0) {
      data = data.filter((p) =>
        filters.interventionTypes.includes(p.intervention_type ?? "")
      );
    }

    switch (filters.sortOrder) {
      case "a-z":
        data.sort((a, b) =>
          (a.intervention_name ?? "").localeCompare(b.intervention_name ?? "")
        );
        break;
      case "z-a":
        data.sort((a, b) =>
          (b.intervention_name ?? "").localeCompare(a.intervention_name ?? "")
        );
        break;
      case "date-asc":
        data.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "date-desc":
      default:
        data.sort((a, b) => b.date.localeCompare(a.date));
    }

    return data;
  }, [proposals, filters]);

  const total = filtered.length;
  const { pageSize } = filters;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const grouped = useMemo(() => {
    if (!filters.groupByYear) return null;
    const map: Record<string, PublicProposal[]> = {};
    for (const p of paginated) {
      const yr = getYear(p.date);
      if (!map[yr]) map[yr] = [];
      map[yr].push(p);
    }
    return map;
  }, [paginated, filters.groupByYear]);

  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (total === 0) return <EmptyState />;

  const TableHead = () => (
    <thead>
      <tr className="border-b-2 border-gray-900 bg-white">
        <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">
          Title
        </th>
        <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 hidden md:table-cell whitespace-nowrap">
          Reference number
        </th>
        <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 hidden xl:table-cell">
          Beneficiary
        </th>
        <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
          Date submitted
        </th>
      </tr>
    </thead>
  );

  const renderTable = (rows: PublicProposal[]) => (
    <div className="overflow-x-auto border border-gray-300">
      <table className="w-full min-w-[600px]">
        <TableHead />
        <tbody>
          {rows.map((p) => (
            <InterventionRow key={p.id} proposal={p} />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Showing{" "}
        <strong>
          {((currentPage - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(currentPage * pageSize, total).toLocaleString()}
        </strong>{" "}
        of <strong>{total.toLocaleString()}</strong> interventions
      </p>
      {grouped
        ? Object.entries(grouped)
            .sort(([a], [b]) =>
              filters.sortOrder === "date-asc"
                ? a.localeCompare(b)
                : b.localeCompare(a)
            )
            .map(([year, items]) => (
              <div key={year} className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 bg-[#f3f2f1] border border-gray-300 px-4 py-2 mb-0 border-b-0">
                  {year}
                </h3>
                {renderTable(items)}
              </div>
            ))
        : renderTable(paginated)}

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}