import React from "react";

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-black border-b-2 border-black pb-2 mb-4">
      {children}
    </h2>
  );
}


export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-black mb-3">{children}</h3>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="border-l-4 border-red-600 bg-red-50 p-4 mb-6">
      <p className="text-base font-bold text-red-700">There is a problem</p>
      <p className="text-base text-red-700 mt-1">{message}</p>
    </div>
  );
}


export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 py-10 text-black">
      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <span className="text-base">Loading report…</span>
    </div>
  );
}


interface ReviewerFilterProps {
  reviewers: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
}

export function ReviewerFilter({ reviewers, selected, onChange }: ReviewerFilterProps) {
  return (
    <div className="mb-6">
      <label htmlFor="reviewer-select" className="block text-base font-bold text-black mb-1">
        Filter by reviewer
      </label>
      <select
        id="reviewer-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-black bg-white text-black text-base px-3 py-2 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-black"
      >
        {reviewers.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface GovTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string;
  caption?: string;
}

export function GovTable<T>({ columns, rows, keyFn, caption }: GovTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-base">
        {caption && (
          <caption className="text-left text-base font-bold text-black mb-2 caption-top">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b-2 border-black">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`text-left font-bold text-black py-2 pr-4 whitespace-nowrap ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyFn(row)} className="border-b border-gray-300">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`py-2 pr-4 text-black align-top ${col.className ?? ""}`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-black text-white text-sm font-bold px-2 py-0.5">
      {children}
    </span>
  );
}