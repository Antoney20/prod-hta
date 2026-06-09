"use client";

import { useState, useMemo, useRef } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, FileSpreadsheet, Download, ArrowLeft, AlertTriangle,
  CheckCircle2, Loader2, X,
} from "lucide-react";
import { toast } from "react-toastify";

import { NationalProgram } from "@/types/new/program";
import { createProposal } from "@/app/api/new/programs";
import {
   buildTargets, autoMap, unmappedRequired, buildRows,
  downloadTemplate, ParsedSheet, MapTarget, RowResult,
 parseSpreadsheet } from "./handler";

type Step = "upload" | "map" | "review" | "importing";

interface Props {
  open: boolean;
  onClose: () => void;
  program: NationalProgram | null;
  onComplete: () => void;
}

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

  const reset = () => {
    setStep("upload");
    setFileName("");
    setParsed(null);
    setMapping({});
    setProgress({ done: 0, total: 0, ok: 0, fail: 0 });
    setBusy(false);
  };

  const close = () => { reset(); onClose(); };

  const handleFile = async (file?: File | null) => {
    if (!file || !program) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.headers.length) {
        toast.error("Could not read any columns from that file.");
        return;
      }
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

  const runImport = async () => {
    if (!program) return;
    setStep("importing");
    setProgress({ done: 0, total: valid.length, ok: 0, fail: 0 });
    let ok = 0, fail = 0;
    // sequential keeps reference-number allocation clean and gives live progress
    for (const r of valid) {
      const res = await createProposal({
        program: program.id,
        title: r.title,
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

  const headerOptions = parsed?.headers ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
     <DialogContent className=" sm:max-w-3xl lg:max-w-7xl xl:container min-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#27aae1]" />
            Bulk Import — {program?.name ?? "Program"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1 — upload */}
        {step === "upload" && (
          <div className="space-y-4 ">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-12 text-center transition-colors hover:border-[#27aae1] hover:bg-[#27aae1]/5"
            >
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
              <p className="text-sm font-medium text-slate-700">Drop an Excel/CSV file here, or click to browse</p>
              <p className="text-xs text-slate-400">.xlsx, .xls or .csv — first row must be column headers</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
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

        {/* STEP 2 — map columns */}
        {step === "map" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium">{fileName}</span> — match each program field to a column from your file.
            </p>

            {missingRequired.length > 0 && (
              <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Required field{missingRequired.length !== 1 ? "s" : ""} not mapped: {missingRequired.map((t) => t.label).join(", ")}.</span>
              </div>
            )}

            <div className="space-y-2">
              {targets.map((t) => {
                const missing = t.required && !mapping[t.key];
                return (
                  <div key={t.key} className="flex items-center gap-3">
                    <div className="w-48 shrink-0 text-sm">
                      <span className={missing ? "text-red-600" : "text-slate-700"}>{t.label}</span>
                      {t.required && <span className="text-red-500"> *</span>}
                      <span className="ml-1 text-[10px] uppercase text-slate-400">{t.type}</span>
                    </div>
                    <select
                      value={mapping[t.key] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                      className={`flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${missing ? "border-red-300" : "border-gray-300"}`}
                    >
                      <option value="">— not mapped —</option>
                      {headerOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">{parsed?.rows.length ?? 0} data row(s) detected.</p>
          </div>
        )}

        {/* STEP 3 — review */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-green-700">
                <CheckCircle2 className="h-4 w-4" /> {valid.length} valid
              </span>
              {invalid.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-red-600">
                  <AlertTriangle className="h-4 w-4" /> {invalid.length} with errors (will be skipped)
                </span>
              )}
            </div>

            {invalid.length > 0 && (
              <div className=" overflow-y-auto border border-red-100 bg-red-50/50 p-2 text-xs">
                {invalid.map((r) => (
                  <div key={r.index} className="py-1 border-b border-red-100 last:border-0">
                    <span className="font-mono font-semibold text-red-700">Row {r.index}</span>
                    <span className="text-red-600"> — {r.errors.map((e) => e.message).join("; ")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* preview of valid rows */}
            <div className="overflow-x-auto border border-slate-200 max-h-98">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-400">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Title</th>
                    {targets.filter((t) => !t.special).slice(0, 4).map((t) => (
                      <th key={t.key} className="px-2 py-1.5 text-left font-semibold text-slate-400">{t.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valid.slice(0, 50).map((r) => (
                    <tr key={r.index}>
                      <td className="px-2 py-1.5 text-slate-400 font-mono">{r.index}</td>
                      <td className="px-2 py-1.5 text-slate-700 max-w-40 truncate">{r.title}</td>
                      {targets.filter((t) => !t.special).slice(0, 4).map((t) => (
                        <td key={t.key} className="px-2 py-1.5 text-slate-500 max-w-32 truncate">
                          {Array.isArray(r.data[t.key]) ? (r.data[t.key] as any[]).join(", ") : String(r.data[t.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {valid.length > 50 && <p className="text-xs text-slate-400">Showing first 50 of {valid.length}.</p>}
          </div>
        )}

        {/* STEP 4 — importing */}
        {step === "importing" && (
          <div className="space-y-3 py-6">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#27aae1]" />
              Importing {progress.done} / {progress.total}…
            </div>
            <div className="h-2 w-full bg-slate-100 overflow-hidden rounded">
              <div
                className="h-full bg-[#27aae1] transition-all"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{progress.ok} imported · {progress.fail} failed</p>
          </div>
        )}

        <DialogFooter>
          {step === "map" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                disabled={missingRequired.length > 0 || (parsed?.rows.length ?? 0) === 0}
                style={{ backgroundColor: "#27aae1" }}
                className="text-white"
              >
                Review {parsed?.rows.length ?? 0} rows
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("map")}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to mapping
              </Button>
              <Button onClick={runImport} disabled={valid.length === 0} style={{ backgroundColor: "#27aae1" }} className="text-white">
                Import {valid.length} valid row{valid.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {(step === "upload") && (
            <Button variant="outline" onClick={close}><X className="h-4 w-4 mr-1.5" /> Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}