"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { sendFeedbackEmail } from "@/app/api/feedback";
import type { FeedbackCategory, InterventionFeedbackStatus } from "@/types/new/feedback";
import { Chip } from "./Chip";


interface SendDialogProps {
  open:         boolean;
  intervention: InterventionFeedbackStatus | null;
  categories:   FeedbackCategory[];
  onClose:      () => void;
  onSent:       () => void;
}

export function SendDialog({ open, intervention, categories, onClose, onSent }: SendDialogProps) {
  const [categoryId, setCategoryId] = useState("");
  const [isSending,  setIsSending]  = useState(false);

  const handle = async () => {
    if (!intervention || !categoryId) { toast.warn("Select a category"); return; }
    setIsSending(true);
    try {
      const res = await sendFeedbackEmail({
        intervention:  intervention.intervention_id,
        category:      categoryId,
        status_update: intervention.latest_status_update_id ?? undefined,
      });
      if (res.success) {
        toast.success("Email sent successfully");
        setCategoryId("");
        onSent();
        onClose();
      } else {
        toast.error(res.message || "Failed to send");
      }
    } catch { toast.error("Failed to send email"); }
    finally { setIsSending(false); }
  };

  const activeCategories = categories.filter(c => c.is_active);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { setCategoryId(""); onClose(); } }}>
      <DialogContent className="max-w-lg bg-white rounded-xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">Send Feedback Email</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1 leading-relaxed">
            Sending to: <strong className="text-gray-700">{intervention?.intervention_name}</strong>
            <br />Recipient:{" "}
            <span className="text-gray-500">{intervention?.email}</span>
          </DialogDescription>
        </DialogHeader>

        {intervention && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Meta chips */}
            <div className="flex gap-2 flex-wrap">
              <Chip label={intervention.reference_number} />
              {intervention.system_categories.map(c => (
                <Chip key={c} label={c} variant="muted" />
              ))}
              {intervention.decision && (
                <Chip label={intervention.decision} variant="green" />
              )}
            </div>

            {/* Category select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Feedback Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white text-gray-700 outline-none w-full"
              >
                <option value="">Select a category…</option>
                {activeCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Feedback preview */}
            {intervention.feedback && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  Panel Feedback (included if template uses &#123;&#123; feedback &#125;&#125;):
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">{intervention.feedback}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-5 flex gap-2 justify-end">
          <DialogClose asChild>
            <button
              onClick={() => { setCategoryId(""); onClose(); }}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handle}
            disabled={isSending || !categoryId}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isSending || !categoryId
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#27aae1] text-white hover:bg-[#1d8fbc]"
            }`}
          >
            {isSending ? "Sending…" : "Send Email"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}