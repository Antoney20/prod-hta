"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CriteriaRule, RuleBand, RuleInput } from "@/types/new/criteria-rules";
import { CriterionHeader } from "@/types/new/evidence-panel";
import { updateRule } from "@/app/api/new/panel/rules";
import { getCriterion } from "@/app/api/new/panel/evidence";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: CriteriaRule;
  onSaved: () => void;
}

const OPS: { v: NonNullable<RuleBand["op"]>; label: string }[] = [
  { v: "<=", label: "at most (≤)" },
  { v: "<",  label: "less than (<)" },
  { v: ">=", label: "at least (≥)" },
  { v: ">",  label: "more than (>)" },
  { v: "between", label: "in range (a–b)" },
  { v: "==", label: "equals (=)" },
  { v: "!=", label: "not equal (≠)" },
  { v: "in", label: "one of (a,b,c)" },
];

const AGGS = [
  { v: "", label: "Single field" },
  { v: "average", label: "Average of fields" },
  { v: "sum", label: "Sum of fields" },
  { v: "combo", label: "Factor combination" },
];

export default function EditRuleDialog({ open, onOpenChange, rule, onSaved }: Props) {
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("descriptive");
  const [aggregate, setAggregate] = useState("");
  const [targetFields, setTargetFields] = useState<string[]>([]);
  const [bands, setBands] = useState<RuleBand[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labels, setLabels] = useState<CriterionHeader[]>([]);

  useEffect(() => {
    if (!open) return;
    setDescription(rule.description ?? "");
    setKind(rule.kind ?? "descriptive");
    setAggregate(rule.aggregate ?? "");
    setTargetFields(rule.target_fields ?? []);
    setBands(rule.bands ?? []);
    setActive(rule.active);
    (async () => {
      const c = await getCriterion(rule.criterion);
      setLabels(c?.headers ?? []);
    })();
  }, [open, rule]);

  const isCombo = aggregate === "combo";
  const isQuant = kind === "quantitative";
  const multiField = isQuant && !isCombo && targetFields.length > 1;

  const toggleTarget = (key: string) =>
    setTargetFields((t) => {
      const next = t.includes(key) ? t.filter((k) => k !== key) : [...t, key];
      // drop bands whose field is no longer a target (multi-field quant rules only)
      if (t.includes(key)) {
        setBands((b) => b.filter((band) => !band.field || next.includes(band.field)));
      }
      return next;
    });

  const addBand = (field?: string) => {
    if (isCombo) setBands((b) => [...b, { combo: targetFields.map(() => ""), score: 1 }]);
    else if (isQuant) setBands((b) => [...b, { field, op: "<=", value: 0, score: 1, label: "" }]);
    else setBands((b) => [...b, { label: "", score: 1 }]);
  };
  const setBand = (i: number, patch: Partial<RuleBand>) =>
    setBands((b) => b.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeBand = (i: number) => setBands((b) => b.filter((_, idx) => idx !== i));

  const label = (k?: string) => labels.find((l) => l.key === k)?.label ?? k ?? "";

  const submit = async () => {
    const cleanBands: RuleBand[] = isCombo
      ? bands.map((b) => ({ combo: b.combo ?? [], score: b.score, label: b.label }))
      : isQuant
      ? bands.map((b) => ({
          ...(multiField && b.field ? { field: b.field } : {}),
          op: b.op, value: b.value, score: b.score, label: b.label,
        }))
      : bands.map((b) => ({ label: b.label ?? "", score: b.score }));

    const payload: RuleInput = {
      description, kind, aggregate,
      // both kinds send target fields — descriptive uses them as decision inputs
      target_fields: isCombo ? targetFields : targetFields,
      bands: cleanBands,
      active,
    };

    setSaving(true);
    const res = await updateRule(rule.id, payload);
    setSaving(false);

    if (res.ok) { toast.success("Rule updated"); onOpenChange(false); onSaved(); }
    else toast.error(res.error ?? "Save failed");
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]";

  const quantRow = (b: RuleBand, i: number) => (
    <div key={i} className="flex flex-wrap items-start gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
      <select className={`${inputCls} w-40 flex-none`} value={b.op ?? "<="}
        onChange={(e) => setBand(i, { op: e.target.value as RuleBand["op"] })}>
        {OPS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
      <input className={`${inputCls} w-28 flex-none`}
        value={Array.isArray(b.value) ? b.value.join(", ") : String(b.value ?? "")}
        onChange={(e) => {
          const raw = e.target.value;
          const val = b.op === "between" || b.op === "in"
            ? raw.split(",").map((x) => { const n = Number(x.trim()); return Number.isNaN(n) ? x.trim() : n; })
            : (() => { const n = Number(raw); return Number.isNaN(n) ? raw : n; })();
          setBand(i, { value: val });
        }}
        placeholder={b.op === "between" ? "6, 10" : "5"} />
      <input className={`${inputCls} flex-1`} value={b.label ?? ""}
        onChange={(e) => setBand(i, { label: e.target.value })}
        placeholder="Label (optional, e.g. Top 6-10)" />
      <div className="flex flex-none items-center gap-1">
        <span className="text-xs text-slate-400">→</span>
        <input type="number" value={b.score}
          onChange={(e) => setBand(i, { score: Number(e.target.value) })}
          className="w-16 rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]" />
      </div>
      <button type="button" onClick={() => removeBand(i)}
        className="flex-none rounded p-1.5 text-red-500 hover:bg-red-50">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-[#27aae1]">Edit rule · {rule.criterion_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Kind</label>
              <div className="inline-flex w-full rounded-md border border-slate-200 text-sm">
                {["descriptive", "quantitative"].map((k) => (
                  <button key={k} onClick={() => setKind(k)}
                    className={`flex-1 px-3 py-1.5 ${kind === k ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
            {isQuant && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">How fields combine</label>
                <select className={inputCls} value={aggregate} onChange={(e) => setAggregate(e.target.value)}>
                  {AGGS.map((a) => <option key={a.v} value={a.v}>{a.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea className={`${inputCls} min-h-[60px]`} value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* target fields — for BOTH kinds */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Decision fields</label>
            <p className="mb-2 text-xs text-slate-400">
              {isQuant
                ? "The evidence data labels this rule scores. Pick one, or several for average/sum/combo."
                : "The evidence data labels that inform this judgment. Bands stay descriptive; these tell the appraiser which data to weigh."}
            </p>
            {labels.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 py-4 text-center text-xs text-slate-400">
                No data labels on this criterion yet — add them under Assessment Evidence.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => {
                  const on = targetFields.includes(l.key);
                  return (
                    <button key={l.key} onClick={() => toggleTarget(l.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                        on ? "border-[#27aae1] bg-[#27aae1] text-white" : "border-slate-300 bg-white text-slate-600 hover:border-[#27aae1]"
                      }`}>
                      {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {l.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* BANDS */}
          {isCombo ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Score combinations</label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addBand()}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {bands.map((b, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                    {(b.combo ?? targetFields.map(() => "")).map((c, ci) => (
                      <input key={ci} className={`${inputCls} w-24 flex-none`} value={c}
                        onChange={(e) => {
                          const combo = [...(b.combo ?? targetFields.map(() => ""))];
                          combo[ci] = e.target.value;
                          setBand(i, { combo });
                        }}
                        placeholder={targetFields[ci] ?? `f${ci + 1}`} />
                    ))}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">→</span>
                      <input type="number" value={b.score}
                        onChange={(e) => setBand(i, { score: Number(e.target.value) })}
                        className="w-16 rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]" />
                    </div>
                    <button type="button" onClick={() => removeBand(i)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : isQuant && multiField ? (
            <div className="space-y-4">
              {targetFields.map((f) => (
                <div key={f}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Bands · <span className="font-mono text-xs text-slate-500">{label(f)}</span>
                    </label>
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addBand(f)}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add band
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {bands.map((b, i) => (b.field === f ? quantRow(b, i) : null))}
                  </div>
                </div>
              ))}
            </div>
          ) : isQuant ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Scoring bands</label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addBand(targetFields[0])}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add band
                </Button>
              </div>
              <div className="space-y-2">{bands.map((b, i) => quantRow(b, i))}</div>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Decision table (bands)</label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addBand()}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add band
                </Button>
              </div>
              <div className="space-y-2">
                {bands.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                    <textarea className={`${inputCls} min-h-[44px] flex-1`} value={b.label ?? ""}
                      onChange={(e) => setBand(i, { label: e.target.value })}
                      placeholder="Excellent — full regulatory approval, robust evidence…" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">→</span>
                      <input type="number" value={b.score}
                        onChange={(e) => setBand(i, { score: Number(e.target.value) })}
                        className="w-16 rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]" />
                    </div>
                    <button type="button" onClick={() => removeBand(i)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active (used in scoring)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white" disabled={saving} onClick={submit}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}