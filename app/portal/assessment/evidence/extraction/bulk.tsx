"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, FileSpreadsheet, Download, ArrowLeft, AlertTriangle,
  CheckCircle2, Loader2, X, ChevronRight, Link2Off, Database,
} from "lucide-react";
import { toast } from "react-toastify";

import { EvidenceCriterion } from "@/types/new/evidence-extraction";
import { EvidenceInterventionRef } from "@/types/new/assessment";
import { ProgramProposal } from "@/types/new/program";
import { getInterventions, getNationalPrograms } from "@/app/api/new/search";

import {
  buildTargets, autoMap, unmappedRequired, buildRows, matchRows, toPayload,
  exportUnmatched, exportFailed, downloadTemplate,
  ParsedSheet, MapTarget, ExtractionRow, parseSpreadsheet,
} from "./handler";
import { createEvidenceExtraction } from "@/app/api/new/evidence-extraction";

type Step = "upload" | "map" | "precheck" | "importing" | "done";
interface Props { open: boolean; onClose: () => void; criteria: EvidenceCriterion[]; onComplete: () => void; }

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map & review" },
  { key: "precheck", label: "Pre-check links" },
  { key: "importing", label: "Submit" },
  { key: "done", label: "Result" },
];

type FailedRow = { row: ExtractionRow; error: string };

// Tolerate any shape getInterventions / getNationalPrograms might hand back:
// a plain array, a DRF envelope {results: []}, or a wrapped {data: []}.
const asList = <T,>(v: any): T[] =>
  Array.isArray(v) ? v
  : Array.isArray(v?.results) ? v.results
  : Array.isArray(v?.data) ? v.data
  : Array.isArray(v?.data?.results) ? v.data.results
  : [];

// a linked id must be a real UUID — never NaN / blank (guards against a coercion upstream)
const validId = (v: unknown) =>
  v != null && v !== "" && String(v) !== "NaN" && !(typeof v === "number" && Number.isNaN(v));

// DRF errors arrive as {field: [msg]} — flatten to a readable line
const errText = (e: any): string => {
  const m = e?.message ?? e?.response?.data?.message ?? e;
  if (typeof m === "string") return m;
  if (m && typeof m === "object") {
    return Object.entries(m)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
      .join("; ");
  }
  return "Unknown error";
};

export function BulkUploadEvidence({ open, onClose, criteria, onComplete }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [interventions, setInterventions] = useState<EvidenceInterventionRef[]>([]);
  const [programs, setPrograms] = useState<ProgramProposal[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, ok: 0, fail: 0 });
  const [failed, setFailed] = useState<FailedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setRefsLoading(true);
    Promise.all([getInterventions(), getNationalPrograms()])
      .then(([iv, pr]) => {
        setInterventions(asList<EvidenceInterventionRef>(iv));
        setPrograms(asList<ProgramProposal>(pr));
      })
      .finally(() => setRefsLoading(false));
  }, [open]);

  const targets: MapTarget[] = useMemo(() => buildTargets(criteria), [criteria]);
  const rows: ExtractionRow[] = useMemo(
    () => (parsed ? buildRows(parsed, mapping, targets) : []),
    [parsed, mapping, targets],
  );
  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.filter((r) => r.errors.length > 0);
  const missingRequired = unmappedRequired(targets, mapping);
  const headerOptions = parsed?.headers ?? [];

  // pre-check: which valid rows resolve to a real intervention / program (with a usable id)
  const checked = useMemo(() => matchRows(valid, interventions, programs), [valid, interventions, programs]);
  const matched = checked.filter((r) => r.match && validId(r.match.id));
  const unmatched = checked.filter((r) => !r.match || !validId(r.match?.id));

  const reset = () => {
    setStep("upload"); setFileName(""); setParsed(null); setMapping({});
    setProgress({ done: 0, total: 0, ok: 0, fail: 0 }); setFailed([]); setBusy(false);
  };
  const close = () => { reset(); onClose(); };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.headers.length) { toast.error("Could not read any columns from that file."); return; }
      setFileName(file.name);
      setParsed(sheet);
      setMapping(autoMap(sheet, targets));
      setStep("map");
    } catch {
      toast.error("Failed to parse the file. Use .xlsx or .csv.");
    } finally { setBusy(false); }
  };

  const runImport = async () => {
    setStep("importing");
    setProgress({ done: 0, total: matched.length, ok: 0, fail: 0 });
    const fails: FailedRow[] = [];
    let ok = 0, fail = 0;
    for (const r of matched) {
      try {
        await createEvidenceExtraction(toPayload(r));
        ok++;
      } catch (e) {
        fail++;
        fails.push({ row: r, error: errText(e) });
      }
      setProgress({ done: ok + fail, total: matched.length, ok, fail });
    }
    setFailed(fails);
    if (ok) toast.success(`${ok} extraction${ok !== 1 ? "s" : ""} saved.`);
    if (fail) toast.error(`${fail} row${fail !== 1 ? "s" : ""} failed.`);
    onComplete();
    if (fails.length) setStep("done"); else close();
  };

  const activeIdx = STEPS.findIndex((s) => s.key === step);

  // visible ref-source counter — if interventions reads 0, the bug is in getInterventions, not here
  const RefCounter = () => (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <Database className="h-3.5 w-3.5" />
      {refsLoading
        ? "loading references…"
        : <>{interventions.length} intervention{interventions.length !== 1 ? "s" : ""} · {programs.length} program{programs.length !== 1 ? "s" : ""} loaded</>}
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#27aae1]" /> Bulk import evidence
          </DialogTitle>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 ${i === activeIdx ? "font-semibold text-[#27aae1]" : i < activeIdx ? "text-slate-500" : "text-slate-300"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i <= activeIdx ? "text-white" : "bg-slate-100 text-slate-400"}`}
                  style={i <= activeIdx ? { backgroundColor: "#27aae1" } : undefined}>{i + 1}</span>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>

        {/* STEP 1 — upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-14 text-center hover:border-[#27aae1] hover:bg-[#27aae1]/5">
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
              <p className="text-sm font-medium text-slate-700">Drop an Excel/CSV file here, or click to browse</p>
              <p className="text-xs text-slate-400">First row must be column headers — one column per criterion variable</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => downloadTemplate(criteria)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#27aae1] hover:underline">
                <Download className="h-3.5 w-3.5" /> Download a template with the right columns
              </button>
              <RefCounter />
            </div>
          </div>
        )}

        {/* STEP 2 — map */}
        {step === "map" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-600">{fileName}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />{valid.length} valid</span>
                {invalid.length > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{invalid.length} with errors</span>}
                <span className="text-slate-400">{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Match columns to fields</p>
                <RefCounter />
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                {targets.map((t) => {
                  const missing = t.required && !mapping[t.key];
                  return (
                    <div key={t.key} className="flex items-center gap-3">
                      <div className="flex w-40 shrink-0 flex-col leading-tight" title={`${t.group} · ${t.label}`}>
                        <span className="truncate text-[10px] uppercase tracking-wide text-slate-400">{t.group}</span>
                        <span className={`truncate text-sm ${missing ? "text-red-600" : "text-slate-700"}`}>
                          {t.label}{t.required && <span className="text-red-500"> *</span>}
                        </span>
                      </div>
                      <select
                        value={mapping[t.key] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                        className={`min-w-0 flex-1 border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${missing ? "border-red-300" : "border-slate-300"}`}
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
          </div>
        )}

        {/* STEP 3 — pre-check links */}
        {step === "precheck" && (
          <div className="space-y-4">
            <div className="flex justify-end"><RefCounter /></div>

            {!refsLoading && interventions.length === 0 && (
              <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>No interventions were loaded, so every <code>INTERV-…</code> reference will be unmatched. Check that <code>getInterventions()</code> reads the paginated <code>results</code> array.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-green-200 bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-700">{matched.length}</p>
                <p className="text-xs text-green-700">matched to an intervention / program</p>
              </div>
              <div className="border border-red-200 bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-700">{unmatched.length}</p>
                <p className="text-xs text-red-700">no matching record — will be skipped</p>
              </div>
            </div>

            {unmatched.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Link2Off className="h-3.5 w-3.5" /> Unmatched references
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => exportUnmatched(unmatched, targets)}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Export unmatched
                  </Button>
                </div>
                <div className="max-h-56 overflow-auto border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr><th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-10">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Reference (no match)</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unmatched.map((r) => (
                        <tr key={r.index}><td className="px-2 py-1 font-mono text-slate-400">{r.index}</td>
                          <td className="px-2 py-1 text-slate-700">{r.reference || <span className="text-slate-300">— blank —</span>}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Fix the references in the exported file and re-upload, or continue and submit only the matched rows.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — importing */}
        {step === "importing" && (
          <div className="space-y-3 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#27aae1]" /> Submitting {progress.done} / {progress.total}…
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div className="h-full bg-[#27aae1] transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-slate-400">{progress.ok} saved · {progress.fail} failed</p>
          </div>
        )}

        {/* STEP 5 — done (only shown when something failed) */}
        {step === "done" && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-green-200 bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-700">{progress.ok}</p>
                <p className="text-xs text-green-700">saved</p>
              </div>
              <div className="border border-red-200 bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-700">{failed.length}</p>
                <p className="text-xs text-red-700">failed — download, fix, re-upload</p>
              </div>
            </div>
            <div className="max-h-64 overflow-auto border border-slate-200">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-10">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Reference</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Why it failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {failed.map((f) => (
                    <tr key={f.row.index}>
                      <td className="px-2 py-1 font-mono text-slate-400">{f.row.index}</td>
                      <td className="px-2 py-1 text-slate-700">{f.row.reference || <span className="text-slate-300">— blank —</span>}</td>
                      <td className="px-2 py-1 text-red-600">{f.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && <Button variant="outline" onClick={close}><X className="h-4 w-4 mr-1.5" /> Cancel</Button>}
          {step === "map" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}><ArrowLeft className="h-4 w-4 mr-1.5" /> Back</Button>
              <Button onClick={() => setStep("precheck")} disabled={valid.length === 0 || missingRequired.length > 0}
                style={{ backgroundColor: "#27aae1" }} className="text-white">
                Pre-check {valid.length} valid row{valid.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {step === "precheck" && (
            <>
              <Button variant="outline" onClick={() => setStep("map")}><ArrowLeft className="h-4 w-4 mr-1.5" /> Back</Button>
              <Button onClick={runImport} disabled={matched.length === 0}
                style={{ backgroundColor: "#27aae1" }} className="text-white">
                Submit {matched.length} matched row{matched.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {step === "done" && (
            <>
              <Button variant="outline" onClick={close}><X className="h-4 w-4 mr-1.5" /> Close</Button>
              {failed.length > 0 && (
                <Button onClick={() => exportFailed(failed, targets)}
                  style={{ backgroundColor: "#27aae1" }} className="text-white">
                  <Download className="h-4 w-4 mr-1.5" /> Download failed rows
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}