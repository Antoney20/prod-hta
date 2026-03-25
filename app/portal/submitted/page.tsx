"use client";

import Navbar from "@/app/components/layouts/navbar";
import { defaultFilters,  FilterState, InterventionFilters } from "@/app/interventions/cc/filters";
import { Structure, TabId } from "@/app/interventions/cc/overview";
import { withProposals, WithProposalsInjectedProps } from "@/app/interventions/hoc";
import { useState, useMemo, useCallback } from "react";

function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative ml-auto w-80 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b-2 border-gray-900">
          <h2 className="font-bold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-1">{children}</div>
      </aside>
    </div>
  );
}


function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="text-xl font-extrabold text-gray-900">
        {value.toLocaleString()}
      </span>
      <span className="ml-1.5 text-sm text-gray-500">{label}</span>
    </div>
  );
}


function InterventionsPageInner({
  proposals,
  isLoading,
  error,
  refetch,
}: WithProposalsInjectedProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("interventions");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleFilterChange = useCallback((next: FilterState) => {
    setFilters(next);
    setCurrentPage(1);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);


  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of proposals) {
      if (p.intervention_type) {
        counts[p.intervention_type] = (counts[p.intervention_type] ?? 0) + 1;
      }
    }
    return counts;
  }, [proposals]);

  const filterSidebar = (
    <InterventionFilters
      filters={filters}
      typeCounts={typeCounts}
      onChange={handleFilterChange}
    />
  );

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-white  ">

     <div className="bg-white border-b border-gray-200 ">

  
          {!isLoading && !error && proposals.length > 0 && (
            <div className="flex flex-wrap gap-6 pt-4 py-6  border-gray-200">
              <Stat label="Total submissions" value={proposals.length} />
             
            </div>
          )}

      </div>


      <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-2 border-gray-900 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          Filter results
        </button>
      </div>

      <MobileFilterDrawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)}>
        {filterSidebar}
      </MobileFilterDrawer>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-10 items-start">
          <aside className="hidden lg:block w-72 shrink-0 sticky top-6">
            {filterSidebar}
          </aside>

          {/* Table + tabs */}
          <Structure
            proposals={proposals}
            isLoading={isLoading}
            error={error}
            refetch={refetch}
            filters={filters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
    </>
  );
}


const InterventionsPageWithData = withProposals(InterventionsPageInner);

export default function InterventionsPage() {
  return <InterventionsPageWithData />;
}