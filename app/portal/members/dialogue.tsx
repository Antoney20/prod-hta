"use client";
import { UserX, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const DANGER = "#dc2626";

export default function ConfirmDeactivateDialog({
  open, name, loading, onCancel, onConfirm,
}: {
  open: boolean;
  name: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [text, setText] = useState("");
  useEffect(() => { if (!open) setText(""); }, [open]);
  if (!open) return null;
  const ready = text.trim().toLowerCase() === "deactivate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg p-1.5" style={{ background: `${DANGER}18` }}>
              <UserX className="h-4 w-4" style={{ color: DANGER }} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Deactivate {name}?</h3>
          </div>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm text-slate-600">
            This sets the account to <span className="font-semibold">inactive</span> and blocks sign-in. No data is deleted
            and it can be reversed. Type <span className="font-mono font-semibold" style={{ color: DANGER }}>deactivate</span> to continue.
          </p>
          <input value={text} onChange={(e) => setText(e.target.value)} autoFocus
            placeholder="deactivate"
            onKeyDown={(e) => { if (e.key === "Enter" && ready && !loading) onConfirm(); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!ready || loading}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: DANGER }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />} Yes, deactivate
          </button>
        </div>
      </div>
    </div>
  );
}