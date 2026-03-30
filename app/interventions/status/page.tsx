"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Pagination } from "@/app/interventions/cc/pagination";
import { TopicPriority } from "@/types/new/topic-prioritization";
import { getTopicPriorities } from "@/app/api/new/tp";
import Navbar from "@/app/components/layouts/navbar";
import Link from "next/link";

function formatDate(str: string | null): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Decision / status resolution rules:
 *
 * 1. If decision exists AND its name (lowercased) === "discussed"
 *    → treat as "Under review" (same as scored-no-decision)
 *
 * 2. If scored AND decision exists AND decision name !== "discussed"
 *    → show the decision name (override under-review)
 *
 * 3. If NOT scored AND decision exists AND name !== "discussed"
 *    → show the decision name
 *
 * 4. If scored AND no decision (or decision is "discussed")
 *    → "Under review"
 *
 * 5. Otherwise → "Pending"
 */
function resolveStatus(row: TopicPriority): {
  label: string;
  variant: "decision" | "under-review" | "pending";
} {
  const decisionName = row.decision?.name ?? null;
  const isDiscussed =
    decisionName !== null && decisionName.toLowerCase() === "discussed";

  // Real decision (not discussed)
  if (decisionName && !isDiscussed) {
    return { label: decisionName, variant: "decision" };
  }

  // Scored, or has a "discussed" decision → under review
  if (row.is_scored || isDiscussed) {
    return { label: "Under review", variant: "under-review" };
  }

  return { label: "Pending", variant: "pending" };
}

function DecisionTag({ row }: { row: TopicPriority }) {
  const { label, variant } = resolveStatus(row);

  if (variant === "decision") {
    return (
      <strong className="inline-block bg-[#27aae1] text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide whitespace-nowrap">
        {label}
      </strong>
    );
  }
  if (variant === "under-review") {
    return (
      <strong className="inline-block bg-[#00703c] text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide whitespace-nowrap">
        {label}
      </strong>
    );
  }
  return (
    <strong className="inline-block bg-[#505a5f] text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide whitespace-nowrap">
      {label}
    </strong>
  );
}

/**
 * Feedback cell — "See more / See less" only appears when the text
 * genuinely overflows 2 lines (measured via scrollHeight vs clientHeight).
 */
function FeedbackCell({
  feedback,
  expanded,
  onToggle,
}: {
  feedback: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const clampRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = clampRef.current;
    if (!el) return;
    // Temporarily unconstrain to measure true height
    el.style.webkitLineClamp = "unset";
    el.style.display = "block";
    const full = el.scrollHeight;
    el.style.webkitLineClamp = "2";
    el.style.display = "-webkit-box";
    const clamped = el.clientHeight;
    setOverflows(full > clamped + 2); // +2px tolerance
  }, [feedback]);

  if (!feedback) {
    return <span className="text-xs text-gray-400 italic">No feedback yet</span>;
  }

  return (
    <div>
      <p
        ref={clampRef}
        className="text-sm text-gray-700 leading-relaxed"
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {feedback}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-xs text-[#1d70b8] underline hover:text-[#003078] focus:outline-none focus:ring-1 focus:ring-[#1d70b8]"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function StatusRow({
  row,
  index,
  expandedId,
  onToggle,
}: {
  row: TopicPriority;
  index: number;
  expandedId: string | null;
  onToggle: (key: string) => void;
}) {
  const key = row.id ?? row.reference_number;
  const expanded = expandedId === key;
  const feedback = stripHtml(row.feedback ?? "");

  return (
    <tr className="border-b border-gray-200 hover:bg-[#f8f8f8] transition-colors align-top">
      <td className="py-4 px-4 text-xs text-gray-400 font-mono whitespace-nowrap">
        {index + 1}
      </td>

      <td className="py-4 px-4 min-w-[150px]">
        <Link href={`/interventions/${row.reference_number}`}>
          <p className="text-sm text-[#1d70b8] underline hover:text-[#003078] font-medium leading-snug line-clamp-2">
            {row.intervention_name}
          </p>
          <p className="text-xs font-mono text-[#1d70b8] underline hover:text-[#003078] mt-0.5 whitespace-nowrap">
            {row.reference_number}
          </p>
        </Link>
      </td>

      <td className="py-4 px-4 min-w-[350px]" style={{ maxWidth: 500 }}>
        {row.system_categories.length === 0 ? (
          <span className="text-xs text-gray-400 italic">—</span>
        ) : (
          <p className="text-sm text-gray-700 leading-snug line-clamp-2">
            {row.system_categories.join(", ")}
          </p>
        )}
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <DecisionTag row={row} />
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {(row.decision || row.is_scored) ? "—" : formatDate(row.decision_date)}
        </span>
      </td>

      <td className="py-4 px-4 min-w-[350px]" style={{ maxWidth: 500 }}>
        <FeedbackCell
          feedback={feedback}
          expanded={expanded}
          onToggle={() => onToggle(key!)}
        />
      </td>
    </tr>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse border border-gray-300">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 px-4 py-5 flex gap-4">
          <div className="w-6 h-4 bg-gray-200 rounded shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="w-24 h-4 bg-gray-200 rounded hidden md:block" />
          <div className="w-32 h-4 bg-gray-200 rounded hidden lg:block" />
        </div>
      ))}
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

type SortOrder = "az" | "za" | "date-desc" | "date-asc";

interface FilterState {
  search: string;
  sort: SortOrder;
  categories: string[];
  decisions: string[];
}

const defaultFilters: FilterState = {
  search: "",
  sort: "date-desc",
  categories: [],
  decisions: [],
};

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-300 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-[#f3f2f1] border-b border-gray-300 px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d70b8]"
      >
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-150 ${open ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

const CAT_PAGE_SIZE = 10;

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  categoryCounts: Record<string, number>;
  decisionOptions: { label: string; value: string }[];
}

function SidebarFilters({
  filters,
  onChange,
  categoryCounts,
  decisionOptions,
}: SidebarFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [catPage, setCatPage] = useState(1);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const applySearch = () => onChange({ ...filters, search: localSearch });

  const toggleCategory = (name: string) => {
    const next = filters.categories.includes(name)
      ? filters.categories.filter((c) => c !== name)
      : [...filters.categories, name];
    onChange({ ...filters, categories: next });
  };

  const toggleDecision = (val: string) => {
    const next = filters.decisions.includes(val)
      ? filters.decisions.filter((d) => d !== val)
      : [...filters.decisions, val];
    onChange({ ...filters, decisions: next });
  };

  const activeCount =
    (filters.search ? 1 : 0) +
    filters.categories.length +
    filters.decisions.length +
    (filters.sort !== "date-desc" ? 1 : 0);

  const clearAll = () => {
    setLocalSearch("");
    setCatPage(1);
    onChange(defaultFilters);
  };

  const allCategories = Object.entries(categoryCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const catTotalPages = Math.max(1, Math.ceil(allCategories.length / CAT_PAGE_SIZE));
  const catSlice = allCategories.slice(
    (catPage - 1) * CAT_PAGE_SIZE,
    catPage * CAT_PAGE_SIZE
  );

  return (
    <nav aria-label="Filter results">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Filter</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0">
        <FilterSection title="Keyword or reference number">
          <div className="px-4 py-3 space-y-2">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="E.g. 'malaria'"
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            />
            <button
              type="button"
              onClick={applySearch}
              className="bg-[#00703c] hover:bg-[#005a30] text-white text-sm font-semibold py-2 px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00703c]"
            >
              Apply filter
            </button>
          </div>
        </FilterSection>

        {allCategories.length > 0 && (
          <FilterSection title="System category">
            <div>
              {catSlice.map(([name, count]) => {
                const checked = filters.categories.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-[#f3f2f1] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(name)}
                      className="w-4 h-4 accent-[#1d70b8] flex-shrink-0"
                    />
                    <span className="text-sm text-gray-800 flex-1 leading-snug">
                      {name}
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums">
                      ({count})
                    </span>
                  </label>
                );
              })}

              {catTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-[#f9f9f9]">
                  <button
                    type="button"
                    onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                    disabled={catPage === 1}
                    className="text-xs text-[#1d70b8] underline disabled:opacity-40 disabled:cursor-not-allowed hover:text-[#003078] focus:outline-none"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    {catPage} / {catTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCatPage((p) => Math.min(catTotalPages, p + 1))
                    }
                    disabled={catPage === catTotalPages}
                    className="text-xs text-[#1d70b8] underline disabled:opacity-40 disabled:cursor-not-allowed hover:text-[#003078] focus:outline-none"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </FilterSection>
        )}

        {decisionOptions.length > 0 && (
          <FilterSection title="Decision / Status">
            <div>
              {decisionOptions.map(({ label, value }) => {
                const checked = filters.decisions.includes(value);
                return (
                  <label
                    key={value}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-[#f3f2f1] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDecision(value)}
                      className="w-4 h-4 accent-[#1d70b8] flex-shrink-0"
                    />
                    <span className="text-sm text-gray-800 flex-1">{label}</span>
                  </label>
                );
              })}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Sort &amp; display">
          <div className="px-4 py-3">
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Sort by
            </label>
            <select
              value={filters.sort}
              onChange={(e) =>
                onChange({ ...filters, sort: e.target.value as SortOrder })
              }
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            >
              <option value="date-desc">Decision date (newest first)</option>
              <option value="date-asc">Decision date (oldest first)</option>
              <option value="az">Name (A–Z)</option>
              <option value="za">Name (Z–A)</option>
            </select>
          </div>
        </FilterSection>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-1.5 text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          Back to top
        </button>
      </div>
    </nav>
  );
}

const PAGE_SIZE = 25;

/**
 * Helper — returns the "canonical" filter key for a row, matching the keys
 * used when building decisionOptions.
 */
function getFilterKey(row: TopicPriority): string {
  const { variant } = resolveStatus(row);
  if (variant === "under-review") return "_under_review";
  if (variant === "pending") return "_pending";
  // real decision
  return row.decision!.id;
}

export default function PublicStatusPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [records, setRecords] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicPriorities();
      setRecords(data.filter((r) => r.decision !== null || r.is_scored));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [filters]);

  const handleToggle = useCallback((key: string) => {
    setExpandedId((prev) => (prev === key ? null : key));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of records) {
      for (const sc of r.system_categories) {
        counts[sc] = (counts[sc] ?? 0) + 1;
      }
    }
    return counts;
  }, [records]);

  /**
   * Build filter options:
   * - One entry per distinct real decision (excluding "discussed")
   * - One "Under review" entry covering: is_scored OR decision === "discussed"
   * - One "Pending" entry covering: not scored, no decision (should rarely appear
   *   given the load filter, but kept for completeness)
   */
  const decisionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    let hasUnderReview = false;
    let hasPending = false;

    for (const r of records) {
      const { variant } = resolveStatus(r);
      if (variant === "decision") {
        seen.set(r.decision!.id, r.decision!.name);
      } else if (variant === "under-review") {
        hasUnderReview = true;
      } else {
        hasPending = true;
      }
    }

    const opts = Array.from(seen.entries()).map(([value, label]) => ({
      value,
      label,
    }));
    if (hasUnderReview) opts.push({ value: "_under_review", label: "Under review" });
    if (hasPending) opts.push({ value: "_pending", label: "Pending" });
    return opts;
  }, [records]);

  const filtered = useMemo(() => {
    let data = [...records];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (r) =>
          r.intervention_name.toLowerCase().includes(q) ||
          r.reference_number.toLowerCase().includes(q) ||
          r.system_categories.some((sc) => sc.toLowerCase().includes(q))
      );
    }

    if (filters.categories.length > 0) {
      data = data.filter((r) =>
        r.system_categories.some((sc) => filters.categories.includes(sc))
      );
    }

    if (filters.decisions.length > 0) {
      data = data.filter((r) =>
        filters.decisions.includes(getFilterKey(r))
      );
    }

    switch (filters.sort) {
      case "az":
        data.sort((a, b) =>
          a.intervention_name.localeCompare(b.intervention_name)
        );
        break;
      case "za":
        data.sort((a, b) =>
          b.intervention_name.localeCompare(a.intervention_name)
        );
        break;
      case "date-asc":
        data.sort((a, b) =>
          (a.decision_date ?? "").localeCompare(b.decision_date ?? "")
        );
        break;
      case "date-desc":
      default:
        data.sort((a, b) =>
          (b.decision_date ?? "").localeCompare(a.decision_date ?? "")
        );
    }
    return data;
  }, [records, filters]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats use resolveStatus so they reflect the same logic
  const withDecision = records.filter(
    (r) => resolveStatus(r).variant === "decision"
  ).length;
  const underReview = records.filter(
    (r) => resolveStatus(r).variant === "under-review"
  ).length;

  const filterProps: SidebarFiltersProps = {
    filters,
    onChange: setFilters,
    categoryCounts,
    decisionOptions,
  };

  const content = (
    <>
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
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

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative ml-auto w-80 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b-2 border-gray-900">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
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
              <SidebarFilters {...filterProps} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block shrink-0 sticky top-6"
          style={{ width: "25%" }}
        >
          <SidebarFilters {...filterProps} />
        </aside>

        {/* Table */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4">
              <p className="text-red-800 font-bold text-sm">Failed to load data</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={load}
                className="mt-3 text-sm text-[#1d70b8] underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-300">
              <p className="text-gray-600 font-semibold">No results found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Showing{" "}
                <strong>
                  {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–
                  {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString()}
                </strong>{" "}
                of <strong>{filtered.length.toLocaleString()}</strong>{" "}
                interventions
                {filters.search && (
                  <span className="text-gray-400">
                    {" "}
                    matching &ldquo;{filters.search}&rdquo;
                  </span>
                )}
              </p>

              <div className="overflow-x-auto border border-gray-300">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-white">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 w-10">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 w-[200px]">
                        Intervention
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 w-[220px]">
                        System Category
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                        Decision
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                        Decision Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 w-[300px]">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, idx) => (
                      <StatusRow
                        key={row.id ?? row.reference_number}
                        row={row}
                        index={(page - 1) * PAGE_SIZE + idx}
                        expandedId={expandedId}
                        onToggle={handleToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  setPage(p);
                  setExpandedId(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );

  if (!embedded) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white mt-8">
          <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto py-8">
              <h1 className="text-3xl tracking-tight leading-tight mb-3">
                Intervention Review Status
              </h1>
              <p className="text-base text-gray-800 max-w-4xl">
                This page shows the current review status for all health
                technology interventions submitted to BPTAP. Decisions and
                feedback are published here once the review process has
                concluded or a formal recommendation has been made.
              </p>
              {!loading && !error && (
                <div className="mt-5 flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                  <Stat label="With a formal decision" value={withDecision} />
                  <Stat label="Under review" value={underReview} />
                  <Stat label="Total published" value={records.length} />
                </div>
              )}
            </div>
          </div>
          <div className="container mx-auto py-8">{content}</div>
        </div>
      </>
    );
  }

  return <div>{content}</div>;
}