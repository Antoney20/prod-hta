"use client";
import { useEffect, useState } from "react";
import { X, Loader2, Sparkles, Pencil, StickyNote, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { AppraisalScoreResult } from "@/types/new/agentic-results";
import { editScore } from "@/app/api/new/panel/results";


const BRAND = "#27aae1";

interface Props {
  score: AppraisalScoreResult | null;   
  onClose: () => void;
  onSaved: (updated: AppraisalScoreResult) => void;
  canEdit: boolean;                     
}

export default function ScoreDialog({ score, onClose, onSaved, canEdit }: Props) {
  const [finalScore, setFinalScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!score) return;
    setFinalScore(score.final_score != null ? String(score.final_score) : "");
    setNotes(score.notes ?? "");
    setVerified(score.verified);
  }, [score]);

  if (!score) return null;

  const save = async () => {
    setSaving(true);
    const res = await editScore(score.id, {
      final_score: finalScore.trim() === "" ? null : Number(finalScore),
      verified,
      notes: notes.trim() === "" ? null : notes,
    });
    setSaving(false);
    if (!res.ok || !res.data) { toast.error(res.error ?? "Save failed."); return; }
    toast.success("Score updated.");
    onSaved(res.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: BRAND }}>
              Criterion
            </p>
            <h3 className="mt-0.5 text-sm font-bold text-slate-800">{score.criterion}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* AI score + reasoning (frozen) */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Sparkles className="h-3.5 w-3.5" style={{ color: BRAND }} /> AI appraisal
            </div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">Score</span>
              <span className="rounded bg-white px-2 py-0.5 font-mono text-xs" style={{ color: BRAND }}>
                {score.ok ? score.score ?? "—" : "—"}
              </span>
              {!score.ok && score.failure_reason && (
                <span className="text-xs text-amber-600">{score.failure_reason}</span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
              {score.reasoning ?? "No reasoning recorded."}
            </p>
          </div>

          {canEdit ? (
            <>
              {/* Human override */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Pencil className="h-3.5 w-3.5" /> Final score <span className="font-normal text-slate-400">(overrides AI — leave blank to keep AI score)</span>
                </label>
                <input value={finalScore} onChange={(e) => setFinalScore(e.target.value)}
                  inputMode="decimal" placeholder={score.score != null ? String(score.score) : "—"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <StickyNote className="h-3.5 w-3.5" /> Panel note
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Reasoning for the override or a review comment…"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>

              {/* Verify */}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${verified ? "border-transparent" : "border-slate-300 bg-white"}`}
                  style={verified ? { background: BRAND } : undefined}
                  onClick={() => setVerified((v) => !v)}>
                  {verified && <CheckCircle2 className="h-3 w-3 text-white" />}
                </span>
                <span onClick={() => setVerified((v) => !v)}>Mark this score as verified by the panel</span>
              </label>
            </>
          ) : (
            score.notes && (
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <StickyNote className="h-3.5 w-3.5" /> Panel note
                </div>
                <p className="whitespace-pre-wrap text-xs text-slate-600">{score.notes}</p>
              </div>
            )
          )}
        </div>

        {canEdit && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <button onClick={onClose} disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: BRAND }}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}