"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import Navbar from "@/app/components/layouts/navbar";
import { withProposals, WithProposalsInjectedProps } from "./hoc";
import { defaultFilters, FilterState, InterventionFilters } from "./cc/filters";
import { TAB_HERO_CONFIG, GUIDANCE_TABS, TabId } from "./cc/config";
import { InterventionsTable } from "./cc/table";
import PublicStatusPage from "./status/page";

const CONTAINER = "mx-auto w-full container px-4 sm:px-6 lg:px-8";
const ACCENT = "#1d70b8";

function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav
      role="tablist"
      aria-label="Interventions sections"
      className="flex flex-wrap border border-gray-900 divide-x divide-gray-900"
    >
      {GUIDANCE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(tab.id as TabId)}
            className={`px-5 py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d70b8] ${
              isActive
                ? "bg-[#1d70b8] text-white"
                : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

interface HeroStat {
  label: string;
  value: number;
}

function Hero({
  activeTab,
  stats,
}: {
  activeTab: TabId;
  stats?: HeroStat[];
}) {
  const config = TAB_HERO_CONFIG[activeTab];

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className={`${CONTAINER} py-16 sm:py-14`}>
        <div className="max-w-5xl   mt-8">
          {/* {config.badge && (
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8" style={{ backgroundColor: ACCENT }} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
                {config.badge}
              </span>
            </div>
          )} */}

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
            {config.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-gray-700">
            {config.description}
          </p>

          {stats && stats.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-200 pt-5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline">
                  <span className="text-xl font-extrabold text-gray-900">
                    {s.value.toLocaleString()}
                  </span>
                  <span className="ml-1.5 text-sm text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InterventionsPageInner({
  proposals,
  isLoading,
  error,
  refetch,
}: WithProposalsInjectedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = (searchParams.get("tab") as TabId) ?? "interventions";
  const validTab = GUIDANCE_TABS.some((t) => t.id === tabFromUrl)
    ? tabFromUrl
    : "interventions";

  const [activeTab, setActiveTab] = useState<TabId>(validTab);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setActiveTab(validTab);
    setCurrentPage(1);
  }, [validTab]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      setCurrentPage(1);
      setFilters(defaultFilters);

      const params = new URLSearchParams(searchParams.toString());
      if (tab === "interventions") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }

      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleFilterChange = useCallback((next: FilterState) => {
    setFilters(next);
    setCurrentPage(1);
  }, []);

  const heroStats = useMemo((): HeroStat[] | undefined => {
    const cfg = TAB_HERO_CONFIG[activeTab];
    if (!cfg.statsKey) return undefined;
    return undefined;
  }, [activeTab, proposals.length]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of proposals) {
      if (p.intervention_type) {
        counts[p.intervention_type] = (counts[p.intervention_type] ?? 0) + 1;
      }
    }
    return counts;
  }, [proposals]);

  const packageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of proposals) {
      if (p.package) {
        counts[p.package] = (counts[p.package] ?? 0) + 1;
      }
    }
    return counts;
  }, [proposals]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of proposals) {
      for (const c of p.system_categories ?? []) {
        counts[c] = (counts[c] ?? 0) + 1;
      }
    }
    return counts;
  }, [proposals]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero activeTab={activeTab} stats={heroStats} />

      {/* Tabs */}
      <div className={`${CONTAINER} pt-8`}>
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main content */}
      <div className={`${CONTAINER} py-8`}>
        {activeTab === "interventions" && (
          <>
            <div className="mb-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 border-2 border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                Filter results
              </button>
            </div>

            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-hidden="true"
                />
                <aside className="relative ml-auto flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b-2 border-gray-900 px-4 py-4">
                    <h2 className="font-bold text-gray-900">Filters</h2>
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
                      aria-label="Close filters"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <InterventionFilters
                      filters={filters}
                      typeCounts={typeCounts}
                      packageCounts={packageCounts}
                      categoryCounts={categoryCounts}
                      onChange={handleFilterChange}
                    />
                  </div>
                </aside>
              </div>
            )}

            {/* Desktop: sidebar + table */}
            <div className="flex items-start gap-8">
              <aside className="sticky top-8 hidden w-1/4 shrink-0 lg:block">
                <InterventionFilters
                  filters={filters}
                  typeCounts={typeCounts}
                  packageCounts={packageCounts}
                  categoryCounts={categoryCounts}
                  onChange={handleFilterChange}
                />
              </aside>

              <div className="min-w-0 flex-1">
                <InterventionsTable
                  proposals={proposals}
                  filters={filters}
                  isLoading={isLoading}
                  error={error}
                  refetch={refetch}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "system-categorisation" && <PublicStatusPage embedded />}
      </div>
    </div>
  );
}

const InterventionsPageWithData = withProposals(InterventionsPageInner);

export default InterventionsPageWithData;