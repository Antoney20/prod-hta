"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Criterion, CriterionEvidence } from "@/types/new/evidence-panel";
import { getEvidence, updateEvidence } from "@/app/api/new/panel/evidence";
import { criterionRefs, evaluateRow, isFormula } from "./formulas";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  criterion: Criterion;
  allCriteria: Criterion[];
  row: CriterionEvidence | null;
  targetLabel?: string;
  onSaved: () => void;
}

export default function EvidenceEditDialog({
  open, onOpenChange, criterion, allCriteria, row, targetLabel, onSaved,
}: Props) {
  const [data, setData] = useState<Record<string, string>>({});
  const [cross, setCross] = useState<Map<string, Record<string, unknown>>>(new Map());
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

  // pull this target's records under OTHER criteria so cross refs preview correctly
  useEffect(() => {
    if (!open || !row) { setCross(new Map()); return; }
    const needsCross = headers.some((h) => isFormula(h) && criterionRefs(h.formula!).length > 0);
    if (!needsCross) { setCross(new Map()); return; }

    (async () => {
     const filter: { intervention?: string; national_proposal?: string } = row.intervention
        ? { intervention: String(row.intervention) }
        : { national_proposal: row.national_proposal ? String(row.national_proposal) : undefined };
      const all = await getEvidence(filter).catch(() => []);
      const idName = new Map(allCriteria.map((c) => [String(c.id), (c.criteria || "").trim().toLowerCase()]));
      const byName = new Map<string, { data: Record<string, unknown>; created: string; id: string }>();
      for (const e of all as CriterionEvidence[]) {
        const nm = idName.get(String((e as any).criterion)) ?? "";
        if (!nm) continue;
        const created = String((e as any).created_at ?? "");
        const prev = byName.get(nm);
        if (!prev || created < prev.created || (created === prev.created && String(e.id) < prev.id))
          byName.set(nm, { data: (e.data as Record<string, unknown>) ?? {}, created, id: String(e.id) });
      }
      setCross(new Map([...byName].map(([k, v]) => [k, v.data])));
    })();
  }, [open, row, headers, allCriteria]);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const crossFn = useMemo(
    () => (name: string, key: string): number | undefined => {
      const v = cross.get(name)?.[key];
      if (v == null || v === "") return undefined;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isNaN(n) ? undefined : n;
    },
    [cross],
  );

  // live preview of every computed field from the inputs currently on screen
  const preview = useMemo(() => evaluateRow(headers, data, crossFn), [headers, data, crossFn]);

  const submit = async () => {
    if (!row) return;
    const out: Record<string, unknown> = {};
    for (const h of headers) {
      if (isFormula(h)) continue;                 // computed server-side — never sent
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
            {headers.map((h) => {
              const computed = isFormula(h);
              const spanFull = h.type === "text" || computed;
              return (
                <div key={h.key} className={spanFull ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {h.label}
                    {computed ? (
                      <span className="ml-1 inline-flex items-center gap-1 text-[10px] uppercase text-[#27aae1]">
                        <Calculator className="h-3 w-3" /> computed
                      </span>
                    ) : (
                      h.type && h.type !== "text" && (
                        <span className="ml-1 text-[10px] uppercase text-slate-400">{h.type}</span>
                      )
                    )}
                  </label>

                  {computed ? (
                    <div className="rounded-md border border-[#27aae1]/30 bg-[#27aae1]/5 px-3 py-2">
                      <p className="font-mono text-xs text-slate-500">{h.formula}</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {preview.errors[h.key] || preview.values[h.key] == null ? "—" : preview.values[h.key]}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {preview.errors[h.key]
                            ? preview.errors[h.key]
                            : `rounded to ${h.round ?? 4} dp · recomputed on save`}
                        </span>
                      </div>
                    </div>
                  ) : h.type === "choice" && h.options?.length ? (
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
              );
            })}
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