"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, Loader2, Link2,
} from "lucide-react";
import { toast } from "react-toastify";

import { getInterventions, getNationalPrograms } from "@/app/api/new/search";
import { bulkUploadPhases, errMsg } from "@/app/api/new/intervention-phase";
import { InterventionPhase } from "@/types/new/intervention-phase";
import { ColRole, ParsedSheet, parseSpreadsheet } from "../../benefits-package/packages/handler";
import { autoMap, buildRows, downloadTemplate, exportUnmatched, matchRows, PhaseRow, toPayload, unmappedRequired } from "./handler";

const ROLES: { value: ColRole; label: string }[] = [
  { value: "ignore", label: "Ignore" },
  { value: "name", label: "Phase name" },
  { value: "reference", label: "Reference" },
];

export function BulkUploadPhases({
  open, onClose, onComplete, phases,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  phases: InterventionPhase[];
}) {
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, ColRole>>({});
  const [rows, setRows] = useState<PhaseRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const reset = () => { setParsed(null); setMapping({}); setRows([]); };
  const close = () => { reset(); onClose(); };

  const ingest = useCallback(async (file: File) => {
    setBusy(true);
    try {
      const [sheet, ivs, pgs] = await Promise.all([
        parseSpreadsheet(file), getInterventions(), getNationalPrograms(),
      ]);
      if (!sheet.columns.length) { toast.error("No columns found in the file."); return; }
      const m = autoMap(sheet);
      setParsed(sheet); setMapping(m);
      setRows(matchRows(buildRows(sheet, m), ivs, pgs, phases));
    } catch (e: any) {
      toast.error(errMsg(e, "Could not read the spreadsheet."));
    } finally { setBusy(false); }
  }, [phases]);

  const remap = useCallback(async (next: Record<string, ColRole>) => {
    if (!parsed) return;
    const [ivs, pgs] = await Promise.all([getInterventions(), getNationalPrograms()]);
    setRows(matchRows(buildRows(parsed, next), ivs, pgs, phases));
  }, [parsed, phases]);

  const setRole = (key: string, role: ColRole) => {
    const next: Record<string, ColRole> = { ...mapping };
    if (role === "name" || role === "reference") {
      for (const k of Object.keys(next)) if (next[k] === role) next[k] = "ignore";
    }
    next[key] = role;
    setMapping(next); remap(next);
  };

  const missing = useMemo(() => unmappedRequired(mapping), [mapping]);
  const valid = useMemo(() => rows.filter((r) => !r.errors.length), [rows]);
  const invalid = rows.length - valid.length;

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) ingest(f);
  };

  const submit = async () => {
    if (!valid.length) { toast.error("No valid rows to link."); return; }
    setSubmitting(true);
    try {
      const res = await bulkUploadPhases(valid.map(toPayload));
      toast.success(`${res.attached.length} linked${res.errors.length ? `, ${res.errors.length} failed` : ""}.`);
      onComplete(); close();
    } catch (e: any) {
      toast.error(errMsg(e, "Bulk link failed."));
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#27aae1]" /> Bulk link to phases
          </DialogTitle>
        </DialogHeader>

        {!parsed ? (
          <div className="space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed py-12 text-center transition-colors ${dragging ? "border-[#27aae1] bg-[#27aae1]/5" : "border-slate-200"}`}
            >
              {busy ? <Loader2 className="h-6 w-6 animate-spin text-[#27aae1]" /> : <FileSpreadsheet className="h-6 w-6 text-slate-400" />}
              <p className="text-sm text-slate-600">Drop a .xlsx or .csv with a phase & reference column, or</p>
              <label className="cursor-pointer text-sm font-medium text-[#27aae1] hover:underline">
                browse
                <input type="file" accept=".xlsx,.csv" className="hidden"
                  onChange={(e) => e.target.files?.[0] && ingest(e.target.files[0])} />
              </label>
            </div>
            <button onClick={() => downloadTemplate()} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <Download className="h-3.5 w-3.5" /> Download template
            </button>
            {phases.length === 0 && (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" /> No phases exist yet — create one before linking.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-slate-200">
              <p className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Map columns</p>
              <div className="divide-y divide-slate-100">
                {parsed.columns.map((c) => (
                  <div key={c.key} className="flex items-center gap-2 px-3 py-2">
                    <span className="w-48 truncate text-sm text-slate-700" title={c.key}>{c.key}</span>
                    <select
                      value={mapping[c.key] ?? "ignore"}
                      onChange={(e) => setRole(c.key, e.target.value as ColRole)}
                      className="h-8 border border-slate-200 px-2 text-sm"
                    >
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {missing.length > 0 && (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> Map a column for: {missing.join(", ")}
              </p>
            )}

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-8 px-2 py-2" />
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phase</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reference</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const nameErr = r.errors.find((e) => e.target === "name");
                    const refErr = r.errors.find((e) => e.target === "reference");
                    return (
                      <tr key={r.index} className={r.errors.length ? "bg-red-50/40" : ""}>
                        <td className="px-2 py-2 text-center">
                          {r.errors.length
                            ? <AlertCircle className="mx-auto h-4 w-4 text-red-500" />
                            : <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />}
                        </td>
                        <td className="px-3 py-2">
                          <span className={nameErr ? "text-red-500" : "text-slate-700"}>{r.name || "—"}</span>
                          {nameErr && <span className="block text-[11px] text-red-400">{nameErr.message}</span>}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-600">{r.reference || <span className="text-slate-300">—</span>}</td>
                        <td className="px-3 py-2 text-xs">
                          {r.match
                            ? <span className="rounded bg-[#27aae1]/10 px-2 py-0.5 text-[#27aae1]">{r.match.kind}</span>
                            : <span className="text-red-500">{refErr?.message ?? "—"}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-slate-500">
                {valid.length} ready{invalid > 0 && <> · <span className="text-red-600">{invalid} with errors</span></>}
              </span>
              <div className="flex items-center gap-2">
                {invalid > 0 && (
                  <Button variant="outline" size="sm" onClick={() => exportUnmatched(rows)}>
                    <Download className="h-4 w-4 mr-2" /> Export errors
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={reset}><X className="h-4 w-4 mr-2" /> Start over</Button>
                <Button size="sm" disabled={!valid.length || !!missing.length || submitting}
                  style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={submit}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Link {valid.length}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}