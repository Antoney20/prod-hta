"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Minus, ExternalLink, FileSearch } from "lucide-react";
import { AdminOnly } from "@/app/context/role";
import {
  asDecision, evidenceHref, isScored, labelFor, nameOf, pkgOf, phaseOf, refOf, str,
  CORE_KEYS, DECISION_STYLE, type Decision, type Proposal,
} from "../_lib/proposal";

const ICON: Record<Decision, typeof Check> = { include: Check, exclude: X, pending: Minus };

interface Props {
  proposal: Proposal | null;
  onClose: () => void;
  onDecide: (key: string, d: Decision) => void;
  onComment: (key: string, comment: string) => void;
}

export function ReviewSheet({ proposal, onClose, onDecide, onComment }: Props) {
  const [comment, setComment] = useState("");
  useEffect(() => { setComment(str(proposal?.comment)); }, [proposal?._key]); // eslint-disable-line

  if (!proposal) return null;
  const d = asDecision(proposal.decision);
  const href = evidenceHref(proposal);
  const extras = Object.keys(proposal).filter((k) => !CORE_KEYS.has(k) && str(proposal[k]));

  return (
    <Dialog open={!!proposal} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">{nameOf(proposal)}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400">{refOf(proposal) || "—"}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{pkgOf(proposal)}</span>
          {phaseOf(proposal) && <span className="rounded bg-[#27aae1]/10 px-2 py-0.5 text-[11px] capitalize text-[#1d70b8]">{phaseOf(proposal)}</span>}
          {isScored(proposal) && <span className="rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Score {str(proposal.score)}</span>}
          {href && (
            <a href={href} className="ml-auto inline-flex items-center gap-1 rounded-md border border-[#27aae1]/30 bg-[#27aae1]/5 px-2 py-0.5 text-[11px] font-medium text-[#1d70b8] hover:bg-[#27aae1]/10">
              <FileSearch className="h-3.5 w-3.5" />View evidence<ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}
        </div>

        {/* decision */}
        <AdminOnly silent>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["include", "exclude", "pending"] as Decision[]).map((opt) => {
              const on = d === opt; const I = ICON[opt];
              return (
                <button key={opt} onClick={() => onDecide(proposal._key, opt)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                    on ? DECISION_STYLE[opt] : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  <I className="h-4 w-4" />{opt}
                </button>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Panel comment</span>
            <textarea rows={2} value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={() => comment !== str(proposal.comment) && onComment(proposal._key, comment)}
              placeholder="Rationale for this decision…"
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
          </label>
        </AdminOnly>

        {/* appraised detail */}
        {extras.length > 0 && (
          <div className="mt-4 space-y-3 border-t pt-4 text-sm">
            {extras.map((k) => (
              <div key={k}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{labelFor(k)}</p>
                <p className="whitespace-pre-line text-slate-700">{str(proposal[k])}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}