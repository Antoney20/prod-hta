"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import Navbar from "@/app/components/layouts/navbar";
import { withProposals, WithProposalsInjectedProps } from "./hoc";
import { defaultFilters, FilterState, InterventionFilters } from "./cc/filters";
import { TAB_HERO_CONFIG, GUIDANCE_TABS, TabId } from "./cc/config";
import { InterventionsTable } from "./cc/table";
import PublicStatusPage from "./status/page";

function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="border-b-2  p-2 border-t-2 border-gray-900">
      <nav
        className="flex gap-3"
        role="tablist"
        aria-label="Interventions sections"
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
              className={`relative px-5 py-3   text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d70b8] ${
                isActive
                  ? "bg-[#1d70b8]  text-white"
                  : "text-black  bg-gray-200 hover:bg-[#e8f0fb]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
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
    <div className="bg-white mt-8 py-6 lg:h-55  h-75 border-gray-200 ">
      <div className="container mx-auto px-4 py-8 ">
        {config.badge && (
          <p className="text-xs font-bold text-[#1d70b8] uppercase tracking-widest mb-2">
            {config.badge}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight leading-tight mb-3 text-gray-900">
          {config.title}
        </h1>
        <p className="text-base text-gray-700  leading-relaxed line-clamp-5">
          {config.description}
        </p>

        {stats && stats.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-6 pt-4 border-t border-gray-200">
            {stats.map((s) => (
              <div key={s.label}>
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero activeTab={activeTab} stats={heroStats} />

      <div className="container mx-auto px-3 py-8 mt-6">
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-2 py-8">
        {activeTab === "interventions" && (
          <>

            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-2 border-gray-900 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
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
                <aside className="relative ml-auto w-80 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between px-4 py-4 border-b-2 border-gray-900">
                    <h2 className="font-bold text-gray-900">Filters</h2>
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 flex-1">
                    <InterventionFilters
                      filters={filters}
                      typeCounts={typeCounts}
                      onChange={handleFilterChange}
                    />
                  </div>
                </aside>
              </div>
            )}

            {/* Desktop: sidebar + table */}
            <div className="flex gap-8 items-start">
              <aside
                className="hidden lg:block shrink-0 sticky top-6"
                style={{ width: "25%" }}
              >
                <InterventionFilters
                  filters={filters}
                  typeCounts={typeCounts}
                  onChange={handleFilterChange}
                />
              </aside>

              <div className="flex-1 min-w-0">
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