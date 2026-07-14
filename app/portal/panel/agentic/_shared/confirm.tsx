"use client"
import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";
const BRAND = "#27aae1";
export default function ConfirmRunDialog({
  open, count, onCancel, onConfirm,
}: { open: boolean; count: number; onCancel: () => void; onConfirm: () => void }) {
  const [text, setText] = useState("");
  useEffect(() => { if (!open) setText(""); }, [open]);
  if (!open) return null;
  const ready = text.trim().toLowerCase() === "proceed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg p-1.5" style={{ background: `${BRAND}18` }}>
              <Play className="h-4 w-4" style={{ color: BRAND }} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Run appraisal on {count} proposal{count === 1 ? "" : "s"}?</h3>
          </div>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm text-slate-600">
            The agent will read the evidence for {count === 1 ? "this proposal" : `these ${count} proposals`} and score
            each criterion. This calls the model and may take a moment. Type <span className="font-mono font-semibold" style={{ color: BRAND }}>proceed</span> to continue.
          </p>
          <input value={text} onChange={(e) => setText(e.target.value)} autoFocus
            placeholder="proceed"
            onKeyDown={(e) => { if (e.key === "Enter" && ready) onConfirm(); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!ready}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: BRAND }}>
            <Play className="h-4 w-4" /> Yes, proceed
          </button>
        </div>
      </div>
    </div>
  );
}