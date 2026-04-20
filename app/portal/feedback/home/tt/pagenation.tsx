const PAGE_SIZE_OPTIONS = [20, 30, 50, 100];

interface PaginationProps {
  total:      number;
  page:       number;
  pageSize:   number;
  onPage:     (p: number) => void;
  onPageSize: (s: number) => void;
}

export function Pagination({ total, page, pageSize, onPage, onPageSize }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  // window of up to 5 page buttons
  const windowStart = Math.max(1, Math.min(totalPages - 4, page - 2));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => windowStart + i);

  return (
    <div className="flex items-center justify-between px-1 py-3 flex-wrap gap-2">
      <span className="text-xs text-gray-500">
        Showing {start}–{end} of {total}
      </span>

      <div className="flex items-center gap-1.5">
        {/* Page size */}
        <select
          value={pageSize}
          onChange={e => { onPageSize(Number(e.target.value)); onPage(1); }}
          className="h-8 px-2 text-xs border border-gray-200 rounded-md bg-white text-gray-700 outline-none"
        >
          {PAGE_SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>

        {/* Prev */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-sm text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ‹
        </button>

        {/* Page buttons */}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={[
              "w-8 h-8 flex items-center justify-center border rounded-md text-xs font-medium",
              p === page
                ? "border-[#27aae1] bg-[#27aae1] text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-sm text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}