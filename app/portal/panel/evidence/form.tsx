"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Criterion, CriterionInput, CriterionHeader } from "@/types/new/evidence-panel";
import { createCriterion, updateCriterion } from "@/app/api/new/panel/evidence";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Criterion | null;
  onSaved: () => void;
}

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const empty: CriterionInput = { criteria: "", active: true, headers: [] };

export default function CriterionForm({ open, onOpenChange, initial, onSaved }: Props) {
  const [criteria, setCriteria] = useState("");
  const [active, setActive] = useState(true);
  const [headers, setHeaders] = useState<CriterionHeader[]>([]);
  const [saving, setSaving] = useState(false);
  const editing = !!initial;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCriteria(initial.criteria);
      setActive(initial.active);
      setHeaders(initial.headers ?? []);
    } else {
      setCriteria("");
      setActive(true);
      setHeaders([]);
    }
  }, [open, initial]);

  const addLabel = () =>
    setHeaders((h) => [...h, { key: "", label: "", type: "text" }]);

  const updateLabel = (i: number, patch: Partial<CriterionHeader>) =>
    setHeaders((h) => h.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const removeLabel = (i: number) =>
    setHeaders((h) => h.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!criteria.trim()) {
      toast.error("Criteria name is required");
      return;
    }
    // finalise: derive key from label if blank, drop empty labels
    const clean = headers
      .filter((h) => h.label.trim())
      .map((h) => ({ ...h, label: h.label.trim(), key: h.key.trim() || slug(h.label) }));

    const keys = clean.map((h) => h.key);
    if (new Set(keys).size !== keys.length) {
      toast.error("Duplicate label keys — make each label distinct");
      return;
    }

    const payload: CriterionInput = { criteria: criteria.trim(), active, headers: clean };
    setSaving(true);
    const res = editing
      ? await updateCriterion(initial!.id, payload)
      : await createCriterion(payload);
    setSaving(false);

    if (res.ok) {
      toast.success(editing ? "Criterion updated" : "Criterion created");
      onOpenChange(false);
      onSaved();
    } else {
      toast.error(res.error ?? "Save failed");
    }
  };

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-[#1d70b8]">
            {editing ? "Edit criterion" : "New criterion"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Criteria name
            </label>
            <input
              className={inputCls}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="e.g. Clinical effectiveness"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active (used in weighting / scoring)
          </label>

          {/* data labels — evidence structure */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Data labels</label>
                <p className="text-xs text-gray-400">
                  Define the columns evidence for this criterion will carry.
                </p>
              </div>
              <button
                type="button"
                onClick={addLabel}
                className="inline-flex items-center gap-1 rounded-md border border-[#27aae1] px-2 py-1 text-xs font-medium text-[#1d70b8] hover:bg-[#27aae1]/10"
              >
                <Plus size={13} /> Add label
              </button>
            </div>

            {headers.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 py-6 text-center text-sm text-gray-400">
                No labels yet. Add one to shape the evidence structure.
              </div>
            ) : (
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GripVertical size={14} className="shrink-0 text-gray-300" />
                    <input
                      className={`${inputCls} flex-1`}
                      placeholder="Label (e.g. Morbidity ranking)"
                      value={h.label}
                      onChange={(e) =>
                        updateLabel(i, {
                          label: e.target.value,
                          key: h.key || slug(e.target.value),
                        })
                      }
                    />
                    <select
                      className={`${inputCls} w-32 shrink-0`}
                      value={h.type ?? "text"}
                      onChange={(e) =>
                        updateLabel(i, { type: e.target.value as CriterionHeader["type"] })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="choice">Choice</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLabel(i)}
                      className="shrink-0 rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-md bg-[#1d70b8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d8fc3] disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}