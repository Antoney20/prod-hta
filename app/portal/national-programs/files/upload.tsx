"use client";

import { useState, useMemo, useRef } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, FileSpreadsheet, Download, ArrowLeft, AlertTriangle,
  CheckCircle2, Loader2, X, Plus, Trash2, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import { NationalProgram } from "@/types/new/program";
import { createProposal } from "@/app/api/new/programs";
import {
  buildTargets, autoMap, unmappedRequired, buildRows,
  downloadTemplate, ParsedSheet, MapTarget, RowResult, parseSpreadsheet,
} from "./handler";

type Step = "upload" | "map" | "importing";

interface Props {
  open: boolean;
  onClose: () => void;
  program: NationalProgram | null;
  onComplete: () => void;
}

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload file" },
  { key: "map", label: "Map & review" },
  { key: "importing", label: "Import" },
];

export function BulkUpload({ open, onClose, program, onComplete }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState({ done: 0, total: 0, ok: 0, fail: 0 });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const targets: MapTarget[] = useMemo(
    () => (program ? buildTargets(program.field_schema ?? []) : []),
    [program],
  );

  const rows: RowResult[] = useMemo(
    () => (parsed ? buildRows(parsed, mapping, targets) : []),
    [parsed, mapping, targets],
  );
  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.filter((r) => r.errors.length > 0);
  const missingRequired = unmappedRequired(targets, mapping);
  const headerOptions = parsed?.headers ?? [];

  const reset = () => {
    setStep("upload"); setFileName(""); setParsed(null); setMapping({});
    setProgress({ done: 0, total: 0, ok: 0, fail: 0 }); setBusy(false);
  };
  const close = () => { reset(); onClose(); };

  const handleFile = async (file?: File | null) => {
    if (!file || !program) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.headers.length) { toast.error("Could not read any columns from that file."); return; }
      setFileName(file.name);
      setParsed(sheet);
      setMapping(autoMap(sheet.headers, targets));
      setStep("map");
    } catch {
      toast.error("Failed to parse the file. Use .xlsx or .csv.");
    } finally {
      setBusy(false);
    }
  };

  // ---- row editing (operates on the raw header-keyed source rows) ----
  const updateCell = (rowIdx: number, header: string, value: string) =>
    setParsed((p) => {
      if (!p) return p;
      const next = p.rows.slice();
      next[rowIdx] = { ...next[rowIdx], [header]: value };
      return { ...p, rows: next };
    });

  const removeRow = (rowIdx: number) =>
    setParsed((p) => (p ? { ...p, rows: p.rows.filter((_, i) => i !== rowIdx) } : p));

  const addRow = () =>
    setParsed((p) =>
      p ? { ...p, rows: [...p.rows, Object.fromEntries(p.headers.map((h) => [h, ""]))] } : p,
    );

  const runImport = async () => {
    if (!program) return;
    setStep("importing");
    setProgress({ done: 0, total: valid.length, ok: 0, fail: 0 });
    let ok = 0, fail = 0;
    for (const r of valid) {
     const res = await createProposal({
  program: program.id,
  title: r.title,
  justification: r.justification,
  data: r.data,
  submitted_date: r.submitted_date,
});
      if ("error" in res && res.error) fail++; else ok++;
      setProgress({ done: ok + fail, total: valid.length, ok, fail });
    }
    if (ok) toast.success(`${ok} proposal${ok !== 1 ? "s" : ""} imported.`);
    if (fail) toast.error(`${fail} row${fail !== 1 ? "s" : ""} failed to import.`);
    onComplete();
    close();
  };

  const activeIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[96vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#27aae1]" />
            Bulk Import — {program?.name ?? "Program"}
          </DialogTitle>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 ${i === activeIdx ? "font-semibold text-[#27aae1]" : i < activeIdx ? "text-slate-500" : "text-slate-300"}`}>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i <= activeIdx ? "text-white" : "bg-slate-100 text-slate-400"}`}
                  style={i <= activeIdx ? { backgroundColor: "#27aae1" } : undefined}
                >
                  {i + 1}
                </span>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>

        {/* STEP 1 — upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-14 text-center transition-colors hover:border-[#27aae1] hover:bg-[#27aae1]/5"
            >
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
              <p className="text-sm font-medium text-slate-700">Drop an Excel/CSV file here, or click to browse</p>
              <p className="text-xs text-slate-400">.xlsx, .xls or .csv — first row must be column headers</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            <button
              type="button"
              onClick={() => program && downloadTemplate(program)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#27aae1] hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download a template with the right columns
            </button>
          </div>
        )}

        {/* STEP 2 — map + live editable rows */}
        {step === "map" && (
          <div className="space-y-5">
            {/* file + counts */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-600"><span className="font-medium">{fileName}</span></span>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />{valid.length} valid</span>
                {invalid.length > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{invalid.length} with errors</span>}
                <span className="text-slate-400">{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* mapping grid */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Match fields to columns</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {targets.map((t) => {
                  const missing = t.required && !mapping[t.key];
                  return (
                    <div key={t.key} className="flex items-center gap-2">
                      <div className="w-40 shrink-0 truncate text-sm">
                        <span className={missing ? "text-red-600" : "text-slate-700"}>{t.label}</span>
                        {t.required && <span className="text-red-500"> *</span>}
                      </div>
                      <select
                        value={mapping[t.key] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                        className={`flex-1 border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${missing ? "border-red-300" : "border-slate-300"}`}
                      >
                        <option value="">— not mapped —</option>
                        {headerOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
              {missingRequired.length > 0 && (
                <div className="mt-2 flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Required not mapped: {missingRequired.map((t) => t.label).join(", ")}.</span>
                </div>
              )}
            </div>

            {/* live editable rows */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detected rows</p>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add row
                </Button>
              </div>

              {rows.length === 0 ? (
                <div className="border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
                  No rows. Map your columns or add a row manually.
                </div>
              ) : (
                <div className="max-h-96 overflow-auto border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-10">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-8" />
                        {targets.map((t) => (
                          <th key={t.key} className="px-2 py-1.5 text-left font-semibold text-slate-400 whitespace-nowrap">
                            {t.label}{t.required && <span className="text-red-400"> *</span>}
                          </th>
                        ))}
                        <th className="px-2 py-1.5 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r, i) => {
                        const bad = r.errors.length > 0;
                        return (
                          <tr key={i} className={bad ? "bg-red-50/40" : ""}>
                            <td className="px-2 py-1 font-mono text-slate-400">{i + 1}</td>
                            <td className="px-2 py-1">
                              {bad
                                ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-label={r.errors.map((e) => e.message).join("; ")} />
                                : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            </td>
                            {targets.map((t) => {
                              const header = mapping[t.key];
                              const raw = header ? (parsed?.rows[i]?.[header] ?? "") : "";
                              return (
                                <td key={t.key} className="px-1 py-0.5">
                                  {header ? (
                                    <input
                                      value={String(raw)}
                                      onChange={(e) => updateCell(i, header, e.target.value)}
                                      className="w-full min-w-28 bg-transparent px-1 py-1 text-slate-700 focus:bg-[#27aae1]/5 focus:outline-none"
                                    />
                                  ) : (
                                    <span className="px-1 text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1 text-right">
                              <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-600" aria-label="Remove row">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {invalid.length > 0 && (
                <p className="mt-1.5 text-xs text-red-500">Rows with errors are skipped on import — hover the warning icon for details.</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — importing */}
        {step === "importing" && (
          <div className="space-y-3 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#27aae1]" />
              Importing {progress.done} / {progress.total}…
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div className="h-full bg-[#27aae1] transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-slate-400">{progress.ok} imported · {progress.fail} failed</p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={close}><X className="h-4 w-4 mr-1.5" /> Cancel</Button>
          )}
          {step === "map" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <Button
                onClick={runImport}
                disabled={valid.length === 0 || missingRequired.length > 0}
                style={{ backgroundColor: "#27aae1" }}
                className="text-white"
              >
                Import {valid.length} valid row{valid.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}