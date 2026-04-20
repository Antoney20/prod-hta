import type { FeedbackCategory, FeedbackEmailStatus, FeedbackLogFilters } from "@/types/new/feedback";

interface LogFiltersProps {
  filters:    FeedbackLogFilters;
  categories: FeedbackCategory[];
  onChange:   (f: FeedbackLogFilters) => void;
  onReset:    () => void;
}

const STATUSES: { value: FeedbackEmailStatus; label: string }[] = [
  { value: "sent",    label: "Sent"    },
  { value: "failed",  label: "Failed"  },
  { value: "sending", label: "Sending" },
  { value: "initial", label: "Initial" },
];

export function LogFilters({ filters, categories, onChange, onReset }: LogFiltersProps) {
  const set = (key: keyof FeedbackLogFilters, val: string) =>
    onChange({ ...filters, [key]: val || undefined });

  return (
    <div className="flex gap-2.5 items-center flex-wrap bg-white border border-gray-200 rounded-lg px-3.5 py-3 mb-4">

      {/* Status */}
      <select
        value={filters.status ?? ""}
        onChange={e => set("status", e.target.value)}
        className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none min-w-[130px]"
      >
        <option value="">All statuses</option>
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Category */}
      <select
        value={filters.category ?? ""}
        onChange={e => set("category", e.target.value)}
        className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none min-w-[150px]"
      >
        <option value="">All categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={filters.date_from ?? ""}
        onChange={e => set("date_from", e.target.value)}
        className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none"
      />

      {/* Date to */}
      <input
        type="date"
        value={filters.date_to ?? ""}
        onChange={e => set("date_to", e.target.value)}
        className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none"
      />

      <div className="flex-1" />

      <button
        onClick={onReset}
        className="h-8 px-3 text-xs border border-gray-200 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}