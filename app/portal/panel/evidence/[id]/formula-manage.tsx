"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calculator, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getCriteria, updateCriterion } from "@/app/api/new/panel/evidence";
import { Criterion, CriterionHeader } from "@/types/new/evidence-panel";
import { DEFAULT_ROUND, FORMULA_FUNCTIONS, validateFormula } from "./formulas";

type Draft = { on: boolean; formula: string; round: string };

interface Props {
  criterion: Criterion;
  onChanged: (c: Criterion) => void;
  onRecomputed?: () => void;
}

export default function FormulaManager({ criterion, onChanged, onRecomputed }: Props) {
  const headers = criterion.headers ?? [];
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [others, setOthers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init: Record<string, Draft> = {};
    for (const h of headers)
      init[h.key] = {
        on: typeof h.formula === "string" && h.formula.trim() !== "",
        formula: h.formula ?? "",
        round: h.round == null ? "" : String(h.round),
      };
    setDrafts(init);
  }, [criterion.id, headers]);

  useEffect(() => {
    (async () => {
      const list = await getCriteria().catch(() => []);
      setOthers(
        (list ?? [])
          .map((c: Criterion) => c.criteria)
          .filter((n: string) => n && n.trim().toLowerCase() !== criterion.criteria.trim().toLowerCase()),
      );
    })();
  }, [criterion.criteria]);

  const fieldKeys = useMemo(() => headers.map((h) => h.key), [headers]);

  const setDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  const insert = (key: string, snippet: string) =>
    setDrafts((d) => ({
      ...d,
      [key]: { ...d[key], formula: (d[key].formula + (d[key].formula ? " " : "") + snippet).trim() },
    }));

  const results = useMemo(() => {
    const out: Record<string, ReturnType<typeof validateFormula>> = {};
    for (const h of headers) {
      const dr = drafts[h.key];
      if (!dr?.on) continue;
      out[h.key] = validateFormula(dr.formula, {
        fieldKeys: fieldKeys.filter((k) => k !== h.key),
        criteriaNames: others,
      });
    }
    return out;
  }, [drafts, headers, fieldKeys, others]);

  const anyInvalid = Object.values(results).some((r) => !r.ok);

  const save = async () => {
    if (anyInvalid) { toast.error("Fix the highlighted formulas first."); return; }
    const next: CriterionHeader[] = headers.map((h) => {
      const dr = drafts[h.key];
      const base = { ...h };
      delete (base as Partial<CriterionHeader>).formula;
      delete (base as Partial<CriterionHeader>).round;
      if (dr?.on && dr.formula.trim()) {
        base.formula = dr.formula.trim();
        base.round = dr.round.trim() === "" ? DEFAULT_ROUND : Math.max(0, parseInt(dr.round, 10) || 0);
      }
      return base;
    });
    setSaving(true);
    const res = await updateCriterion(criterion.id, { headers: next });
    setSaving(false);
    if (res.ok && res.data) {
      onChanged(res.data);
      toast.success("Formulas saved — existing evidence re-synced.");
      onRecomputed?.();
    } else {
      toast.error(res.error ?? "Could not save formulas.");
    }
  };

  if (headers.length === 0) return null;

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <div className="rounded-lg bg-[#27aae1]/10 p-2"><Calculator className="h-5 w-5 text-[#27aae1]" /></div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">Formulas &amp; auto-calculated fields</h3>
          <p className="text-xs text-slate-500">
            Turn a label into a computed field. Use other labels by key (e.g.{" "}
            <code className="rounded bg-slate-100 px-1">unit_cost * quantity</code>) or pull a value
            from another criterion with <code className="rounded bg-slate-100 px-1">ref(&quot;Criterion&quot;, &quot;field_key&quot;)</code>.
            Values recompute and re-sync automatically on every change.
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {headers.map((h) => {
          const dr = drafts[h.key] ?? { on: false, formula: "", round: "" };
          const r = results[h.key];
          return (
            <div key={h.key} className="border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{h.label}</span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">{h.key}</code>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                  <input type="checkbox" className="h-4 w-4 accent-[#27aae1]"
                    checked={dr.on} onChange={(e) => setDraft(h.key, { on: e.target.checked })} />
                  Computed field
                </label>
              </div>

              {dr.on && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={dr.formula}
                    onChange={(e) => setDraft(h.key, { formula: e.target.value })}
                    placeholder='e.g. unit_cost * quantity * ref("Population", "size")'
                    className={`w-full min-h-[56px] rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${
                      r && !r.ok ? "border-red-300" : "border-slate-300"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Round to</span>
                    <input type="number" min={0} value={dr.round}
                      onChange={(e) => setDraft(h.key, { round: e.target.value })}
                      placeholder={String(DEFAULT_ROUND)}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
                    <span className="text-xs text-slate-400">decimal places</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fieldKeys.filter((k) => k !== h.key).map((k) => (
                      <button key={k} type="button" onClick={() => insert(h.key, k)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono text-slate-600 hover:border-[#27aae1]">
                        {k}
                      </button>
                    ))}
                    {others.map((name) => (
                      <button key={name} type="button" onClick={() => insert(h.key, `ref("${name}", "field_key")`)}
                        className="rounded-full border border-[#27aae1]/30 bg-[#27aae1]/5 px-2 py-0.5 text-[11px] text-[#1d70b8] hover:border-[#27aae1]">
                        ref: {name}
                      </button>
                    ))}
                  </div>

                  {r && (
                    r.ok ? (
                      <p className="flex items-center gap-1 text-xs text-emerald-600">
                        <Check className="h-3.5 w-3.5" /> Valid
                        {r.crossRefs.length > 0 && ` · depends on ${r.crossRefs.join(", ")}`}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" /> {r.error}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        <p className="text-[11px] text-slate-400">
          Functions: {FORMULA_FUNCTIONS.join(", ")}. Operators: + − * / % ^, comparisons, and{" "}
          <code className="rounded bg-slate-100 px-1">cond ? a : b</code>.
        </p>

        <div className="flex justify-end">
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white"
            disabled={saving || anyInvalid} onClick={save}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
            Save formulas
          </Button>
        </div>
      </div>
    </div>
  );
}