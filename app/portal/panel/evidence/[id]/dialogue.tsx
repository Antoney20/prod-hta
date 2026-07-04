"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Criterion, CriterionEvidence } from "@/types/new/evidence-panel";
import { updateEvidence } from "@/app/api/new/panel/evidence";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  criterion: Criterion;
  row: CriterionEvidence | null;
  targetLabel?: string;
  onSaved: () => void;
}

export default function EvidenceEditDialog({
  open, onOpenChange, criterion, row, targetLabel, onSaved,
}: Props) {
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const headers = criterion.headers ?? [];

  useEffect(() => {
    if (!open || !row) return;
    const init: Record<string, string> = {};
    for (const h of headers) {
      const v = (row.data as any)?.[h.key];
      init[h.key] = v == null ? "" : Array.isArray(v) ? v.join(", ") : String(v);
    }
    setData(init);
  }, [open, row, headers]);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    if (!row) return;
    // coerce by declared type
    const out: Record<string, unknown> = {};
    for (const h of headers) {
      const raw = data[h.key]?.trim() ?? "";
      if (raw === "") continue;
      if (h.type === "number") {
        const n = Number(raw.replace(/,/g, ""));
        out[h.key] = Number.isNaN(n) ? raw : n;
      } else {
        out[h.key] = raw;
      }
    }
    setSaving(true);
    const res = await updateEvidence(row.id, { data: out });
    setSaving(false);
    if (res.ok) { toast.success("Evidence updated."); onOpenChange(false); onSaved(); }
    else toast.error(res.error ?? "Update failed");
  };

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-[#27aae1]">Edit evidence</DialogTitle>
          <p className="text-sm text-slate-500">
            {criterion.criteria}{targetLabel ? ` · ${targetLabel}` : ""}
          </p>
        </DialogHeader>

        {headers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            This criterion has no data labels yet. Add labels first to edit evidence fields.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {headers.map((h) => (
              <div key={h.key} className={h.type === "text" ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {h.label}
                  {h.type && h.type !== "text" && (
                    <span className="ml-1 text-[10px] uppercase text-slate-400">{h.type}</span>
                  )}
                </label>
                {h.type === "choice" && h.options?.length ? (
                  <select className={inputCls} value={data[h.key] ?? ""} onChange={(e) => set(h.key, e.target.value)}>
                    <option value="">—</option>
                    {h.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : h.type === "text" ? (
                  <textarea className={`${inputCls} min-h-[70px]`} value={data[h.key] ?? ""} onChange={(e) => set(h.key, e.target.value)} />
                ) : (
                  <input
                    type={h.type === "number" ? "number" : "text"}
                    className={inputCls}
                    value={data[h.key] ?? ""}
                    onChange={(e) => set(h.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white" disabled={saving} onClick={submit}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}