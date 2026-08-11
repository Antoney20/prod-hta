"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft, ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  PlusCircle,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { bulkUploadEvidence, updateCriterion } from "@/app/api/new/panel/evidence";
import { EvidenceInterventionRef } from "@/types/new/assessment";
import { Criterion, CriterionEvidence, CriterionHeader, } from "@/types/new/evidence-panel";
import { ProgramProposal } from "@/types/new/program";
import {
  autoMap, buildRows, buildTargetIndex,
  downloadTemplate,
  EvidenceRowResult,
  indexEvidenceByTarget,
  ParsedSheet,
  parseSpreadsheet,
  slugKey,
  toEvidenceInput,
} from "./handler";

type Step = "setup" | "upload" | "match" | "review";
const STEPS: { key: Step; label: string }[] = [
  { key: "setup", label: "Set up template" },
  { key: "upload", label: "Upload file" },
  { key: "match", label: "Match & labels" },
  { key: "review", label: "Review & import" },
];

const MULTILINE_HINT =
  /notes?|rationale|justification|background|explanation|description|comment|policies|agenda|\bsource\b|summary|remarks?/i;

const isMultilineLabel = (label: string): boolean =>
  MULTILINE_HINT.test(label);

const labelType = (label: string): CriterionHeader["type"] =>
  isMultilineLabel(label) ? "text" : "text";

interface Props {
  criterion: Criterion;
  interventions: EvidenceInterventionRef[];
  programs: ProgramProposal[];
  existing: CriterionEvidence[];
  onImported: () => void;
  onCriterionChanged: (c: Criterion) => void;
}

export default function UploadWizard({
  criterion, interventions, programs, existing, onImported, onCriterionChanged,
}: Props) {
  const [step, setStep] = useState<Step>("setup");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [refHeader, setRefHeader] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newCols, setNewCols] = useState<string[]>([]);
  const [pickedNew, setPickedNew] = useState<Set<string>>(new Set());
  const [savingLabels, setSavingLabels] = useState(false);
  const [importing, setImporting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const headers = criterion.headers ?? [];
  const targetIndex = useMemo(() => buildTargetIndex(interventions, programs), [interventions, programs]);
  const evidenceIndex = useMemo(() => indexEvidenceByTarget(existing), [existing]);

  const rows: EvidenceRowResult[] = useMemo(() => {
    if (!parsed) return [];
    return buildRows(parsed, refHeader, mapping, headers, targetIndex, evidenceIndex);
  }, [parsed, refHeader, mapping, headers, targetIndex, evidenceIndex]);

  const creates = rows.filter((r) => r.mode === "create");
  const updates = rows.filter((r) => r.mode === "update");
  const errors = rows.filter((r) => r.mode === "error");
  const importable = [...creates, ...updates];

  // targets that appear on more than one importable row — saved as separate rows
  const dupTargetIds = useMemo(() => {
    const c = new Map<string, number>();
    for (const r of importable) if (r.target) c.set(r.target.id, (c.get(r.target.id) ?? 0) + 1);
    return new Set([...c].filter(([, n]) => n > 1).map(([id]) => id));
  }, [importable]);

  const reset = () => {
    setFileName(""); setParsed(null); setRefHeader(""); setMapping({});
    setNewCols([]); setPickedNew(new Set()); setStep("setup");
  };

  useEffect(() => { setStep("setup"); }, [criterion.id]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.headers.length) { toast.error("Couldn't read any columns."); return; }
      const auto = autoMap(sheet.headers, headers);
      setFileName(file.name);
      setParsed(sheet);
      setRefHeader(auto.refHeader);
      setMapping(auto.mapping);
      setNewCols(auto.newColumns);
      setPickedNew(new Set(auto.newColumns));   // pre-select all new by default
      setStep("match");
    } catch {
      toast.error("Failed to parse — use .xlsx or .csv.");
    } finally {
      setBusy(false);
    }
  };

  const addLabels = async () => {
    const additions: CriterionHeader[] = [...pickedNew]
      .filter(Boolean)
      .map((col) => ({ key: slugKey(col), label: col, type: labelType(col) }))
      .filter((h) => h.key && !headers.some((e) => e.key === h.key));

    if (!additions.length) { toast.info("Nothing new to add."); return; }
    setSavingLabels(true);
    const res = await updateCriterion(criterion.id, { headers: [...headers, ...additions] });
    setSavingLabels(false);
    if (res.ok && res.data) {
      onCriterionChanged(res.data);
      setMapping((m) => ({ ...m, ...Object.fromEntries(additions.map((h) => [h.key, h.label])) }));
      setNewCols((c) => c.filter((col) => !pickedNew.has(col)));
      setPickedNew(new Set());
      toast.success(`${additions.length} label${additions.length !== 1 ? "s" : ""} added to criterion.`);
    } else {
      toast.error(res.error ?? "Could not save labels.");
    }
  };

  const runImport = async () => {
    if (!importable.length) return;
    setImporting(true);
    const payload = importable.map((r) => toEvidenceInput(criterion.id, r));
    const res = await bulkUploadEvidence(payload);
    setImporting(false);
    if (res.ok && res.data) {
      const { created, updated, failed } = res.data;
      if (created || updated) toast.success(`${created} created · ${updated} updated.`);
      if (failed?.length) toast.error(`${failed.length} row${failed.length !== 1 ? "s" : ""} failed on the server.`);
      reset();
      onImported();
    } else {
      toast.error(res.error ?? "Import failed.");
    }
  };

const usedKeys = useMemo(() => {
  const s = new Set<string>();
  for (const e of existing) {
    for (const [k, v] of Object.entries(e.data ?? {})) {
      if (v != null && v !== "") s.add(k);
    }
  }
  return s;
}, [existing]);

const removeLabel = async (key: string) => {
  if (usedKeys.has(key)) {
    toast.error("This label has evidence values — clear them first.");
    return;
  }
  setRemoving(key);
  const next = headers.filter((h) => h.key !== key);
  const res = await updateCriterion(criterion.id, { headers: next });
  setRemoving(null);
  if (res.ok && res.data) {
    onCriterionChanged(res.data);
    setMapping((m) => { const n = { ...m }; delete n[key]; return n; });
    toast.success("Label removed.");
  } else {
    toast.error(res.error ?? "Could not remove label.");
  }
};

  const activeIdx = STEPS.findIndex((s) => s.key === step);
  const canImport = importable.length > 0;

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      {/* stepper */}
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-xs sm:gap-2 sm:text-sm">
        {STEPS.map((s, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <div key={s.key} className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => done && setStep(s.key)}
                disabled={!done}
                className={`flex items-center gap-1.5 ${active ? "font-semibold text-[#27aae1]" : done ? "text-slate-600 hover:underline" : "text-slate-300"}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i <= activeIdx ? "text-white" : "bg-slate-200 text-slate-400"}`}
                  style={i <= activeIdx ? { backgroundColor: "#27aae1" } : undefined}
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
            </div>
          );
        })}
      </div>

      <div className="p-5">
        {/* STEP 1 — SETUP */}
        {step === "setup" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#27aae1]/10 p-2"><FileSpreadsheet className="h-5 w-5 text-[#27aae1]" /></div>
              <div>
                <h3 className="font-semibold text-slate-800">Start with the right columns</h3>
                <p className="text-sm text-slate-500">
                  Your template carries a <strong>Reference No.</strong> column has data like (INTERV-... as rows/data),  plus this criterion’s data labels- these are other columns.
                  Missing columns? You can add them after upload.
                </p>
              </div>
            </div>

<div className="border border-slate-200 bg-slate-50/60 p-4">
  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Current data labels</p>
  {headers.length === 0 ? (
    <p className="text-sm text-slate-400">
      None yet — upload a file and we'll detect labels from your columns.
    </p>
  ) : (
    <div className="flex flex-wrap gap-1.5">
      {headers.map((h) => {
        const inUse = usedKeys.has(h.key);
        return (
          <span key={h.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#27aae1]/10 px-2.5 py-1 text-xs font-medium text-[#27aae1]">
            {h.label}
{isMultilineLabel(h.label) && (
  <span
    className="rounded bg-white/60 px-1 text-[10px] text-slate-500"
    title="Multi-line / rich text"
  >
    multiline
  </span>
)}
            {inUse ? (
              <span className="rounded bg-white/60 px-1 text-[10px] text-slate-500" title="In use by evidence — can't remove">
                in use
              </span>
            ) : (
              <button
                type="button"
                onClick={() => removeLabel(h.key)}
                disabled={removing === h.key}
                className="text-[#1d70b8] hover:text-red-500 disabled:opacity-50"
                title="Remove label"
              >
                {removing === h.key
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <X className="h-3 w-3" />}
              </button>
            )}
          </span>
        );
      })}
    </div>
  )}
  {headers.some((h) => usedKeys.has(h.key)) && (
    <p className="mt-2 text-xs text-slate-400">
      Labels marked <span className="font-medium">in use</span> hold evidence values and can't be removed.
      Clear or delete that evidence first.
    </p>
  )}
</div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline"
                onClick={() => downloadTemplate(criterion.criteria, criterion.id, headers)}>
                <Download className="mr-2 h-4 w-4" /> Download template
              </Button>
              <Button style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={() => setStep("upload")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 — UPLOAD */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => document.getElementById("ev-file")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-14 text-center transition-colors hover:border-[#27aae1] hover:bg-[#27aae1]/5"
            >
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
              <p className="text-sm font-medium text-slate-700">Drop your filled file here, or click to browse</p>
              <p className="text-xs text-slate-400">.xlsx, .xls or .csv — first row must be headers</p>
              <input id="ev-file" type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            <Button variant="outline" onClick={() => setStep("setup")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        )}

        {/* STEP 3 — MATCH + NEW LABELS */}
        {step === "match" && parsed && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-600 font-medium">{fileName}</span>
              <span className="text-xs text-slate-400">{parsed.rows.length} rows detected</span>
            </div>

            {/* reference mapping */}
            <div className="border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Reference column (used to match)</p>
              <select value={refHeader} onChange={(e) => setRefHeader(e.target.value)}
                className={`w-full border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${refHeader ? "border-slate-300" : "border-amber-300"}`}>
                <option value="">— not mapped —</option>
                {parsed.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              {!refHeader && <p className="mt-1 text-xs text-amber-600">Without a reference column nothing can be matched.</p>}
            </div>

            {/* known label mapping */}
            {headers.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Match data labels</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {headers.map((h) => (
                    <div key={h.key} className="flex items-center gap-2">
                      <span className="w-36 shrink-0 truncate text-sm text-slate-700">{h.label}</span>
                      <select value={mapping[h.key] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [h.key]: e.target.value }))}
                        className="flex-1 border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
                        <option value="">— not mapped —</option>
                        {parsed.headers.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* new labels detected */}
            {newCols.length > 0 && (
              <div className="border border-[#27aae1]/30 bg-[#27aae1]/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#27aae1]" />
                  <p className="text-sm font-semibold text-slate-700">New columns found in your file</p>
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  These aren’t part of the criterion yet. Pick the ones to add as data labels — they’ll be saved to the criterion and included in every future template. Note-type columns are saved as multi-line (rich-text) fields.
                </p>
                <div className="flex flex-wrap gap-2">
                  {newCols.map((col) => {
                    const on = pickedNew.has(col);
                    return (
                      <button key={col}
                        onClick={() => setPickedNew((s) => { const n = new Set(s); n.has(col) ? n.delete(col) : n.add(col); return n; })}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                          on ? "border-[#27aae1] bg-[#27aae1] text-white" : "border-slate-300 bg-white text-slate-600 hover:border-[#27aae1]"
                        }`}>
                        {on ? <Check className="h-3 w-3" /> : <PlusCircle className="h-3 w-3" />} {col}
                         {isMultilineLabel(col) && (
  <span
    className={`rounded px-1 text-[9px] ${
      on ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
    }`}
  >
    multiline
  </span>
)}
                      </button>
                    );
                  })}
                </div>
                <Button size="sm" className="mt-3 text-white" style={{ backgroundColor: "#27aae1" }}
                  disabled={savingLabels || pickedNew.size === 0} onClick={addLabels}>
                  {savingLabels ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="mr-1.5 h-3.5 w-3.5" />}
                  Add {pickedNew.size} to criterion
                </Button>
              </div>
            )}

            {/* live match summary */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{creates.length} new</span>
              <span className="inline-flex items-center gap-1 text-[#27aae1]"><RefreshCw className="h-3.5 w-3.5" />{updates.length} update</span>
              {errors.length > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{errors.length} unmatched</span>}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button style={{ backgroundColor: "#27aae1" }} className="text-white"
                disabled={!refHeader} onClick={() => setStep("review")}>
                Review <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — REVIEW */}
        {step === "review" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Will create" value={creates.length} tone="emerald" />
              <Stat label="Will update" value={updates.length} tone="blue" />
              <Stat label="Unmatched" value={errors.length} tone="red" />
            </div>

            {importable.length > 0 && (
              <div className="max-h-72 overflow-auto border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Reference</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Target</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Type</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Action</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-400">Fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importable.map((r) => (
                      <tr key={r.index}>
                        <td className="px-2 py-1 font-mono text-slate-600">
                          {r.reference}
                          {r.target && dupTargetIds.has(r.target.id) && (
                            <span
                              className="ml-1 rounded bg-amber-100 px-1 font-sans text-[9px] text-amber-700"
                              title="This reference appears more than once — each occurrence is saved as a separate evidence row"
                            >
                              dup
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-slate-700">{r.target?.name}</td>
                        <td className="px-2 py-1">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${r.target?.kind === "intervention" ? "bg-[#27aae1]/10 text-[#27aae1]" : "bg-amber-50 text-amber-700"}`}>
                            {r.target?.kind === "intervention" ? "Intervention" : "Program"}
                          </span>
                        </td>
                        <td className="px-2 py-1">
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${r.mode === "create" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#27aae1]/30 bg-[#27aae1]/10 text-[#27aae1]"}`}>
                            {r.mode === "create" ? "New" : "Update"}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-slate-400">{Object.keys(r.data).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {errors.length > 0 && (
              <div className="border border-red-200 bg-red-50/60">
                <p className="border-b border-red-100 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-500">
                  {errors.length} row{errors.length !== 1 ? "s" : ""} won’t import — reasons
                </p>
                <div className="max-h-48 overflow-auto divide-y divide-red-100">
                  {errors.map((r) => (
                    <div key={r.index} className="flex items-start gap-2 px-3 py-2 text-xs">
                      <span className="font-mono text-slate-500">#{r.index}</span>
                      <span className="font-mono text-slate-600">{r.reference || "—"}</span>
                      <span className="text-red-600">{r.errors.join("; ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("match")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button style={{ backgroundColor: "#27aae1" }} className="text-white"
                disabled={!canImport || importing} onClick={runImport}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Import {importable.length} row{importable.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "blue" | "red" }) {
  const map = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue: "text-[#27aae1] bg-[#27aae1]/5 border-[#27aae1]/30",
    red: "text-red-600 bg-red-50 border-red-200",
  } as const;
  return (
    <div className={`border p-3 text-center ${map[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}