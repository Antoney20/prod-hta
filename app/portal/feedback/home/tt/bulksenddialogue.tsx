"use client";

import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { bulkSendFeedbackEmail } from "@/app/api/feedback";
import type { FeedbackCategory, InterventionFeedbackStatus } from "@/types/new/feedback";


function renderTemplatePreview(template: string): string {
  const sample: Record<string, string> = {
    "{{ submitter_name }}":  "Dr. A Much",
    "{{ submitter_email }}": "hbtap@uonbi.ac.ke",
    "{{ decision_type }}":   "Approved",
    "{{ decision_date }}":   "15 July 2025",
    "{{ feedback }}":        "Your proposal meets the clinical effectiveness and cost criteria.",
    "{{ org_name }}":        "BPTAP Secretariat",
    "{{ org_email }}":       "hbtap@uonbi.ac.ke",
    "{{ current_year }}":    String(new Date().getFullYear()),
  };

  let html = template;
  for (const [k, v] of Object.entries(sample)) html = html.replaceAll(k, v);

  // evaluate {% if %}...{% endif %}
  html = html.replace(
    /\{%\s*if\s+([^%]+?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
    (_m, condition, inner) => {
      const lookup: Record<string, string> = {
        decision_type: "Approved",
        decision_date: "15 July 2025",
        feedback:      "Panel feedback here.",
      };
      const truthy = condition.split(/\s+or\s+/).some(
        (c: string) => Boolean(lookup[c.trim()])
      );
      if (!truthy) return "";
      return inner.replace(
        /\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
        (_m2: string, k: string, body: string) => lookup[k] ? body : ""
      );
    }
  );

  return html;
}

interface BulkSendDialogProps {
  open:       boolean;
  selected:   InterventionFeedbackStatus[];
  categories: FeedbackCategory[];
  onClose:    () => void;
  onSent:     () => void;
}

export function BulkSendDialog({ open, selected, categories, onClose, onSent }: BulkSendDialogProps) {
  const [categoryId, setCategoryId] = useState("");
  const [isSending,  setIsSending]  = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const activeCategories = categories.filter(c => c.is_active);
  const chosenCategory   = activeCategories.find(c => c.id === categoryId) ?? null;

  const previewHtml = useMemo(
    () => chosenCategory ? renderTemplatePreview(chosenCategory.template) : "",
    [chosenCategory]
  );

  const handle = async () => {
    if (!categoryId) { toast.warn("Select a category"); return; }
    setIsSending(true);
    try {
      const res = await bulkSendFeedbackEmail({
        category:         categoryId,
        intervention_ids: selected.map(s => s.intervention_id),
      });
      if (res.data.failed_count === 0) {
        toast.success(`Sent to all ${res.data.sent_count} interventions`);
      } else {
        toast.warn(`Sent: ${res.data.sent_count}, Failed: ${res.data.failed_count}`);
      }
      setCategoryId("");
      setShowPreview(false);
      onSent();
      onClose();
    } catch { toast.error("Bulk send failed"); }
    finally { setIsSending(false); }
  };

  const handleClose = () => {
    setCategoryId("");
    setShowPreview(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent
        className="bg-white rounded-xl shadow-2xl p-0 overflow-hidden"
        style={{ maxWidth: showPreview ? 860 : 520, width: "95vw" }}
      >
        <div className={`flex ${showPreview ? "divide-x divide-gray-100" : ""}`}>

          {/* ── Left: form ── */}
          <div className="flex flex-col p-6 flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Bulk Send Feedback Email
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Sending to{" "}
                <strong className="text-gray-700">{selected.length}</strong>{" "}
                intervention{selected.length !== 1 ? "s" : ""}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-col gap-4 flex-1">
              {/* Category select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Feedback Category *
                </label>
                <select
                  value={categoryId}
                  onChange={e => { setCategoryId(e.target.value); setShowPreview(false); }}
                  className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white text-gray-700 outline-none w-full focus:border-[#27aae1] transition-colors"
                >
                  <option value="">Select a category…</option>
                  {activeCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Category info card — shown when selected */}
              {chosenCategory && (
                <div className="border border-[#27aae1]/30 rounded-lg p-3.5 bg-sky-50/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{chosenCategory.name}</p>
                      {chosenCategory.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{chosenCategory.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5 italic truncate">
                        Subject: {chosenCategory.subject}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(p => !p)}
                      className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        showPreview
                          ? "border-[#27aae1] bg-[#27aae1] text-white"
                          : "border-[#27aae1] text-[#27aae1] hover:bg-sky-50"
                      }`}
                    >
                      {showPreview ? "Hide preview" : "Preview email"}
                    </button>
                  </div>
                </div>
              )}

              {/* Recipient list */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Recipients ({selected.length})
                </label>
                <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-50">
                  {selected.map(s => (
                    <div key={s.intervention_id} className="px-3 py-2 flex justify-between gap-3 text-xs">
                      <span className="font-medium text-gray-800 truncate max-w-[55%]">
                        {s.intervention_name}
                      </span>
                      <span className="text-gray-400 truncate">{s.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-5 flex gap-2 justify-end pt-4 border-t border-gray-100">
              <DialogClose asChild>
                <button
                  onClick={handleClose}
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
                {isSending ? "Sending…" : `Send to ${selected.length}`}
              </button>
            </DialogFooter>
          </div>

          {/* ── Right: email preview ── */}
          {showPreview && chosenCategory && (
            <div className="w-[340px] shrink-0 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Preview</p>
                <p className="text-xs text-gray-400 mt-0.5">Sample data shown</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Miniature email render */}
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, lineHeight: 1.5 }}>
                  <div style={{ background: "#27aae1", color: "#fff", padding: "12px 16px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{chosenCategory.name}</p>
                  </div>
                  <div style={{ background: "#fff", padding: "14px 16px", borderLeft: "1px solid #27aae1", borderRight: "1px solid #27aae1" }}>
                    <style>{`
                      .detail-block{background:#f4f9fd;border-left:3px solid #27aae1;padding:8px 10px;margin:10px 0;border-radius:0 3px 3px 0}
                      .detail-block p{margin:2px 0;font-size:11px}
                      .detail-block strong{color:#27aae1}
                      .feedback-block{background:#fffbe6;border-left:3px solid #f0a500;padding:8px 10px;margin:10px 0;border-radius:0 3px 3px 0}
                      .feedback-block p{margin:2px 0;font-size:11px}
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                  <div style={{ background: "#111827", color: "#fff", padding: "10px 16px", textAlign: "center", fontSize: 10 }}>
                    <p style={{ margin: 0 }}>Automated notification — do not reply.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}