"use client";

import { useMemo, useCallback } from "react";

export interface FilterState {
  search: string;
  fromDate: string;
  toDate: string;
  interventionTypes: string[];
  sortOrder: "a-z" | "z-a" | "date-asc" | "date-desc";
  groupByYear: boolean;
  pageSize: number;
}

export const defaultFilters: FilterState = {
  search: "",
  fromDate: "",
  toDate: "",
  interventionTypes: [],
  sortOrder: "date-desc",
  groupByYear: false,
  pageSize: 10,
};

interface InterventionFiltersProps {
  filters: FilterState;
  typeCounts: Record<string, number>;
  onChange: (filters: FilterState) => void;
}

export function InterventionFilters({
  filters,
  typeCounts,
  onChange,
}: InterventionFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onChange({ ...filters, search: value });
    },
    [filters, onChange]
  );

  const handleTypeToggle = useCallback(
    (type: string) => {
      const next = filters.interventionTypes.includes(type)
        ? filters.interventionTypes.filter((t) => t !== type)
        : [...filters.interventionTypes, type];
      onChange({ ...filters, interventionTypes: next });
    },
    [filters, onChange]
  );

  const handleFromDateChange = useCallback(
    (value: string) => {
      onChange({ ...filters, fromDate: value });
    },
    [filters, onChange]
  );

  const handleToDateChange = useCallback(
    (value: string) => {
      onChange({ ...filters, toDate: value });
    },
    [filters, onChange]
  );

  const handleSortChange = useCallback(
    (value: FilterState["sortOrder"]) => {
      onChange({ ...filters, sortOrder: value });
    },
    [filters, onChange]
  );

  const handleGroupByYearToggle = useCallback(() => {
    onChange({ ...filters, groupByYear: !filters.groupByYear });
  }, [filters, onChange]);

  const handlePageSizeChange = useCallback(
    (value: number) => {
      onChange({ ...filters, pageSize: value });
    },
    [filters, onChange]
  );

  const handleClearAll = useCallback(() => {
    onChange(defaultFilters);
  }, [onChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.interventionTypes.length > 0)
      count += filters.interventionTypes.length;
    if (filters.sortOrder !== defaultFilters.sortOrder) count++;
    if (filters.groupByYear !== defaultFilters.groupByYear) count++;
    return count;
  }, [filters]);

  return (
    <nav aria-label="Filter interventions" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filter</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-[#1d70b8] underline hover:text-[#003078]"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-3">
          <label className="font-bold text-gray-900 text-sm">Search</label>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Intervention name or reference..."
            className="w-full border-2 border-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-3">
          <label className="font-bold text-gray-900 text-sm">Date range</label>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700">From</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">To</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            />
          </div>
        </div>
      </div>

      {/* Intervention Types */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="border border-gray-300 bg-white">
          <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-3">
            <label className="font-bold text-gray-900 text-sm">
              Intervention type
            </label>
          </div>
          <div>
            {Object.entries(typeCounts).map(([type, count]) => {
              const checked = filters.interventionTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-[#f3f2f1]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 accent-[#1d70b8]"
                  />
                  <span className="text-sm text-gray-800 flex-1">{type}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort & Display */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-3">
          <label className="font-bold text-gray-900 text-sm">
            Sort &amp; display
          </label>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Sort by
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                handleSortChange(
                  e.target.value as FilterState["sortOrder"]
                )
              }
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            >
              <option value="date-desc">Date (newest first)</option>
              <option value="date-asc">Date (oldest first)</option>
              <option value="a-z">Name (A–Z)</option>
              <option value="z-a">Name (Z–A)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.groupByYear}
              onChange={handleGroupByYearToggle}
              className="w-4 h-4 accent-[#1d70b8]"
            />
            <span className="text-sm text-gray-800">Group by year</span>
          </label>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Items per page
            </label>
            <select
              value={filters.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}