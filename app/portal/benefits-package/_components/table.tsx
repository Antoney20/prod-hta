"use client";

import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  asDecision, evidenceHref, nameOf, pkgOf, refOf, str,
  DECISION_ACCENT, type Proposal,
} from "../_lib/proposal";

interface Props {
  rows: Proposal[];              // already filtered
  page: number;
  perPage: number;
  onPage: (n: number) => void;
  showPackage: boolean;
  onOpen: (p: Proposal) => void;
}

export function ProposalsTable({ rows, page, perPage, onPage, showPackage, onOpen }: Props) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  if (!total) {
    return <div className="rounded-lg border border-dashed py-20 text-center text-sm text-muted-foreground">No proposals match.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
              <th className="w-10 border-b px-3 py-3 text-left font-medium">#</th>
              <th className="border-b px-3 py-3 text-left font-medium">Reference</th>
              <th className="border-b px-3 py-3 text-left font-medium">Name</th>
              {showPackage && <th className="border-b px-3 py-3 text-left font-medium">Package</th>}
              <th className="w-36 border-b px-3 py-3 text-right font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((p, i) => {
              const d = asDecision(p.decision);
              const href = evidenceHref(p);
              return (
                <tr key={p._key} onClick={() => onOpen(p)}
                  className={`cursor-pointer border-l-2 transition-colors hover:bg-[#27aae1]/5 ${DECISION_ACCENT[d]}`}>
                  <td className="border-b px-3 py-3 text-slate-400">{start + i + 1}</td>
                  <td className="border-b px-3 py-3">
                    <span className="rounded bg-[#27aae1]/10 px-2 py-1 font-mono text-[11px] text-[#27aae1]">
                      {refOf(p) || "—"}
                    </span>
                  </td>
                  <td className="border-b px-3 py-3">
                    <span className="line-clamp-1 font-medium text-slate-800">{nameOf(p)}</span>
                    {str(p.service) ? <span className="mt-0.5 block text-[11px] text-slate-400">{str(p.service)}</span> : null}
                  </td>
                  {showPackage && (
                    <td className="border-b px-3 py-3">
                      {str(p.package)
                        ? <span className="text-slate-600">{pkgOf(p)}</span>
                        : <span className="italic text-slate-400">Unassigned</span>}
                    </td>
                  )}
                  <td className="border-b px-3 py-3 text-right">
                    {href ? (
                      <a href={href} onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-md border border-[#27aae1]/30 bg-[#27aae1]/5 px-2 py-1 text-[11px] font-medium text-[#1d70b8] hover:bg-[#27aae1]/10">
                        <FileSearch className="h-3.5 w-3.5" />View evidence
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-300">No evidence</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-slate-50/60 px-3 py-2 text-xs text-slate-500">
        <span>{total} proposal{total !== 1 ? "s" : ""} · showing {slice.length}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPage(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-1">{page}/{pages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPage(page + 1)} disabled={page >= pages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}