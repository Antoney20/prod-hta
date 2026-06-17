"use client";


import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildScoringRows, ColumnPlan, invalidRows, ParsedSheet, validRows } from "../cc/file";


interface Props {
  parsed: ParsedSheet;
  plan: ColumnPlan;
  setPlan: (updater: (p: ColumnPlan) => ColumnPlan) => void;
  onBack: () => void;
  onNext: () => void;
}

export function MapStep({ parsed, plan, setPlan, onBack, onNext }: Props) {
  const rows = useMemo(() => buildScoringRows(parsed, plan), [parsed, plan]);
  const ok = validRows(rows);
  const bad = invalidRows(rows);
  const colKeys = parsed.columns.map((c) => c.key);

  const setField = (columnKey: string, patch: Partial<ColumnPlan["fields"][number]>) =>
    setPlan((p) => ({
      ...p,
      fields: p.fields.map((f) => (f.columnKey === columnKey ? { ...f, ...patch } : f)),
    }));

  return (
    <div className="space-y-5">
      {/* ref + kind pickers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["refKey", "kindKey"] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {k === "refKey" ? "Intervention reference *" : "Kind / type *"}
            </span>
            <select
              value={plan[k]}
              onChange={(e) => setPlan((p) => ({ ...p, [k]: e.target.value }))}
              className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
            >
              <option value="">— not mapped —</option>
              {colKeys.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* editable field table */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Field keys (rename to match your protocol)
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> {ok.length} valid
            </span>
            {bad.length > 0 && (
              <span className="inline-flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" /> {bad.length} missing ref/kind
              </span>
            )}
          </div>
        </div>

        <div className="max-h-72 overflow-auto border border-slate-200">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-10">use</th>
                <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Column</th>
                <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Field key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.fields.map((f) => (
                <tr key={f.columnKey}>
                  <td className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={f.include}
                      onChange={(e) => setField(f.columnKey, { include: e.target.checked })}
                    />
                  </td>
                  <td className="px-2 py-1 text-slate-600">{f.columnKey}</td>
                  <td className="px-2 py-1">
                    <input
                      value={f.key}
                      disabled={!f.include}
                      onChange={(e) => setField(f.columnKey, { key: e.target.value })}
                      className="w-full border border-slate-200 px-1.5 py-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#27aae1] disabled:bg-slate-50 disabled:text-slate-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!plan.refKey || !plan.kindKey || ok.length === 0}
          style={{ backgroundColor: "#27aae1" }}
          className="text-white"
        >
          Review {ok.length} row{ok.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}