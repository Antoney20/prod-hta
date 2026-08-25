"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calculator, Check, Info, Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { updateCriterion } from "@/app/api/new/panel/evidence";
import { Criterion, CriterionHeader } from "@/types/new/evidence-panel";
import { DEFAULT_ROUND, FORMULA_FUNCTIONS, fieldRefs, refPairs, validateFormula } from "./formulas";

type Mode = "off" | "constant" | "formula";

interface FieldOption {
  key: string;
  label: string;
  criterionName: string;
  isCurrent: boolean;
  isSelf: boolean;
  snippet: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  criterion: Criterion;
  header: CriterionHeader | null;
  allCriteria: Criterion[];
  onSaved: (c: Criterion) => void;
  onRecomputed?: () => void;
}

const isConstant = (expr?: string): boolean =>
  typeof expr === "string" && /^-?\d+(\.\d+)?$/.test(expr.trim());

export default function FormulaDialog({
  open, onOpenChange, criterion, header, allCriteria, onSaved, onRecomputed,
}: Props) {
  const [mode, setMode] = useState<Mode>("off");
  const [constant, setConstant] = useState("");
  const [formula, setFormula] = useState("");
  const [round, setRound] = useState("");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !header) return;
    const f = header.formula ?? "";
    if (f.trim() === "") { setMode("off"); setConstant(""); setFormula(""); }
    else if (isConstant(f)) { setMode("constant"); setConstant(f.trim()); setFormula(""); }
    else { setMode("formula"); setFormula(f); setConstant(""); }
    setRound(header.round == null ? "" : String(header.round));
    setQ("");
  }, [open, header]);

  const currentHeaders = criterion.headers ?? [];
  const currentName = criterion.criteria.trim().toLowerCase();

  // fields you can reference: this criterion (bare key) + others (via ref),
  // skipping same-named criteria and de-duping so duplicate records don't clutter.
  const options = useMemo<FieldOption[]>(() => {
    const out: FieldOption[] = [];
    for (const h of currentHeaders) {
      out.push({
        key: h.key, label: h.label, criterionName: criterion.criteria,
        isCurrent: true, isSelf: !!header && h.key === header.key, snippet: h.key,
      });
    }
    const seen = new Set<string>();
    for (const c of allCriteria) {
      if (String(c.id) === String(criterion.id)) continue;
      if (c.criteria.trim().toLowerCase() === currentName) continue;  // own criterion → use bare keys above
      for (const h of c.headers ?? []) {
        const dedup = `${c.criteria.trim().toLowerCase()}|${h.key}`;
        if (seen.has(dedup)) continue;
        seen.add(dedup);
        out.push({
          key: h.key, label: h.label, criterionName: c.criteria,
          isCurrent: false, isSelf: false, snippet: `ref("${c.criteria}", "${h.key}")`,
        });
      }
    }
    return out;
  }, [currentHeaders, allCriteria, criterion, header, currentName]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(s) ||
        o.key.toLowerCase().includes(s) ||
        o.criterionName.toLowerCase().includes(s),
    );
  }, [options, q]);

  const insert = (snippet: string) =>
    setFormula((f) => (f + (f && !f.endsWith(" ") ? " " : "") + snippet).trimStart());

  const otherNames = useMemo(
    () => allCriteria.map((c) => c.criteria).filter((n) => n && n.trim().toLowerCase() !== currentName),
    [allCriteria, currentName],
  );
  const localKeys = useMemo(() => currentHeaders.map((h) => h.key), [currentHeaders]);

  // a real field on THIS criterion to seed function examples with, so every
  // inserted snippet is immediately valid; prefer a population field.
  const sampleField = useMemo(() => {
    const keys = currentHeaders.map((h) => h.key);
    return keys.find((k) => k.toLowerCase().includes("population")) ?? keys[0] ?? "est_target_population";
  }, [currentHeaders]);

  const FN_CHIPS: { label: string; snippet: string; note: string }[] = [
    { label: "nz",       snippet: `nz(${sampleField})`,          note: "blank → 0" },
    { label: "coalesce", snippet: `coalesce(${sampleField}, 0)`, note: "first non-blank, else 0" },
    { label: "ifnull",   snippet: `ifnull(${sampleField}, 0)`,   note: "alias of coalesce" },
    { label: "round",    snippet: `round(${sampleField}, 2)`,    note: "round to n dp" },
    { label: "min",      snippet: `min(${sampleField}, 0)`,      note: "" },
    { label: "max",      snippet: `max(${sampleField}, 0)`,      note: "" },
    { label: "if =0",   snippet: `iif(${sampleField} == 0, 0, ${sampleField})`, note: "if x == 0 then a else b" },
  ];

  // criterion name → UNION of header keys across every record sharing that name.
  // Fixes duplicate-name records where a plain map would drop the record that
  // actually holds the field (last-wins), rejecting a valid reference.
  const keysByName = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of allCriteria) {
      const nm = c.criteria.trim().toLowerCase();
      const set = m.get(nm) ?? new Set<string>();
      for (const h of c.headers ?? []) set.add(h.key);
      m.set(nm, set);
    }
    return m;
  }, [allCriteria]);

  const result = useMemo(() => {
    if (mode !== "formula") return null;
    const base = validateFormula(formula, { fieldKeys: localKeys, criteriaNames: otherNames });
    if (!base.ok) return base;
    for (const { name, key } of refPairs(formula)) {
      const keys = keysByName.get(name.trim().toLowerCase());
      if (keys && !keys.has(key)) return { ...base, ok: false, error: `"${name}" has no field "${key}"` };
    }
    return base;
  }, [mode, formula, localKeys, otherNames, keysByName]);

  const constantValid = mode !== "constant" || isConstant(constant);

  const selfRef = useMemo(
    () => !!header && mode === "formula" && result?.ok === true && fieldRefs(formula).includes(header.key),
    [header, mode, result, formula],
  );

  const save = async () => {
    if (!header) return;
    let expr = "";
    if (mode === "constant") {
      if (!isConstant(constant)) { toast.error("Enter a number, e.g. 1000."); return; }
      expr = constant.trim();
    } else if (mode === "formula") {
      if (!result || !result.ok) { toast.error(result?.error ?? "Invalid formula."); return; }
      expr = formula.trim();
    }

    const next: CriterionHeader[] = currentHeaders.map((h) => {
      if (h.key !== header.key) return h;
      const base = { ...h } as CriterionHeader;
      delete (base as Partial<CriterionHeader>).formula;
      delete (base as Partial<CriterionHeader>).round;
      if (mode !== "off" && expr) {
        base.formula = expr;
        base.round = round.trim() === "" ? DEFAULT_ROUND : Math.max(0, parseInt(round, 10) || 0);
      }
      return base;
    });
    setSaving(true);
    const res = await updateCriterion(criterion.id, { headers: next });
    setSaving(false);
    if (res.ok && res.data) {
      onSaved(res.data);
      onRecomputed?.();
      toast.success(mode === "off" ? "Formula removed." : "Saved — evidence re-synced.");
      onOpenChange(false);
    } else {
      toast.error(res.error ?? "Could not save.");
    }
  };

  const Tab = ({ m, label }: { m: Mode; label: string }) => (
    <button
      type="button" onClick={() => setMode(m)}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
        mode === m ? "border-[#27aae1] bg-[#27aae1] text-white" : "border-slate-300 bg-white text-slate-600 hover:border-[#27aae1]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#27aae1]">
            <Calculator className="h-5 w-5" /> {header?.label}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {criterion.criteria} · <code className="rounded bg-slate-100 px-1 text-xs">{header?.key}</code>
          </p>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Tab m="off" label="Entered manually" />
          <Tab m="constant" label="Fixed value for all rows" />
          <Tab m="formula" label="Formula" />
        </div>

        {mode === "constant" && (
          <div className="space-y-3 py-1">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Value applied to every row</p>
              <Input
                value={constant}
                onChange={(e) => setConstant(e.target.value)}
                placeholder="e.g. 1000"
                className={constantValid ? "" : "border-red-300"}
              />
              {!constantValid && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> Enter a plain number.
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Round to</span>
              <input
                type="number" min={0} value={round} placeholder={String(DEFAULT_ROUND)}
                onChange={(e) => setRound(e.target.value)}
                className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
              />
              <span className="text-xs text-slate-400">dp</span>
            </div>
            <p className="flex items-start gap-1 text-[11px] text-slate-400">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Every evidence row for this criterion gets this value. It overwrites anything uploaded into
              this column and re-syncs immediately. Fields that reference this one pick up the constant too.
            </p>
          </div>
        )}

        {mode === "formula" && (
          <div className="space-y-4 py-1">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Formula</p>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder={`e.g.  est_target_population / obs_morbidity   ·   nz(est_target_population)   ·   ref("Burden of Disease (Mortality)", "estimated_target_population")`}
                className={`w-full min-h-[64px] rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${
                  result && !result.ok ? "border-red-300" : "border-slate-300"
                }`}
              />
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Round to</span>
                  <input
                    type="number" min={0} value={round} placeholder={String(DEFAULT_ROUND)}
                    onChange={(e) => setRound(e.target.value)}
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                  />
                  <span className="text-xs text-slate-400">dp</span>
                </div>
                {result && (result.ok ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Valid{result.crossRefs.length ? ` · uses ${result.crossRefs.join(", ")}` : ""}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" /> {result.error}
                  </span>
                ))}
              </div>
              {selfRef && (
                <p className="mt-1.5 flex items-start gap-1 text-[11px] text-amber-600">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  This references its own field ({header?.key}). It reads the raw uploaded value, but
                  because the result is stored back into the same field it isn’t stable across re-uploads
                  unless the value is re-supplied each time. For a percentage that must survive re-runs,
                  keep the raw input and the computed % as two separate labels.
                </p>
              )}
            </div>

            <div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" placeholder="Search fields — name or criterion…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="max-h-56 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-slate-400">No matching fields.</p>
                ) : (
                  filtered.map((o, i) => (
                    <button
                      key={`${o.criterionName}-${o.key}-${i}`} type="button" onClick={() => insert(o.snippet)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-700">
                          {o.label}
                          {o.isSelf && <span className="ml-1 text-[10px] text-amber-500">(this field)</span>}
                        </span>
                        <span className="block truncate text-[11px] text-slate-400">
                          {o.criterionName}{o.isCurrent ? " · this criterion" : ""}
                        </span>
                      </span>
                      <code className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {o.isCurrent ? o.key : "ref"}
                      </code>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* quick-insert functions, incl. blank-handling (nz / coalesce / ifnull) */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Blanks</span>
                <button
                  type="button"
                  onClick={() => setFormula((f) => (f.trim() ? `nz(${f.trim()})` : `nz(${sampleField})`))}
                  className="rounded-full border border-[#fe7105]/40 bg-[#fe7105]/5 px-2 py-0.5 text-[11px] text-[#c65600] hover:border-[#fe7105]"
                >
                  wrap in nz( ) → treat blanks as 0
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Functions</span>
                {FN_CHIPS.map((fn) => (
                  <button
                    key={fn.label}
                    type="button"
                    title={fn.note}
                    onClick={() => insert(fn.snippet)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 hover:border-[#27aae1]"
                  >
                    {fn.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Functions: {FORMULA_FUNCTIONS.join(", ")}. Operators + − * / % ^, comparisons, and{" "}
              <code className="rounded bg-slate-100 px-1">cond ? a : b</code>. A blank input leaves the result
              as “—”; wrap it to fill instead —{" "}
              <code className="rounded bg-slate-100 px-1">nz(est_target_population)</code> is 0 when blank,{" "}
              <code className="rounded bg-slate-100 px-1">coalesce(a, b)</code> takes the first that has a value.
              Cross-criterion <code className="rounded bg-slate-100 px-1">ref()</code> values default to 0 when missing.
            </p>
          </div>
        )}

        {mode === "off" && (
          <p className="py-2 text-sm text-slate-500">
            This field is filled from uploads or the row editor. Switch to <strong>Fixed value</strong> to set
            one number for every row, or <strong>Formula</strong> to compute it.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white"
            disabled={saving || (mode === "constant" && !constantValid)} onClick={save}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
            {mode === "off" ? "Remove formula" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}