"use client";

import { useMemo } from "react";
import type { InterventionFeedbackStatus } from "@/types/new/feedback";
import { Chip } from "./Chip";

interface InterventionTableProps {
  interventions: InterventionFeedbackStatus[];
  selected:      Set<string>;
  // filters — owned by parent
  search:        string;
  dateFrom:      string;
  dateTo:        string;
  categoryFilter: string;
  decisionFilter: string;
  allCategories:  string[];   // unique system-category names for the filter
  allDecisions:   string[];   // unique decision names
  onSearch:       (v: string) => void;
  onDateFrom:     (v: string) => void;
  onDateTo:       (v: string) => void;
  onCategoryFilter: (v: string) => void;
  onDecisionFilter: (v: string) => void;
  onResetFilters: () => void;
  onToggle:       (id: string) => void;
  onToggleAll:    (ids: string[]) => void;
  onSendOne:      (iv: InterventionFeedbackStatus) => void;
  onExportCsv:    () => void;
}

export function InterventionTable({
  interventions, selected,
  search, dateFrom, dateTo, categoryFilter, decisionFilter,
  allCategories, allDecisions,
  onSearch, onDateFrom, onDateTo, onCategoryFilter, onDecisionFilter,
  onResetFilters, onToggle, onToggleAll, onSendOne, onExportCsv,
}: InterventionTableProps) {
  const allIds      = interventions.map(i => i.intervention_id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const hasFilters  = search || dateFrom || dateTo || categoryFilter || decisionFilter;

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-3 flex flex-col gap-3">

        {/* Row 1: search + export */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Search
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => onSearch(e.target.value)}
                placeholder="Name or reference number…"
                className="w-full h-8 pl-7 pr-3 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-[#27aae1] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 items-end ml-auto">
            {hasFilters && (
              <button
                onClick={onResetFilters}
                className="h-8 px-3 text-xs border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={onExportCsv}
              className="h-8 px-3 text-xs font-medium border border-[#27aae1] text-[#27aae1] rounded-md hover:bg-sky-50 transition-colors flex items-center gap-1.5"
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Row 2: date + category + decision */}
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              From Date
            </label>
            <input
              type="date" value={dateFrom}
              onChange={e => onDateFrom(e.target.value)}
              className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-[#27aae1] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              To Date
            </label>
            <input
              type="date" value={dateTo}
              onChange={e => onDateTo(e.target.value)}
              className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-[#27aae1] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => onCategoryFilter(e.target.value)}
              className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none min-w-[150px] focus:border-[#27aae1] transition-colors"
            >
              <option value="">All categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Decision
            </label>
            <select
              value={decisionFilter}
              onChange={e => onDecisionFilter(e.target.value)}
              className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none min-w-[130px] focus:border-[#27aae1] transition-colors"
            >
              <option value="">All decisions</option>
              <option value="__none__">No decision</option>
              {allDecisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {interventions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No interventions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => onToggleAll(allSelected ? [] : allIds)}
                      className="accent-[#27aae1]"
                    />
                  </th>
                  {["Intervention", "Ref", "System Category", "Submitted", "Decision", "Emails Sent", ""].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interventions.map(iv => (
                  <tr
                    key={iv.intervention_id}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(iv.intervention_id) ? "bg-sky-50/60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(iv.intervention_id)}
                        onChange={() => onToggle(iv.intervention_id)}
                        className="accent-[#27aae1]"
                      />
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-medium text-gray-900 truncate text-sm">{iv.intervention_name}</p>
                      <p className="text-xs text-gray-400 truncate">{iv.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{iv.reference_number}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {iv.system_categories.length > 0
                        ? <p className="text-xs text-gray-600 line-clamp-2 leading-snug">{iv.system_categories.join(", ")}</p>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {iv.submitted_at ? new Date(iv.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {iv.decision
                        ? <Chip label={iv.decision} variant="green" />
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {iv.has_feedback_sent
                        ? <span className="font-semibold text-[#27aae1]">{iv.feedback_sent_count}</span>
                        : <span className="text-gray-300">0</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSendOne(iv)}
                        className="px-3 py-1 text-xs font-medium border border-[#27aae1] text-[#27aae1] rounded-md hover:bg-sky-50 transition-colors"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}